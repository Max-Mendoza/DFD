"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, X, Smile, AlertCircle, Wifi, WifiOff, ArrowDown, Minimize2 } from "lucide-react"
import axiosInstance from "@/api/axiosInstance"
import { useAuth } from "@/hooks/useAuth"
// Interfaces (mantener las mismas)
interface User {
    id: number
    name?: string
    email?: string
    status: "online" | "offline"
}

interface MessageSender {
    id: number
    username: string
    email?: string
}

interface Message {
    id: number
    content: string
    timestamp: string
    sender: MessageSender
    is_read: boolean
}

interface ChatRoom {
    id: number
}

interface TypingUser {
    id: number
    username: string
}

interface WebSocketMessage {
    type: "message" | "typing" | "user_status" | "messages_read" | "error"
    message?: Message
    is_typing?: boolean
    user_id?: number
    username?: string
    status?: string
    error?: string
}

interface ChatComponentProps {
    user: User
    isOpen: boolean
    onClose: () => void
    currentUserId: number
}

interface MessagesResponse {
    results?: Message[]
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, isOpen, onClose, currentUserId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState<string>("")
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
    const [connectionError, setConnectionError] = useState<string>("")
    const [debugInfo, setDebugInfo] = useState<string[]>([])
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false)
    const [isMinimized, setIsMinimized] = useState<boolean>(false)
    const { user: me } = useAuth()

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef<number>(0)

    // Función para agregar información de debug
    const addDebugInfo = (info: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setDebugInfo((prev) => [...prev.slice(-9), `${timestamp}: ${info}`])
        console.log(`[Chat Debug] ${info}`)
    }

    // Función para obtener o crear la sala de chat
    const getChatRoom = async (): Promise<ChatRoom | null> => {
        try {
            addDebugInfo(`Obteniendo sala de chat para usuario ${user.id}`)
            const response = await axiosInstance.post("/api/chatrooms/", {
                other_user_id: user.id,
            })
            if (response.data) {
                const room: ChatRoom = response.data
                setChatRoom(room)
                addDebugInfo(`Sala obtenida: ${room.id}`)
                return room
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message || "Error desconocido"
            addDebugInfo(`Error obteniendo sala: ${errorMsg}`)
            setConnectionError(`Error obteniendo sala: ${errorMsg}`)
        }
        return null
    }

    // Función para cargar mensajes existentes
    const loadMessages = async (roomId: number): Promise<void> => {
        try {
            addDebugInfo(`Cargando mensajes para sala ${roomId}`)
            const response = await axiosInstance.get(`/api/messages/`, {
                params: { room_id: roomId },
            })

            if (response.data) {
                const messagesData: MessagesResponse = response.data
                let msgs: Message[] = []

                if (Array.isArray(response.data)) {
                    msgs = response.data
                } else if (messagesData.results && Array.isArray(messagesData.results)) {
                    msgs = messagesData.results
                } else {
                    msgs = []
                }

                setMessages(msgs)
                addDebugInfo(`${msgs.length} mensajes cargados`)
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message
            addDebugInfo(`Error cargando mensajes: ${errorMsg}`)
            setMessages([])
        }
    }

    // Conectar WebSocket (mantener la misma lógica)
    const connectWebSocket = (roomId: number): void => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsHost = "localhost:5000"
        const token = localStorage.getItem("access")

        if (!token) {
            addDebugInfo("No hay token de acceso")
            setConnectionError("No hay token de acceso")
            return
        }

        const wsUrl = `${protocol}//${wsHost}/ws/chat/${roomId}/?token=${token}`
        addDebugInfo(`Conectando WebSocket: ${wsUrl}`)

        if (wsRef.current) {
            wsRef.current.close()
        }

        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
            addDebugInfo("WebSocket conectado exitosamente")
            setIsConnected(true)
            setConnectionError("")
            reconnectAttempts.current = 0
        }

        wsRef.current.onmessage = (event: MessageEvent) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data)
                switch (data.type) {
                    case "message":
                        if (data.message) {
                            const senderName =
                                data.message.sender.username || data.message.sender.email || `Usuario ${data.message.sender.id}`
                            addDebugInfo(`Mensaje recibido de ${senderName}`)
                            setMessages((prev) => [...prev, data.message!])
                            if (isOpen && data.message.sender.id !== currentUserId) {
                                markMessagesAsRead()
                            }
                        }
                        break
                    case "typing":
                        if (data.is_typing && data.user_id && data.username) {
                            setTypingUsers((prev) => [
                                ...prev.filter((u) => u.id !== data.user_id),
                                { id: data.user_id!, username: data.username! },
                            ])
                        } else if (data.user_id) {
                            setTypingUsers((prev) => prev.filter((u) => u.id !== data.user_id))
                        }
                        break
                    case "user_status":
                        addDebugInfo(`Usuario ${data.user_id} está ${data.status}`)
                        break
                    case "messages_read":
                        setMessages((prev) =>
                            prev.map((msg) => (msg.sender.id === currentUserId ? { ...msg, is_read: true } : msg)),
                        )
                        break
                    case "error":
                        addDebugInfo(`Error del servidor: ${data.error}`)
                        setConnectionError(data.error || "Error del servidor")
                        break
                    default:
                        addDebugInfo(`Tipo de mensaje desconocido: ${data.type}`)
                }
            } catch (error) {
                addDebugInfo(`Error procesando mensaje WebSocket: ${error}`)
            }
        }

        wsRef.current.onclose = (event: CloseEvent) => {
            addDebugInfo(`WebSocket cerrado. Código: ${event.code}, Razón: ${event.reason}`)
            setIsConnected(false)

            switch (event.code) {
                case 4001:
                    setConnectionError("No autenticado - Token inválido")
                    break
                case 4003:
                    setConnectionError("Sin acceso a esta sala de chat")
                    break
                case 1006:
                    setConnectionError("Conexión perdida - Reintentando...")
                    attemptReconnect(roomId)
                    break
                default:
                    setConnectionError(`Conexión cerrada (${event.code})`)
                    if (event.code !== 1000) {
                        attemptReconnect(roomId)
                    }
            }
        }

        wsRef.current.onerror = (error: Event) => {
            addDebugInfo(`Error WebSocket: ${error}`)
            setConnectionError("Error de conexión WebSocket")
        }
    }

    // Función para reintentar conexión
    const attemptReconnect = (roomId: number): void => {
        if (reconnectAttempts.current < 5) {
            reconnectAttempts.current++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
            addDebugInfo(`Reintentando conexión en ${delay}ms (intento ${reconnectAttempts.current})`)
            reconnectTimeoutRef.current = setTimeout(() => {
                if (isOpen) {
                    connectWebSocket(roomId)
                }
            }, delay)
        } else {
            addDebugInfo("Máximo de reintentos alcanzado")
            setConnectionError("No se pudo reconectar. Refresca la página.")
        }
    }

    const sendMessage = (): void => {
        if (newMessage.trim() && wsRef.current && isConnected) {
            addDebugInfo(`Enviando mensaje: ${newMessage.substring(0, 20)}...`)
            wsRef.current.send(
                JSON.stringify({
                    action: "send_message",
                    content: newMessage.trim(),
                }),
            )
            setNewMessage("")
            stopTyping()
        }
    }

    const handleTyping = (): void => {
        if (!isTyping && wsRef.current && isConnected) {
            setIsTyping(true)
            wsRef.current.send(JSON.stringify({ action: "typing" }))
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping()
        }, 2000)
    }

    const stopTyping = (): void => {
        if (isTyping && wsRef.current && isConnected) {
            setIsTyping(false)
            wsRef.current.send(JSON.stringify({ action: "stop_typing" }))
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
    }

    const markMessagesAsRead = (): void => {
        if (wsRef.current && isConnected && chatRoom) {
            wsRef.current.send(
                JSON.stringify({
                    action: "mark_as_read",
                    room_id: chatRoom.id,
                }),
            )
        }
    }

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleScroll = (): void => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
            setShowScrollButton(!isNearBottom)
        }
    }

    // Efectos (mantener los mismos)
    useEffect(() => {
        if (isOpen && user) {
            addDebugInfo(`Abriendo chat con usuario ${user.id}`)
            addDebugInfo(`Current user ID: ${currentUserId}`)
            getChatRoom().then((room) => {
                if (room) {
                    loadMessages(room.id)
                    connectWebSocket(room.id)
                }
            })
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000)
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [isOpen, user, currentUserId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen) {
            markMessagesAsRead()
        }
    }, [isOpen])

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setNewMessage(e.target.value)
        handleTyping()
    }

    const formatTime = (timestamp: string): string => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Hoy"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Ayer"
        } else {
            return date.toLocaleDateString()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className={`fixed bottom-4 right-4 w-80 bg-white/5 border border-white/10 rounded-xl shadow-2xl z-50 transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                }`}
            style={{ height: isMinimized ? "auto" : "500px" }}
        >
            {/* Header del chat - Estilo Users */}
            <div
                className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 rounded-t-xl cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1E0A3C] ${user.status === "online" ? "bg-green-500" : "bg-gray-500"
                                }`}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{user.name || user.email}</h3>
                        <div className="flex items-center gap-1">
                            {isConnected ? (
                                <Wifi size={10} className="text-green-400" />
                            ) : (
                                <WifiOff size={10} className="text-red-400" />
                            )}
                            <p className="text-white/60 text-xs">{user.status === "online" ? "En línea" : "Desconectado"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMinimized(!isMinimized)
                        }}
                    >
                        <Minimize2 size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onClose()
                        }}
                        className="p-1.5 text-white/60 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Error de conexión */}
                    {connectionError && (
                        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle size={12} />
                            <span className="truncate">{connectionError}</span>
                        </div>
                    )}

                    {/* Área de mensajes */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="h-80 overflow-y-auto p-3 space-y-3 bg-white/5"
                    >
                        {Array.isArray(messages) && messages.length > 0 ? (
                            messages.map((message, index) => {
                                const showDate =
                                    index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

                                const isMyMessage = message.sender.id === me.id
                                console.log(isMyMessage)
                                console.log(message.sender.id)
                                console.log(user.id)
                                const senderName = message.sender.username || message.sender.email || `Usuario ${message.sender.id}`

                                return (
                                    <div key={message.id}>
                                        {showDate && (
                                            <div className="flex justify-center my-2">
                                                <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                                                    {formatDate(message.timestamp)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex mb-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                                            <div className="flex flex-col max-w-[75%]">
                                                {/* Mostrar nombre del sender solo si no es mi mensaje */}
                                                {!isMyMessage && <span className="text-white/60 text-xs mb-1 px-1">{senderName}</span>}
                                                <div
                                                    className={`px-3 py-2 rounded-2xl text-xs break-words ${isMyMessage
                                                            ? "bg-[#9334ea] text-white rounded-br-md"
                                                            : "bg-white/10 text-white border border-white/10 rounded-bl-md"
                                                        }`}
                                                >
                                                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                    <div
                                                        className={`flex items-center mt-1 gap-1 ${isMyMessage ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                                                        {isMyMessage && <span className="text-xs opacity-70">{message.is_read ? "✓✓" : "✓"}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/40">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <Send size={16} />
                                </div>
                                <p className="text-sm font-medium">¡Inicia la conversación!</p>
                                <p className="text-xs text-center">Envía tu primer mensaje</p>
                            </div>
                        )}

                        {/* Indicador de escritura */}
                        {typingUsers.length > 0 && (
                            <div className="flex justify-start mb-2">
                                <div className="bg-white/10 text-white px-3 py-2 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                                            <div
                                                className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.1s" }}
                                            />
                                            <div
                                                className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.2s" }}
                                            />
                                        </div>
                                        <p className="text-xs">
                                            {typingUsers.map((u) => u.username || `Usuario ${u.id}`).join(", ")} escribiendo...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Botón para scroll hacia abajo */}
                    {showScrollButton && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute right-3 bottom-16 p-1.5 bg-[#9334ea] text-white rounded-full shadow-lg hover:bg-[#9334ea]/80 transition-colors"
                        >
                            <ArrowDown size={12} />
                        </button>
                    )}

                    {/* Input de mensaje */}
                    <div className="p-3 border-t border-white/10 bg-white/5 rounded-b-xl">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe un mensaje..."
                                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-3 pr-8 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#9334ea]/50 focus:border-[#9334ea]/50 transition-colors"
                                    disabled={!isConnected}
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                                    <Smile size={14} />
                                </button>
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || !isConnected}
                                className="p-2 bg-[#9334ea] text-white rounded-full hover:bg-[#9334ea]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Panel de debug (solo en desarrollo) */}
                    {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
                        <div className="p-2 bg-gray-900/50 text-xs text-gray-300 max-h-16 overflow-y-auto border-t border-white/10">
                            <div className="font-bold mb-1 text-[#9334ea]">Debug:</div>
                            {debugInfo.slice(-3).map((info, index) => (
                                <div key={index} className="font-mono text-xs truncate">
                                    {info}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ChatComponent
