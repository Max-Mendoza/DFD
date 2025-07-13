"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Particle from "@utils/particles"

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Usamos un ref para las partículas, ya que se actualizan en cada frame y no necesitamos re-renderizar
  const particlesRef = useRef<Particle[]>([])
  // Ref para almacenar el id de requestAnimationFrame y poder cancelarlo
  const animationFrameIdRef = useRef<number | null>(null)

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  // Función para obtener las dimensiones del documento
  const getDocumentDimensions = useCallback(() => {
    return {
      width: Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
        window.innerWidth
      ),
      height: Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      ),
    }
  }, [])

  // Función para generar partículas basada en las dimensiones
  const createParticles = useCallback((width: number, height: number): Particle[] => {
    const particlesArray: Particle[] = []
    for (let i = 0; i < 60; i++) {
      const size = Math.random() * 1 + 1
      const x = Math.random() * width
      const y = Math.random() * height
      const speedX = Math.random() * 2 - 1
      const speedY = Math.random() * 2 - 1
      const color = "#fff"
      const opacity = Math.random()
      particlesArray.push(new Particle(x, y, size, opacity, speedX, speedY, color))
    }
    return particlesArray
  }, [])

  // Función debounce para limitar la frecuencia de actualizaciones en resize/scroll
  const debounce = (func: Function, delay: number) => {
    let timer: number | undefined
    return (...args: any[]) => {
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(() => {
        func(...args)
      }, delay)
    }
  }

  // Efecto para actualizar dimensiones usando debounce
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions(getDocumentDimensions())
    }

    updateDimensions() // actualizar al montar el componente

    const debouncedUpdate = debounce(updateDimensions, 100)
    window.addEventListener("resize", debouncedUpdate)
    window.addEventListener("scroll", debouncedUpdate)

    return () => {
      window.removeEventListener("resize", debouncedUpdate)
      window.removeEventListener("scroll", debouncedUpdate)
    }
  }, [getDocumentDimensions])

  // Inicializar las partículas cada vez que las dimensiones cambian
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      particlesRef.current = createParticles(dimensions.width, dimensions.height)
    }
  }, [dimensions, createParticles])

  // Efecto de animación del canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Actualizamos las dimensiones del canvas
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      particlesRef.current.forEach((particle) => {
        particle.update()

        // Control simple de límites: si la partícula sale de los bordes, la reubica
        if (particle.x < 0) particle.x = dimensions.width
        if (particle.x > dimensions.width) particle.x = 0
        if (particle.y < 0) particle.y = dimensions.height
        if (particle.y > dimensions.height) particle.y = 0

        particle.draw(ctx)
      })

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current)
    }
  }, [dimensions])

  return (
    <div
      className="fixed inset-0"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] z-0"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  )
}
