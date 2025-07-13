"use client"
import { useRef } from "react"
import { Plus, Maximize2, Minimize2 } from "lucide-react"
import type { VisualizationConfig, Tables } from "@/types/visualization"
import DraggableVisualizationV2 from "./DraggableVisualizationV2"

interface VisualizationCanvasProps {
  dashboardVisualizations: VisualizationConfig[]
  selectedVisualization: number | null
  setSelectedVisualization: (id: number | null) => void
  setDashboardVisualizations: (
    visualizations: VisualizationConfig[] | ((prev: VisualizationConfig[]) => VisualizationConfig[]),
  ) => void
  isEditingInteractions: boolean
  canvasScale: number
  setCanvasScale: (scale: number) => void
  globalFilters: Record<string, any>
  applyCrossFilter: (sourceVizId: number, filterField: string, filterValue: any) => void
  tables: Tables
  onPositionChange: (id: number, x: number, y: number) => void
  onSizeChange: (id: number, width: number, height: number) => void
}

export default function VisualizationCanvas({
  dashboardVisualizations,
  selectedVisualization,
  setSelectedVisualization,
  setDashboardVisualizations,
  isEditingInteractions,
  canvasScale,
  setCanvasScale,
  globalFilters,
  applyCrossFilter,
  tables,
  onPositionChange,
  onSizeChange,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDeleteVisualization = (vizId: number) => {
    setDashboardVisualizations(dashboardVisualizations.filter((v) => v.id !== vizId))
    if (selectedVisualization === vizId) {
      setSelectedVisualization(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        ref={canvasRef}
        className="flex-1 relative bg-gradient-to-br from-[#250d46]/30 to-[#250d46]/60 overflow-auto"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 2px, transparent 0)
          `,
          backgroundSize: "100px 100px",
        }}
      >
        {/* Canvas Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Visualizations */}
        {dashboardVisualizations.map((visualization) => (
          <DraggableVisualizationV2
            key={visualization.id}
            visualization={visualization}
            isSelected={selectedVisualization === visualization.id}
            isEditingInteractions={isEditingInteractions}
            onSelect={() => setSelectedVisualization(visualization.id)}
            onDelete={() => handleDeleteVisualization(visualization.id)}
            onPositionChange={onPositionChange}
            onSizeChange={onSizeChange}
            tables={tables}
            globalFilters={globalFilters}
            applyCrossFilter={applyCrossFilter}
            scale={canvasScale}
          />
        ))}

        {/* Add visualization prompt */}
        {dashboardVisualizations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/60">
              <div className="p-8 rounded-full bg-[#250d46]/40 mb-4 mx-auto w-fit">
                <Plus size={48} />
              </div>
              <h3 className="text-xl font-medium mb-2">Canvas vacío</h3>
              <p className="text-sm">Arrastra visualizaciones desde el panel lateral para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="p-2 bg-[#250d46]/60 border-t border-[#250d46]/20 flex justify-between items-center text-xs text-white/70">
        <div className="flex items-center gap-4">
          <span>{dashboardVisualizations.length} visualizaciones</span>
          {Object.keys(globalFilters).length > 0 && (
            <span className="text-blue-400">{Object.keys(globalFilters).length} filtros activos</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Zoom: {Math.round(canvasScale * 100)}%</span>
          <button
            className="p-1 rounded hover:bg-[#250d46]/80"
            onClick={() => setCanvasScale(Math.min(2, canvasScale + 0.1))}
          >
            <Maximize2 size={12} />
          </button>
          <button
            className="p-1 rounded hover:bg-[#250d46]/80"
            onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
