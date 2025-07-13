"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, MousePointer, Move } from "lucide-react"
import type { VisualizationConfig, Tables } from "@/types/visualization"
import EChartsChart from "./EChartsChart"

interface Position {
  x: number
  y: number
}

interface DraggableVisualizationV2Props {
  visualization: VisualizationConfig
  isSelected: boolean
  isEditingInteractions: boolean
  onSelect: () => void
  onDelete: () => void
  onPositionChange: (id: number, x: number, y: number) => void
  onSizeChange: (id: number, width: number, height: number) => void
  tables: Tables
  globalFilters: Record<string, any>
  applyCrossFilter: (sourceVizId: number, filterField: string, filterValue: any) => void
  scale?: number
}

export default function DraggableVisualizationV2({
  visualization,
  isSelected,
  isEditingInteractions,
  onSelect,
  onDelete,
  onPositionChange,
  onSizeChange,
  tables,
  globalFilters,
  applyCrossFilter,
  scale = 1,
}: DraggableVisualizationV2Props) {
  const [position, setPosition] = useState<Position>({
    x: visualization.position.x,
    y: visualization.position.y,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string>("")

  // Update position when visualization position changes
  useEffect(() => {
    setPosition({
      x: visualization.position.x,
      y: visualization.position.y,
    })
  }, [visualization.position.x, visualization.position.y])

  // Handle mouse down to start dragging (solo en el icono Move)
  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    e.stopPropagation()
  }

  // Handle mouse move while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale

    const newPosition = {
      x: Math.max(0, position.x + dx),
      y: Math.max(0, position.y + dy),
    }

    setPosition(newPosition)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })

    onPositionChange(visualization.id, newPosition.x, newPosition.y)
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = visualization.size.width
    const startHeight = visualization.size.height

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      switch (handle) {
        case "se":
          newWidth = Math.max(200, startWidth + deltaX)
          newHeight = Math.max(150, startHeight + deltaY)
          break
        case "s":
          newHeight = Math.max(150, startHeight + deltaY)
          break
        case "e":
          newWidth = Math.max(200, startWidth + deltaX)
          break
      }

      onSizeChange(visualization.id, newWidth, newHeight)
    }

    const handleResizeUp = () => {
      setIsResizing(false)
      setResizeHandle("")
      document.removeEventListener("mousemove", handleResizeMove)
      document.removeEventListener("mouseup", handleResizeUp)
    }

    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeUp)
  }

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, position, scale])

  return (
    <div
      style={{
        position: "absolute",
        left: position.x * scale,
        top: position.y * scale,
        width: visualization.size.width,
        height: visualization.size.height,
        zIndex: isSelected ? 30 : isDragging ? 40 : 10,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
      }}
      onClick={onSelect}
      className={`bg-[#250d46]/80 border-2 rounded-lg shadow-lg overflow-hidden flex flex-col ${
        isSelected ? "border-white/60 shadow-xl shadow-purple-900/40" : "border-[#250d46]/40 hover:border-white/40"
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 flex justify-between items-center border-b border-[#250d46]/40 bg-[#250d46]/60">
        <h3 className="text-sm font-medium text-white truncate flex-1">{visualization.title}</h3>
        <div className="flex items-center gap-1">
          {/* Drag Handle - FIJO en el header */}
          <div
            className="p-1 rounded hover:bg-[#250d46]/80 text-white/60 hover:text-white cursor-move"
            onMouseDown={handleDragMouseDown}
            title="Arrastrar visualización"
          >
            <Move size={12} />
          </div>

          {isEditingInteractions && (
            <button className="p-1 rounded hover:bg-[#250d46]/80 text-blue-400" title="Configurar interacciones">
              <MousePointer size={12} />
            </button>
          )}
          <button
            className="p-1 rounded hover:bg-[#250d46]/80 text-red-400"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 text-white overflow-hidden">
        <EChartsChart
          viz={visualization}
          tables={tables}
          globalFilters={globalFilters}
          applyCrossFilter={applyCrossFilter}
        />
      </div>

      {/* Resize handles */}
      {isSelected && !isDragging && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white/30 cursor-se-resize hover:bg-white/50 rounded-tl-md"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute bottom-0 left-1/2 w-4 h-3 bg-white/30 cursor-s-resize transform -translate-x-1/2 hover:bg-white/50 rounded-t-md"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute right-0 top-1/2 w-3 h-4 bg-white/30 cursor-e-resize transform -translate-y-1/2 hover:bg-white/50 rounded-l-md"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  )
}
