"use client"

import type React from "react"
import { ChevronRight, X, MoreHorizontal, Hash, Calendar, Type } from "lucide-react"
import type { VisualizationConfig, FieldEntry } from "@/types/visualization"

interface BuildTabProps {
  visualizationTypes: Array<{
    id: string
    name: string
    icon: React.ReactNode
    category: string
  }>
  selectedViz: VisualizationConfig | undefined
  handleAddVisualization: (type: string) => void
  handleFieldDrop: (e: React.DragEvent, slotRole: string) => void
  handleRemoveField: (slotRole: string, index: number) => void
  handleChangeAggregation: (slotRole: string, index: number, aggregation: string) => void
}

export default function BuildTab({
  visualizationTypes,
  selectedViz,
  handleAddVisualization,
  handleFieldDrop,
  handleRemoveField,
  handleChangeAggregation,
}: BuildTabProps) {
  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case "number":
      case "currency":
        return <Hash size={12} className="text-green-400" />
      case "date":
        return <Calendar size={12} className="text-blue-400" />
      case "string":
        return <Type size={12} className="text-orange-400" />
      default:
        return <Type size={12} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Visual Gallery */}
      <div>
        <h4 className="text-xs font-medium mb-3 text-white/90">Galería de visualizaciones</h4>
        <div className="grid grid-cols-4 gap-2">
          {visualizationTypes.map((vizType) => (
            <button
              key={vizType.id}
              className="p-2 rounded border border-[#250d46]/40 hover:border-white/40 hover:bg-[#250d46]/80 text-white/80 hover:text-white transition-all flex flex-col items-center gap-1"
              onClick={() => handleAddVisualization(vizType.id)}
              title={vizType.name}
            >
              {vizType.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Fields Section */}
      {selectedViz && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-white/90">Campos</h4>
          {selectedViz.slots.map((slot) => (
            <div key={`${selectedViz.id}-${slot.role}`} className="border border-[#250d46]/40 rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/80 flex items-center gap-1">
                  {slot.label}
                  {slot.required && <span className="text-red-400">*</span>}
                  <span className="text-white/60 text-[10px]">({slot.acceptedTypes.join(", ")})</span>
                </span>
                <ChevronRight size={12} className="text-white/60" />
              </div>

              <div
                className="min-h-[40px] border-2 border-dashed border-[#250d46]/40 rounded p-2 text-xs text-white/60 transition-colors hover:border-white/40"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("border-white/60", "bg-[#250d46]/20")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-white/60", "bg-[#250d46]/20")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-white/60", "bg-[#250d46]/20")
                  handleFieldDrop(e, slot.role)
                }}
              >
                {slot.fields.length > 0
                  ? slot.fields.map((field: FieldEntry, index: number) => (
                      <div
                        key={`${field.fieldName}-${index}`}
                        className="flex items-center justify-between bg-[#250d46]/60 rounded px-2 py-1 mb-1 group"
                      >
                        <div className="flex items-center gap-1 flex-1">
                          {getDataTypeIcon(field.dataType)}
                          <span className="text-white/90">{field.displayName}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {(field.dataType === "number" || field.dataType === "currency") && (
                            <select
                              value={field.aggregation}
                              onChange={(e) => handleChangeAggregation(slot.role, index, e.target.value)}
                              className="text-xs bg-[#250d46]/80 text-white border border-white/30 rounded px-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="sum">Suma</option>
                              <option value="avg">Promedio</option>
                              <option value="count">Conteo</option>
                              <option value="min">Mínimo</option>
                              <option value="max">Máximo</option>
                            </select>
                          )}
                          <button
                            className="p-0.5 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400"
                            title="Más opciones"
                          >
                            <MoreHorizontal size={10} />
                          </button>
                          <button
                            onClick={() => handleRemoveField(slot.role, index)}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  : `Arrastra campos aquí (${slot.acceptedTypes.join(", ")})`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
