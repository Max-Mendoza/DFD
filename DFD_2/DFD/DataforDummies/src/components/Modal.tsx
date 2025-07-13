"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { AnimatedButton as Button} from "@/components/Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = "md",
}) => {
  // Estado para manejar el bloqueo del scroll cuando la modal está abierta
  const [isMounted, setIsMounted] = useState(false)

  // Tamaños predefinidos para la modal
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-4",
  }

  // Efecto para bloquear el scroll del body cuando la modal está abierta
  useEffect(() => {
    setIsMounted(true)

    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    // Limpieza al desmontar el componente
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // No renderizar nada durante SSR para evitar problemas de hidratación
  if (!isMounted) return null

  // Si la modal no está abierta, no renderizamos nada
  if (!isOpen) return null

  return (
    <>
      {/* Overlay (fondo oscuro) */}
      {/* 
        FRAMER MOTION: Animación simple del overlay
        - animate: Controla la opacidad directamente
        - transition: Configuración básica de la transición
      */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Contenedor de la modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evita que los clics se propaguen al overlay
      >
        {/* 
          FRAMER MOTION: Animación optimizada del contenedor
          - animate: Controla la escala, opacidad y posición en un solo objeto
          - transition: Configuración simplificada para mejor rendimiento
        */}
        <motion.div
          className={`bg-white dark:bg-[#270E47] rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size]}`}
          animate={{
            scale: isOpen ? 1 : 0.95,
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 10,
          }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.2, // Valor bajo para reducir el rebote y mejorar rendimiento
          }}
        >
          {/* Cabecera de la modal */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              {title && <h2 className="text-xl font-semibold">{title}</h2>}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}

          {/* Contenido de la modal */}
          <div className="p-4">{children}</div>
        </motion.div>
      </div>
    </>
  )
}
