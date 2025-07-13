"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Trash2, MousePointer, Move } from "lucide-react"
import type { VisualizationConfig, Tables } from "@/types/visualization"
import EChartsChart from "./EChartsChart"

interface DraggableVisualizationProps {
  visualization: VisualizationConfig
  isSelected: boolean
  isEditingInteractions: boolean
  onSelect: () => void
  onDelete: () => void
  onResizeStart: (e: React.MouseEvent, handle: string) => void
  tables: Tables
  globalFilters: Record<string, any>
  applyCrossFilter: (sourceVizId: number, filterField: string, filterValue: any) => void
}

export default function DraggableVisualization({
  visualization,
  isSelected,
  isEditingInteractions,
  onSelect,
  onDelete,
  onResizeStart,
  tables,
  globalFilters,
  applyCrossFilter,
}: DraggableVisualizationProps) {
  return (
    <motion.div
      // Solo hacer draggable cuando se use el handle específico
      drag={false}
      initial={{
        x: visualization.position.x,
        y: visualization.position.y,
      }}
      animate={{
        x: visualization.position.x,
        y: visualization.position.y,
        width: visualization.size.width,
        height: visualization.size.height,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 200,
      }}
      className={`absolute bg-[#250d46]/80 border-2 rounded-lg shadow-lg overflow-hidden flex flex-col ${
        isSelected ? "border-white/60 shadow-xl shadow-purple-900/40 z-10" : "border-[#250d46]/40 hover:border-white/40"
      }`}
      style={{
        width: visualization.size.width,
        height: visualization.size.height,
      }}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="px-3 py-2 flex justify-between items-center border-b border-[#250d46]/40 bg-[#250d46]/60">
        <h3 className="text-sm font-medium text-white truncate flex-1">{visualization.title}</h3>
        <div className="flex items-center gap-1">
          {/* Drag Handle */}
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, top: 0, right: 2000, bottom: 2000 }}
            whileDrag={{
              scale: 1.1,
              cursor: "grabbing",
            }}
            onDragEnd={(event, info) => {
              // Actualizar posición basada en el offset del drag
              const newX = Math.max(0, visualization.position.x + info.offset.x)
              const newY = Math.max(0, visualization.position.y + info.offset.y)

              // Aquí necesitarías una función callback para actualizar la posición
              // Por ahora, esto se manejará en el componente padre
            }}
            className="p-1 rounded hover:bg-[#250d46]/80 text-white/60 hover:text-white cursor-grab active:cursor-grabbing"
            title="Arrastrar visualización"
          >
            <Move size={12} />
          </motion.div>

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
      {isSelected && (
        <>
          <motion.div
            className="absolute bottom-0 right-0 w-3 h-3 bg-white/20 cursor-se-resize hover:bg-white/40"
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart(e, "se")
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 w-3 h-2 bg-white/20 cursor-s-resize transform -translate-x-1/2 hover:bg-white/40"
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart(e, "s")
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <motion.div
            className="absolute right-0 top-1/2 w-2 h-3 bg-white/20 cursor-e-resize transform -translate-y-1/2 hover:bg-white/40"
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart(e, "e")
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </>
      )}
    </motion.div>
  )
}
