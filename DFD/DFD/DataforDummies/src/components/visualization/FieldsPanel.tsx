"use client"
import { Search, LucideTable, ChevronDown, Plus, X, DollarSign, Hash, Calendar, Type } from "lucide-react"
import type { Entities } from "../../types/visualization"

interface FieldsPanelProps {
  entities: Entities
  searchTerm: string
  setSearchTerm: (term: string) => void
  expandedTables: Record<string, boolean>
  handleToggleTable: (tableName: string) => void
  measures: Array<{ id: number; name: string; formula: string }>
  setMeasures: (measures: Array<{ id: number; name: string; formula: string }>) => void
  setShowAddMeasureModal: (show: boolean) => void
}

export default function FieldsPanel({
  entities,
  searchTerm,
  setSearchTerm,
  expandedTables,
  handleToggleTable,
  measures,
  setMeasures,
  setShowAddMeasureModal,
}: FieldsPanelProps) {
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
    <div className="w-64 border-r border-[#250d46]/20 bg-[#250d46]/70 overflow-auto">
      <div className="p-3 border-b border-[#250d46]/40">
        <div className="flex items-center rounded-md bg-[#250d46]/60 px-2 py-1">
          <Search size={14} className="text-white/80" />
          <input
            type="text"
            placeholder="Buscar campos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none w-full text-sm focus:outline-none px-2 text-white placeholder:text-white/80"
          />
        </div>
      </div>

      <div className="p-3">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-white">Tablas</h3>
          {Object.values(entities).map((entity) => (
            <div key={entity.id} className="mb-3">
              <div
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#250d46]/80 text-white cursor-pointer"
                onClick={() => handleToggleTable(entity.id)}
              >
                <div className="text-sm font-medium flex items-center gap-1">
                  <LucideTable size={14} />
                  <span>{entity.name}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expandedTables[entity.id] ? "rotate-180" : ""}`}
                />
              </div>

              {expandedTables[entity.id] && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {entity.columns
                    .filter((column) => column.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((column, index) => (
                      <div
                        key={index}
                        className="text-xs py-1 px-2 rounded flex items-center gap-1 cursor-grab text-white/80 hover:bg-[#250d46]/80"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify({
                              name: column.name,
                              type: column.type,
                              table: entity.name,
                            }),
                          )
                        }}
                      >
                        {getDataTypeIcon(column.type)}
                        {column.name}
                        {column.isPrimary && <span className="text-yellow-400 ml-1">🔑</span>}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 text-white">
            <h3 className="text-sm font-medium">Medidas</h3>
            <button
              className="p-1 rounded hover:bg-[#250d46]/80"
              onClick={() => setShowAddMeasureModal(true)}
              title="Añadir nueva medida"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {measures.map((measure) => (
              <div
                key={measure.id}
                className="text-xs py-1 px-2 rounded flex items-center justify-between text-white/80 hover:bg-[#250d46]/80 group cursor-grab"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({
                      name: measure.name,
                      type: "number",
                      table: "measures",
                    }),
                  )
                }}
              >
                <div className="flex items-center gap-1">
                  <DollarSign size={12} className="text-white" />
                  <span title={measure.formula}>{measure.name}</span>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-red-400"
                  onClick={() => setMeasures(measures.filter((m) => m.id !== measure.id))}
                  title="Eliminar medida"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
