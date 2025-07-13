"use client"

import type React from "react"

import {
  X,
  Database,
  Paintbrush,
  TrendingUp,
  BarChart2,
  LineChart,
  PieChart,
  LucideTable,
  Target,
  Filter,
  ScatterChart,
  Gauge,
  AreaChart,
  Activity,
  Zap,
  TrendingDown,
  Grid3X3,
} from "lucide-react"
import type { VisualizationConfig } from "@/types/visualization"
import BuildTab from "./BuildTab"
import FormatTab from "./FormatTab"

interface RightPanelProps {
  showVisualizationsPanel: boolean
  setShowVisualizationsPanel: (show: boolean) => void
  visualizationPanelTab: "build" | "format" | "analytics"
  setVisualizationPanelTab: (tab: "build" | "format" | "analytics") => void
  selectedVisualization: number | null
  dashboardVisualizations: VisualizationConfig[]
  handleAddVisualization: (type: string) => void
  handleFieldDrop: (e: React.DragEvent, slotRole: string) => void
  handleRemoveField: (slotRole: string, index: number) => void
  handleChangeAggregation: (slotRole: string, index: number, aggregation: string) => void
  updateVisualizationFormat: (vizId: number, formatPath: string, value: any) => void
  updateVisualizationInteraction: (sourceVizId: number, targetVizId: number, interactionType: string) => void
  isEditingInteractions: boolean
}

export default function RightPanel({
  showVisualizationsPanel,
  setShowVisualizationsPanel,
  visualizationPanelTab,
  setVisualizationPanelTab,
  selectedVisualization,
  dashboardVisualizations,
  handleAddVisualization,
  handleFieldDrop,
  handleRemoveField,
  handleChangeAggregation,
  updateVisualizationFormat,
  updateVisualizationInteraction,
  isEditingInteractions,
}: RightPanelProps) {
  const selectedViz = dashboardVisualizations.find((v) => v.id === selectedVisualization)

  // TIPOS DE VISUALIZACIONES EXPANDIDOS
  const visualizationTypes = [
    // Básicos
    { id: "bar", name: "Gráfico de barras", icon: <BarChart2 size={20} />, category: "basic" },
    { id: "line", name: "Gráfico de líneas", icon: <LineChart size={20} />, category: "basic" },
    { id: "area", name: "Gráfico de área", icon: <AreaChart size={20} />, category: "basic" },
    { id: "pie", name: "Gráfico circular", icon: <PieChart size={20} />, category: "basic" },

    // Avanzados
    { id: "donut", name: "Gráfico de rosquilla", icon: <Target size={20} />, category: "advanced" },
    { id: "scatter", name: "Gráfico de dispersión", icon: <ScatterChart size={20} />, category: "advanced" },
    { id: "gauge", name: "Medidor", icon: <Gauge size={20} />, category: "advanced" },
    { id: "heatmap", name: "Mapa de calor", icon: <Grid3X3 size={20} />, category: "advanced" },

    // Especializados
    { id: "radar", name: "Gráfico radar", icon: <Activity size={20} />, category: "specialized" },
    { id: "funnel", name: "Embudo", icon: <TrendingDown size={20} />, category: "specialized" },
    { id: "waterfall", name: "Cascada", icon: <Zap size={20} />, category: "specialized" },

    // Utilidades
    { id: "table", name: "Tabla", icon: <LucideTable size={20} />, category: "utility" },
    { id: "kpi", name: "KPI", icon: <Target size={20} />, category: "utility" },
    { id: "slicer", name: "Segmentador", icon: <Filter size={20} />, category: "utility" },
  ]

  if (!showVisualizationsPanel) return null

  return (
    <div className="w-80 border-l border-[#250d46]/20 bg-[#250d46]/70 overflow-auto">
      <div className="p-3 border-b border-[#250d46]/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Visualizaciones</h3>
          <button
            className="p-1 rounded hover:bg-[#250d46]/80 text-white/80"
            onClick={() => setShowVisualizationsPanel(false)}
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
              visualizationPanelTab === "build" ? "bg-white text-[#250d46]" : "text-white/80 hover:bg-[#250d46]/80"
            }`}
            onClick={() => setVisualizationPanelTab("build")}
          >
            <Database size={12} />
            Crear visual
          </button>
          <button
            className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
              visualizationPanelTab === "format" ? "bg-white text-[#250d46]" : "text-white/80 hover:bg-[#250d46]/80"
            }`}
            onClick={() => setVisualizationPanelTab("format")}
          >
            <Paintbrush size={12} />
            Formato
          </button>
          <button
            className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
              visualizationPanelTab === "analytics" ? "bg-white text-[#250d46]" : "text-white/80 hover:bg-[#250d46]/80"
            }`}
            onClick={() => setVisualizationPanelTab("analytics")}
          >
            <TrendingUp size={12} />
            Analytics
          </button>
        </div>
      </div>

      <div className="p-3">
        {visualizationPanelTab === "build" && (
          <BuildTab
            visualizationTypes={visualizationTypes}
            selectedViz={selectedViz}
            handleAddVisualization={handleAddVisualization}
            handleFieldDrop={handleFieldDrop}
            handleRemoveField={handleRemoveField}
            handleChangeAggregation={handleChangeAggregation}
          />
        )}

        {visualizationPanelTab === "format" && selectedViz && (
          <FormatTab
            selectedViz={selectedViz}
            dashboardVisualizations={dashboardVisualizations}
            updateVisualizationFormat={updateVisualizationFormat}
            updateVisualizationInteraction={updateVisualizationInteraction}
            isEditingInteractions={isEditingInteractions}
          />
        )}

        {visualizationPanelTab === "analytics" && (
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-white/90">Analytics</h4>
            <div className="text-center text-white/60 py-8">
              <p className="text-sm">Funciones de analytics disponibles próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
