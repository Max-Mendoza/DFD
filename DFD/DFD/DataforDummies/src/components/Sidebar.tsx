"use client"

import type React from "react"
import axios from "axios"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  LogOut,
  Zap,
  LineChartIcon as ChartLine,
  Bell,
  Check,
  X,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Notification {
  id: number
  title: string
  type: "normal" | "contact_request"
  icon: string
  date: string
  read: boolean
  sender_id?: number
  sender_name?: string
}

interface SidebarLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  isExpanded: boolean
  isActive: boolean
}
// Simple componente de sidebarlink
const SidebarLink = ({ to, icon, label, isExpanded, isActive }: SidebarLinkProps) => {
  return (
    <Link to={to} className="w-full">
      <motion.div
        className={`
          flex items-center px-3 py-3 my-1 rounded-lg
          ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"}
          transition-colors duration-200
        `}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 flex items-center justify-center">{icon}</div>

        {isExpanded && (
          <motion.span
            className="ml-3 font-medium"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  )
}
// componente de notificacion
const NotificationItem = ({
  notification,
  onAccept,
  onReject,
}: {
  notification: Notification
  onAccept?: (id: number) => void
  onReject?: (id: number) => void
}) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "user":
        return <User size={16} />
      case "message":
        return <MessageSquare size={16} />
      case "calendar":
        return <Calendar size={16} />
      default:
        return <Bell size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace un momento"
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      className={`p-3 border-b border-white/10 ${!notification.read ? "bg-white/5" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
          {getIcon(notification.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{notification.title}</p>
          <p className="text-white/60 text-xs mt-1">{formatDate(notification.date)}</p>

          {notification.type === "contact_request" && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onAccept?.(notification.id)}
                className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
              >
                <Check size={12} />
                Aceptar
              </button>
              <button
                onClick={() => onReject?.(notification.id)}
                className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
              >
                <X size={12} />
                Rechazar
              </button>
            </div>
          )}
        </div>
        {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
      </div>
    </motion.div>
  )
}

export default function Sidebar() {
  const { logout } = useAuth()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const sidebarWidth = isExpanded ? "w-64" : "w-16"

  // Función para obtener notificaciones de la API
  // const fetchNotifications = async () => {
  //   try {
  //     setLoading(true)
  //     const response = await axios.get("http://127.0.0.1:8000/notifications/")
  //     setNotifications(response.data)

  //     // Contar notificaciones no leídas
  //     const unread = response.data.filter((notif: Notification) => !notif.read).length
  //     setUnreadCount(unread)
  //   } catch (error) {
  //     console.error("Error fetching notifications:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Función para aceptar solicitud de contacto
  // const handleAcceptContact = async (notificationId: number) => {
  //   try {
  //     await axios.post(`http://127.0.0.1:8000/notifications/${notificationId}/accept/`)
  //     // Actualizar notificaciones después de aceptar
  //     fetchNotifications()
  //   } catch (error) {
  //     console.error("Error accepting contact request:", error)
  //   }
  // }

  // Función para rechazar solicitud de contacto
  // const handleRejectContact = async (notificationId: number) => {
  //   try {
  //     await axios.post(`http://127.0.0.1:8000/notifications/${notificationId}/reject/`)
  //     // Actualizar notificaciones después de rechazar
  //     fetchNotifications()
  //   } catch (error) {
  //     console.error("Error rejecting contact request:", error)
  //   }
  // }

  // Cargar notificaciones al montar el componente
  // useEffect(() => {
  //   fetchNotifications()

  //   // Opcional: Actualizar notificaciones cada 30 segundos
  //   const interval = setInterval(fetchNotifications, 30000)
  //   return () => clearInterval(interval)
  // }, [])
  // Link
  const links = [
    { to: "/home", icon: <Home size={20} />, label: "Inicio" },
    { to: "/users", icon: <Users size={20} />, label: "Usuarios" },
    { to: "/settings", icon: <Settings size={20} />, label: "Configuración" },
  ]

  return (
    <motion.div
      className={`
        h-screen bg-white/0 backdrop-blur-md
        fixed left-0 top-0 z-40
        border-r border-white/10
        flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarWidth}
      `}
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4">
        {isExpanded ? (
          <motion.div
            className="text-white font-bold text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            D4D
          </motion.div>
        ) : (
          <motion.div
            className="text-white font-bold text-xl w-8 h-8 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            D
          </motion.div>
        )}

        <motion.button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </motion.button>
      </div>

      {/* Links de navegacion*/}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="flex flex-col">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isExpanded={isExpanded}
              isActive={location.pathname === link.to}
            />
          ))}
        </nav>
      </div>

      {/* Seccion de notifaciones */}
      <div className="border-t border-white/10 p-3">
        

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && isExpanded && (
            <motion.div
              className="absolute bottom-20 left-0 w-80 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl max-h-96 overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Notificaciones</h3>
                {unreadCount > 0 && <p className="text-white/60 text-sm">{unreadCount} sin leer</p>}
              </div>

              <div className="max-h-80 overflow-y-auto">
                
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <motion.div
          className={`
            flex items-center px-3 py-3 rounded-lg
            text-white/60 hover:bg-white/5 hover:text-white/90
            cursor-pointer
            transition-colors duration-200
          `}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <LogOut size={20} />
          </div>

          {isExpanded && (
            <motion.span
              className="ml-3 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Cerrar Sesión
            </motion.span>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
