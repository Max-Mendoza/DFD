"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, ArrowUpRight, Loader2, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import "katex/dist/katex.min.css"

import axiosInstance from "@/api/axiosInstance"
import { useParams } from "react-router"
import { DataChart } from "@/components/chatbot/Chart"
import Chart from "@/components/chatbot/Chart"

interface ChatMessage {
    sender: "bot" | "user"
    content: string
    chart?: boolean
    timestamp?: Date
    chartData?: DataChart
}

interface ChatbotViewProps {
    isDarkMode: boolean
}

// Componente para mostrar el indicador de carga
const TypingIndicator = ({ isDarkMode }: { isDarkMode: boolean }) => {
    return (
        <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-[#250d46] flex items-center justify-center text-white mr-3 flex-shrink-0">
                <Bot size={16} />
            </div>
            <div
                className={`rounded-lg p-3 max-w-[80%] ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-[#250d46]/60 border border-[#250d46]/40"
                    }`}
            >
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-white/80 text-sm">Escribiendo...</span>
                </div>
            </div>
        </div>
    )
}

const MessageContent = ({ content, isDarkMode }: { content: string; isDarkMode: boolean }) => {
    return (
        <div className={`prose prose-sm max-w-none ${isDarkMode ? "prose-invert" : ""}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                    code: ({ children, className }) => {
                        const isInline = !className
                        return isInline ? (
                            <code
                                className={`px-1 py-0.5 rounded text-xs ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
                                    }`}
                            >
                                {children}
                            </code>
                        ) : (
                            <code
                                className={`block p-2 rounded text-xs ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
                                    }`}
                            >
                                {children}
                            </code>
                        )
                    },
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-white">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-white">{children}</ol>,
                    li: ({ children }) => <li className="mb-1 text-white">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-white">{children}</em>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-white">{children}</h3>,
                    // Tabla mejorada
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border-collapse border border-gray-400 bg-transparent">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-300"}>{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-gray-400">{children}</tr>,
                    th: ({ children }) => (
                        <th
                            className={`border border-gray-400 px-3 py-2 text-left font-semibold text-white ${isDarkMode ? "bg-gray-800" : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td
                            className={`border border-gray-400 px-3 py-2 text-white ${isDarkMode ? "bg-gray-900/50" : "bg-white/10"}`}
                        >
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default function ChatbotView({ isDarkMode }: ChatbotViewProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            sender: "bot",
            content:
                "¡Hola! Soy tu asistente de datos. ¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte con:\n- **Análisis de datos** con fórmulas matemáticas como $\\sum_{i=1}^{n} x_i$\n- **Creación de gráficos** y visualizaciones\n- **Consultas SQL** a tu base de datos\n- **Cálculos estadísticos** como $\\mu = \\frac{1}{n}\\sum_{i=1}^{n} x_i$",
            timestamp: new Date(),
        },
    ])

    const [tool, setTool] = useState<string>("DB")
    const [messageInput, setMessageInput] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { proyectId } = useParams<string>()

    // Reference for chat container
    const chatContainerRef = useRef<HTMLDivElement>(null)

    // Effect to scroll to the last message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatMessages, isLoading])

    // Función mejorada para limpiar y formatear tablas markdown
    function cleanAndFormatMarkdownTables(text: string): string {
        // Primero, reemplazar \n literales con saltos de línea reales
        const cleanedText = text.replace(/\\n/g, "\n")

        // Dividir en líneas para procesar
        const lines = cleanedText.split("\n")
        const processedLines: string[] = []

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim()

            // Si es una línea de tabla (contiene |)
            if (line.includes("|") && line.length > 1) {
                // Limpiar pipes duplicados al final
                line = line.replace(/\|\s*\|+$/, "|")

                // Asegurar que empiece y termine con |
                if (!line.startsWith("|")) {
                    line = "|" + line
                }
                if (!line.endsWith("|")) {
                    line = line + "|"
                }

                // Limpiar espacios extra alrededor de los pipes
                line = line.replace(/\s*\|\s*/g, "|").replace(/\|/g, " | ")

                // Asegurar formato correcto
                if (line.startsWith(" | ")) {
                    line = "|" + line.substring(2)
                }
                if (line.endsWith(" | ")) {
                    line = line.substring(0, line.length - 2) + "|"
                }
            }

            processedLines.push(line)
        }

        return processedLines.join("\n")
    }

    // Function to send a message
    const handleSendMessage = async () => {
        if (!messageInput.trim() || isLoading) return

        const userMessage: ChatMessage = {
            sender: "user",
            content: messageInput,
            timestamp: new Date(),
        }

        setChatMessages((prev) => [...prev, userMessage])
        setIsLoading(true)

        try {
            if (tool === "DB") {
                const response = await axiosInstance.post("/ai/question/", {
                    question: messageInput,
                    project_id: proyectId,
                })

                console.log("Respuesta original:", response.data.final_response)

                const fixedContent = cleanAndFormatMarkdownTables(response.data.final_response)

                console.log("Contenido procesado:", fixedContent)

                const botResponse: ChatMessage = {
                    sender: "bot",
                    content: fixedContent,
                    chart: false,
                    timestamp: new Date(),
                }

                setChatMessages((prev) => [...prev, botResponse])
            } else if (tool === "chart") {
                const response = await axiosInstance.post("/ai/chart/", {
                    question: messageInput,
                    project_id: proyectId,
                })
                console.log("Respuesta original:", response.data.final_response)
                const botChartResponse: ChatMessage = {
                    sender: "bot",
                    content: "Aquí está tu gráfico de ventas por producto.",
                    chart: true,
                    chartData: response.data.final_response,
                    timestamp: new Date(),
                }
                setChatMessages((prev) => [...prev, botChartResponse])

            } else if (tool === "out") {
                // Simulate external analysis
                await new Promise((resolve) => setTimeout(resolve, 2000))

                const botResponse: ChatMessage = {
                    sender: "bot",
                    content: `**Análisis Externo Completado**\n\nHe realizado un análisis comparativo con datos externos. Los resultados muestran:\n\n- **Desviación estándar:** $\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\mu)^2}$\n- **Intervalo de confianza (95%):** $\\bar{x} \\pm 1.96 \\cdot \\frac{\\sigma}{\\sqrt{n}}$\n\n¿Te gustaría que profundice en algún aspecto específico?`,
                    timestamp: new Date(),
                }

                setChatMessages((prev) => [...prev, botResponse])
            }
        } catch (error) {
            console.error("Error sending message:", error)

            const errorResponse: ChatMessage = {
                sender: "bot",
                content: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
                timestamp: new Date(),
            }

            setChatMessages((prev) => [...prev, errorResponse])
        } finally {
            setIsLoading(false)
            setMessageInput("")
        }
    }

    // Function to add chart to dashboard
    const handleAddToDashboard = () => {
        alert("Gráfico añadido al dashboard")
    }

    // Format timestamp
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div
                className={`flex-1 overflow-auto p-4 ${isDarkMode ? "bg-gray-900" : "bg-[#250d46]/80"}`}
                ref={chatContainerRef}
            >
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className={`${isDarkMode ? "bg-gray-800" : "bg-[#250d46]"} text-white rounded-lg shadow-sm p-4 mb-4`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium">Asistente IA</h2>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>En línea</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-white/80">
                            Pregúntame cualquier cosa sobre tus datos. Puedo ayudarte a crear visualizaciones, analizar tendencias o
                            generar informes automáticamente con soporte para fórmulas matemáticas.
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4 mb-4">
                        {chatMessages.map((message, index) => (
                            <div key={index} className={`flex items-start ${message.sender === "bot" ? "" : "justify-end"}`}>
                                {message.sender === "bot" && (
                                    <div className="w-8 h-8 rounded-full bg-[#250d46] flex items-center justify-center text-white mr-3 flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                )}

                                <div className="flex flex-col max-w-[80%]">
                                    <div
                                        className={`rounded-lg p-3 ${message.sender === "bot"
                                            ? isDarkMode
                                                ? "bg-gray-800 border border-gray-700"
                                                : "bg-[#250d46]/60 border border-[#250d46]/40"
                                            : isDarkMode
                                                ? "bg-purple-700 text-white"
                                                : "bg-[#250d46] text-white"
                                            }`}
                                    >
                                        <MessageContent content={message.content} isDarkMode={isDarkMode} />

                                        {message.chart && message.chartData && (
                                            <div className="mt-3">
                                                <Chart data={message.chartData} />
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        className={`text-xs ${isDarkMode ? "text-purple-400" : "text-[#250d46]"} hover:underline flex items-center gap-1 transition-colors duration-200`}
                                                        onClick={handleAddToDashboard}
                                                    >
                                                        <ArrowUpRight size={12} />
                                                        Añadir al dashboard
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Timestamp */}
                                    {message.timestamp && (
                                        <div
                                            className={`text-xs mt-1 ${message.sender === "bot" ? "text-left ml-1" : "text-right mr-1"} text-white/50`}
                                        >
                                            {formatTime(message.timestamp)}
                                        </div>
                                    )}
                                </div>

                                {message.sender === "user" && (
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ml-3 flex-shrink-0 ${isDarkMode ? "bg-purple-700" : "bg-[#250d46]/80"
                                            }`}
                                    >
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-[#250d46] flex items-center justify-center text-white mr-3 flex-shrink-0">
                                    <MessageSquare size={16} />
                                </div>
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-[#250d46]/60 border border-[#250d46]/40"
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.1s" }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.2s" }}
                                            ></div>
                                        </div>
                                        <span className="text-white/80 text-sm">Escribiendo...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input area */}
            <div
                className={`p-4 border-t ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-[#250d46]/20 bg-[#250d46]"
                    } text-white`}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode
                                ? "bg-gray-700 border-gray-600 focus:ring-purple-500/50"
                                : "bg-[#250d46]/80 border-white/30 focus:ring-white/50"
                                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu pregunta aquí..."}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !isLoading) {
                                    handleSendMessage()
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white transition-all duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:text-white/80"
                                }`}
                            onClick={handleSendMessage}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>

                    {/* Suggestions */}
                    <div className="flex justify-center mt-2 flex-col gap-2">
                        <div className="text-xs text-white/80 mt-3">
                            Sugerencias:
                            <button
                                className={`ml-2 px-2 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() =>
                                    !isLoading && setMessageInput("Crear gráfico de ventas mensuales con análisis de tendencia")
                                }
                                disabled={isLoading}
                            >
                                Crear gráfico de ventas mensuales
                            </button>
                            <button
                                className={`ml-2 px-2 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() =>
                                    !isLoading && setMessageInput("creame un grafico en el eje x los nombres de los productos y en el eje y las ventas de los productos")
                                }
                                disabled={isLoading}
                            >
                                creame un grafico en el eje x los nombres de los productos y en el eje y las ventas de los productos
                            </button>


                            
                        </div>

                        {/* Tools */}
                        <div className="text-xs text-white/80">
                            Herramientas:
                            <button
                                className={`ml-2 px-2 py-1 rounded-full text-xs transition-colors duration-200 ${tool === "DB" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => !isLoading && setTool("DB")}
                                disabled={isLoading}
                            >
                                Consulta a la base de datos
                            </button>
                            <button
                                className={`ml-2 px-2 py-1 rounded-full text-xs transition-colors duration-200 ${tool === "chart" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => !isLoading && setTool("chart")}
                                disabled={isLoading}
                            >
                                Crear gráfico
                            </button>
                            <button
                                className={`ml-2 px-2 py-1 rounded-full text-xs transition-colors duration-200 ${tool === "out" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => !isLoading && setTool("out")}
                                disabled={isLoading}
                            >
                                Consulta de análisis externo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
