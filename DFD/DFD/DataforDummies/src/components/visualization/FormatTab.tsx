"use client"

import { Eye } from "lucide-react"
import type { VisualizationConfig } from "../../types/visualization"

interface FormatTabProps {
  selectedViz: VisualizationConfig
  dashboardVisualizations: VisualizationConfig[]
  updateVisualizationFormat: (vizId: number, formatPath: string, value: any) => void
  updateVisualizationInteraction: (sourceVizId: number, targetVizId: number, interactionType: string) => void
  isEditingInteractions: boolean
}

export default function FormatTab({
  selectedViz,
  dashboardVisualizations,
  updateVisualizationFormat,
  updateVisualizationInteraction,
  isEditingInteractions,
}: FormatTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-white/90">Formato del visual</h4>

      {/* Título */}
      <div className="border border-[#250d46]/40 rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white">Título</span>
          <button
            onClick={() =>
              updateVisualizationFormat(selectedViz.id, "title.show", !selectedViz.formatOptions.title.show)
            }
          >
            <Eye size={12} className={selectedViz.formatOptions.title.show ? "text-white" : "text-white/40"} />
          </button>
        </div>
        {selectedViz.formatOptions.title.show && (
          <div className="space-y-2 text-xs">
            <input
              type="text"
              value={selectedViz.formatOptions.title.text}
              onChange={(e) => updateVisualizationFormat(selectedViz.id, "title.text", e.target.value)}
              className="w-full px-2 py-1 bg-[#250d46]/60 text-white rounded border border-white/30"
              placeholder="Texto del título"
            />
            <div className="flex items-center justify-between">
              <span className="text-white/80">Tamaño</span>
              <input
                type="number"
                value={selectedViz.formatOptions.title.fontSize}
                onChange={(e) => updateVisualizationFormat(selectedViz.id, "title.fontSize", Number(e.target.value))}
                className="w-16 px-2 py-1 bg-[#250d46]/60 text-white rounded border border-white/30"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Color</span>
              <input
                type="color"
                value={selectedViz.formatOptions.title.color}
                onChange={(e) => updateVisualizationFormat(selectedViz.id, "title.color", e.target.value)}
                className="w-8 h-6 rounded border border-white/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Colores */}
      <div className="border border-[#250d46]/40 rounded p-3">
        <span className="text-xs font-medium text-white block mb-2">Colores</span>
        <div className="space-y-2">
          {selectedViz.formatOptions.colors.custom.map((color, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white/80 text-xs">Color {index + 1}</span>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...selectedViz.formatOptions.colors.custom]
                  newColors[index] = e.target.value
                  updateVisualizationFormat(selectedViz.id, "colors.custom", newColors)
                }}
                className="w-8 h-6 rounded border border-white/30"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Interacciones */}
      {isEditingInteractions && (
        <div className="border border-[#250d46]/40 rounded p-3">
          <span className="text-xs font-medium text-white block mb-2">Interacciones</span>
          <div className="space-y-2">
            {dashboardVisualizations
              .filter((v) => v.id !== selectedViz.id)
              .map((targetViz) => (
                <div key={targetViz.id} className="flex items-center justify-between">
                  <span className="text-white/80 text-xs">{targetViz.title}</span>
                  <select
                    value={selectedViz.interactions[targetViz.id] || "filter"}
                    onChange={(e) => updateVisualizationInteraction(selectedViz.id, targetViz.id, e.target.value)}
                    className="text-xs bg-[#250d46]/80 text-white border border-white/30 rounded px-1"
                  >
                    <option value="filter">Filtrar</option>
                    <option value="highlight">Resaltar</option>
                    <option value="none">Ninguna</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
