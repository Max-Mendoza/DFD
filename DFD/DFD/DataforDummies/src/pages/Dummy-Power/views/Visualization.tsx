"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { ChevronRight, BarChart2, Plus, X } from "lucide-react"
import type { VisualizationViewProps, VisualizationConfig, Slot, FieldEntry } from "@/types/visualization"

import TopToolbar from "@/components/visualization/TopToolbar"
import FieldsPanel from "@/components/visualization/FieldsPanel"
import VisualizationCanvas from "@/components/visualization/VisualizationCanvas"
import RightPanel from "@/components/visualization/RightPanel"

export default function VisualizationView({
  isDarkMode,
  entities,
  tables,
  showSidebar,
  setShowSidebar,
}: VisualizationViewProps) {
  // Estados principales
  const [showFieldsPanel, setShowFieldsPanel] = useState(true)
  const [showVisualizationsPanel, setShowVisualizationsPanel] = useState(true)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedVisualization, setSelectedVisualization] = useState<number | null>(null)
  const [visualizationPanelTab, setVisualizationPanelTab] = useState<"build" | "format" | "analytics">("build")
  const [isEditingInteractions, setIsEditingInteractions] = useState(false)
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({})
  const [dashboardVisualizations, setDashboardVisualizations] = useState<VisualizationConfig[]>([])

  // Estados de interacción
  const [canvasScale, setCanvasScale] = useState(1)

  // Estados de UI
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(() => {
    const record: Record<string, boolean> = {}
    Object.keys(entities).forEach((entityId) => {
      record[entityId] = false
    })
    return record
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddMeasureModal, setShowAddMeasureModal] = useState(false)
  const [newMeasureName, setNewMeasureName] = useState("")
  const [measures, setMeasures] = useState([
    { id: 1, name: "Total Ventas", formula: "SUM(Ventas[Total])" },
    { id: 2, name: "Promedio Venta", formula: "AVERAGE(Ventas[Total])" },
  ])
  const [dashboardName, setDashboardName] = useState("Dashboard de ventas")
  const [isEditingDashboardName, setIsEditingDashboardName] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Función para obtener slots según tipo de visualización - EXPANDIDA
  const getVisualizationSlots = (type: string): Slot[] => {
    const slotsConfig: Record<string, Slot[]> = {
      bar: [
        {
          role: "axis",
          label: "Axis",
          acceptedTypes: ["string", "date", "number"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: true,
          required: true,
          fields: [],
        },
      ],
      line: [
        {
          role: "axis",
          label: "Axis",
          acceptedTypes: ["string", "date", "number"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: true,
          required: true,
          fields: [],
        },
      ],
      area: [
        {
          role: "axis",
          label: "Axis",
          acceptedTypes: ["string", "date", "number"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: true,
          required: true,
          fields: [],
        },
      ],
      pie: [
        {
          role: "legend",
          label: "Legend",
          acceptedTypes: ["string"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      donut: [
        {
          role: "legend",
          label: "Legend",
          acceptedTypes: ["string"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      scatter: [
        {
          role: "xaxis",
          label: "X Axis",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "yaxis",
          label: "Y Axis",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "size",
          label: "Size",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: false,
          fields: [],
        },
      ],
      gauge: [
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "target",
          label: "Target",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: false,
          fields: [],
        },
      ],
      heatmap: [
        {
          role: "xaxis",
          label: "X Axis",
          acceptedTypes: ["string", "date"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "yaxis",
          label: "Y Axis",
          acceptedTypes: ["string", "date"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      radar: [
        {
          role: "dimensions",
          label: "Dimensions",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: true,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      funnel: [
        {
          role: "stages",
          label: "Stages",
          acceptedTypes: ["string"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      waterfall: [
        {
          role: "categories",
          label: "Categories",
          acceptedTypes: ["string"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      table: [
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["string", "number", "currency", "date"],
          multipleAllowed: true,
          required: true,
          fields: [],
        },
      ],
      kpi: [
        {
          role: "values",
          label: "Values",
          acceptedTypes: ["number", "currency"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
      slicer: [
        {
          role: "field",
          label: "Field",
          acceptedTypes: ["string", "number", "date"],
          multipleAllowed: false,
          required: true,
          fields: [],
        },
      ],
    }
    return slotsConfig[type] || []
  }

  // Función para toggle de tablas
  const handleToggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  // Función para añadir visualización al canvas
  const handleAddVisualization = (type: string) => {
    const newId = Math.max(...dashboardVisualizations.map((v) => v.id), 0) + 1
    const slots = getVisualizationSlots(type)

    const newVisualization: VisualizationConfig = {
      id: newId,
      type,
      title: `Nueva visualización ${newId}`,
      position: { x: 50 + newId * 20, y: 50 + newId * 20 },
      size: { width: 300, height: 220 },
      slots: slots.map((slot) => ({ ...slot, fields: [] })),
      formatOptions: {
        title: { show: true, text: `Nueva visualización ${newId}`, fontSize: 16, color: "#ffffff" },
        legend: { show: true, position: "right", fontSize: 12 },
        colors: { scheme: "default", custom: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"] },
        axes: { xTitle: "", yTitle: "", showGrid: true },
      },
      interactions: {},
      filters: {},
    }

    setDashboardVisualizations([...dashboardVisualizations, newVisualization])
    setSelectedVisualization(newId)
  }

  // Función para manejar drop de campos
  const handleFieldDrop = (e: React.DragEvent, slotRole: string) => {
    e.preventDefault()
    const fieldData = JSON.parse(e.dataTransfer.getData("text/plain"))

    if (selectedVisualization) {
      const selectedViz = dashboardVisualizations.find((v) => v.id === selectedVisualization)
      if (!selectedViz) return

      const slot = selectedViz.slots.find((s) => s.role === slotRole)
      if (!slot) return

      if (!slot.acceptedTypes.includes(fieldData.type)) {
        alert(`Este campo no es compatible con ${slot.label}. Tipos aceptados: ${slot.acceptedTypes.join(", ")}`)
        return
      }

      setDashboardVisualizations((prev) =>
        prev.map((viz) => {
          if (viz.id === selectedVisualization) {
            const updatedSlots = viz.slots.map((s) => {
              if (s.role === slotRole) {
                const newField: FieldEntry = {
                  fieldName: fieldData.name,
                  displayName: fieldData.name,
                  dataType: fieldData.type,
                  sourceTable: fieldData.table,
                  aggregation: fieldData.type === "number" || fieldData.type === "currency" ? "sum" : "none",
                }

                if (s.multipleAllowed) {
                  return { ...s, fields: [...s.fields, newField] }
                } else {
                  return { ...s, fields: [newField] }
                }
              }
              return s
            })
            return { ...viz, slots: updatedSlots }
          }
          return viz
        }),
      )
    }
  }

  // Función para remover campo
  const handleRemoveField = (slotRole: string, index: number) => {
    if (selectedVisualization) {
      setDashboardVisualizations((prev) =>
        prev.map((viz) => {
          if (viz.id === selectedVisualization) {
            const updatedSlots = viz.slots.map((s) => {
              if (s.role === slotRole) {
                return { ...s, fields: s.fields.filter((_, i) => i !== index) }
              }
              return s
            })
            return { ...viz, slots: updatedSlots }
          }
          return viz
        }),
      )
    }
  }

  // Función para cambiar agregación
  const handleChangeAggregation = (slotRole: string, index: number, aggregation: string) => {
    if (selectedVisualization) {
      setDashboardVisualizations((prev) =>
        prev.map((viz) => {
          if (viz.id === selectedVisualization) {
            const updatedSlots = viz.slots.map((s) => {
              if (s.role === slotRole) {
                const updatedFields = s.fields.map((field, i) => {
                  if (i === index) {
                    return { ...field, aggregation: aggregation as any }
                  }
                  return field
                })
                return { ...s, fields: updatedFields }
              }
              return s
            })
            return { ...viz, slots: updatedSlots }
          }
          return viz
        }),
      )
    }
  }

  // Función para aplicar filtros cruzados
  const applyCrossFilter = useCallback((sourceVizId: number, filterField: string, filterValue: any) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterField]: filterValue,
    }))
  }, [])

  // Función para limpiar filtros
  const clearFilters = () => {
    setGlobalFilters({})
    setDashboardVisualizations((prev) =>
      prev.map((viz) => ({
        ...viz,
        filters: {},
      })),
    )
  }

  // Funciones para manejar posición y tamaño de visualizaciones
  const handlePositionChange = (id: number, x: number, y: number) => {
    setDashboardVisualizations((prev) => prev.map((viz) => (viz.id === id ? { ...viz, position: { x, y } } : viz)))
  }

  const handleSizeChange = (id: number, width: number, height: number) => {
    setDashboardVisualizations((prev) => prev.map((viz) => (viz.id === id ? { ...viz, size: { width, height } } : viz)))
  }

  // Función para actualizar formato
  const updateVisualizationFormat = (vizId: number, formatPath: string, value: any) => {
    setDashboardVisualizations((prev) =>
      prev.map((viz) => {
        if (viz.id === vizId) {
          const updatedViz = { ...viz }
          const pathArray = formatPath.split(".")
          let current: any = updatedViz.formatOptions

          for (let i = 0; i < pathArray.length - 1; i++) {
            current = current[pathArray[i]]
          }
          current[pathArray[pathArray.length - 1]] = value
          return updatedViz
        }
        return viz
      }),
    )
  }

  // Función para actualizar interacciones
  const updateVisualizationInteraction = (sourceVizId: number, targetVizId: number, interactionType: string) => {
    setDashboardVisualizations((prev) =>
      prev.map((viz) =>
        viz.id === sourceVizId
          ? {
            ...viz,
            interactions: {
              ...viz.interactions,
              [targetVizId]: interactionType as "filter" | "highlight" | "none",
            },
          }
          : viz,
      ),
    )
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#250d46]/90">
      {/* Top toolbar */}
      <TopToolbar
        showFieldsPanel={showFieldsPanel}
        setShowFieldsPanel={setShowFieldsPanel}
        dashboardName={dashboardName}
        setDashboardName={setDashboardName}
        isEditingDashboardName={isEditingDashboardName}
        setIsEditingDashboardName={setIsEditingDashboardName}
        isRefreshing={isRefreshing}
        setIsRefreshing={setIsRefreshing}
        isEditingInteractions={isEditingInteractions}
        setIsEditingInteractions={setIsEditingInteractions}
        showFiltersPanel={showFiltersPanel}
        setShowFiltersPanel={setShowFiltersPanel}
        clearFilters={clearFilters}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Fields */}
        {showFieldsPanel && (
          <FieldsPanel
            entities={entities}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            expandedTables={expandedTables}
            handleToggleTable={handleToggleTable}
            measures={measures}
            setMeasures={setMeasures}
            setShowAddMeasureModal={setShowAddMeasureModal}
          />
        )}

        {/* Main Canvas Area */}
        <VisualizationCanvas
          dashboardVisualizations={dashboardVisualizations}
          selectedVisualization={selectedVisualization}
          setSelectedVisualization={setSelectedVisualization}
          setDashboardVisualizations={setDashboardVisualizations}
          isEditingInteractions={isEditingInteractions}
          canvasScale={canvasScale}
          setCanvasScale={setCanvasScale}
          globalFilters={globalFilters}
          applyCrossFilter={applyCrossFilter}
          tables={tables}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
        />

        {/* Right Panel - Visualizations */}
        <RightPanel
          showVisualizationsPanel={showVisualizationsPanel}
          setShowVisualizationsPanel={setShowVisualizationsPanel}
          visualizationPanelTab={visualizationPanelTab}
          setVisualizationPanelTab={setVisualizationPanelTab}
          selectedVisualization={selectedVisualization}
          dashboardVisualizations={dashboardVisualizations}
          handleAddVisualization={handleAddVisualization}
          handleFieldDrop={handleFieldDrop}
          handleRemoveField={handleRemoveField}
          handleChangeAggregation={handleChangeAggregation}
          updateVisualizationFormat={updateVisualizationFormat}
          updateVisualizationInteraction={updateVisualizationInteraction}
          isEditingInteractions={isEditingInteractions}
        />

        {/* Filters Panel */}
        {showFiltersPanel && (
          <div className="w-64 border-l border-[#250d46]/20 bg-[#250d46]/70 overflow-auto">
            <div className="p-3 border-b border-[#250d46]/40 flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">Filtros</h3>
              <button
                className="p-1 rounded hover:bg-[#250d46]/80 text-white/80"
                onClick={() => setShowFiltersPanel(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-3">
              <button className="w-full py-1.5 px-3 rounded text-sm bg-[#250d46]/60 hover:bg-[#250d46]/70 text-white border border-white/30 flex items-center justify-center gap-1">
                <Plus size={14} />
                <span>Añadir filtro</span>
              </button>

              {/* Filtros activos */}
              {Object.keys(globalFilters).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-white/90 mb-2">Filtros activos</h4>
                  <div className="space-y-2">
                    {Object.entries(globalFilters).map(([field, value]) => (
                      <div key={field} className="flex items-center justify-between bg-[#250d46]/60 rounded px-2 py-1">
                        <div className="text-xs text-white/90">
                          <div className="font-medium">{field}</div>
                          <div className="text-white/70">{value}</div>
                        </div>
                        <button
                          onClick={() => {
                            const newFilters = { ...globalFilters }
                            delete newFilters[field]
                            setGlobalFilters(newFilters)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        className={`fixed right-4 top-20 p-2 rounded-full shadow-md z-10 bg-[#250d46] text-white hover:bg-[#250d46]/80 ${showFiltersPanel ? "right-72" : "right-4"
          }`}
        onClick={() => setShowVisualizationsPanel(!showVisualizationsPanel)}
      >
        {showVisualizationsPanel ? <ChevronRight size={18} /> : <BarChart2 size={18} />}
      </button>

      {/* Modal para añadir medida */}
      {showAddMeasureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#250d46] p-6 rounded-lg border border-[#250d46]/40 w-96">
            <h3 className="text-lg font-medium text-white mb-4">Nueva Medida</h3>
            <input
              type="text"
              placeholder="Nombre de la medida"
              value={newMeasureName}
              onChange={(e) => setNewMeasureName(e.target.value)}
              className="w-full bg-[#250d46]/60 text-white px-3 py-2 rounded border border-white/30 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-white border border-white/30 rounded hover:bg-[#250d46]/80"
                onClick={() => setShowAddMeasureModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-white text-[#250d46] rounded hover:bg-opacity-90"
                onClick={() => {
                  if (newMeasureName.trim()) {
                    setMeasures([
                      ...measures,
                      {
                        id: measures.length + 1,
                        name: newMeasureName.trim(),
                        formula: `CUSTOM(${newMeasureName.trim()})`,
                      },
                    ])
                    setNewMeasureName("")
                    setShowAddMeasureModal(false)
                  }
                }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
