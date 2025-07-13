"use client"

import { PanelLeft, RefreshCw, Settings, RotateCcw, Filter, ChevronDown } from "lucide-react"

interface TopToolbarProps {
    showFieldsPanel: boolean
    setShowFieldsPanel: (show: boolean) => void
    dashboardName: string
    setDashboardName: (name: string) => void
    isEditingDashboardName: boolean
    setIsEditingDashboardName: (editing: boolean) => void
    isRefreshing: boolean
    setIsRefreshing: (refreshing: boolean) => void
    isEditingInteractions: boolean
    setIsEditingInteractions: (editing: boolean) => void
    showFiltersPanel: boolean
    setShowFiltersPanel: (show: boolean) => void
    clearFilters: () => void
}

export default function TopToolbar({
    showFieldsPanel,
    setShowFieldsPanel,
    dashboardName,
    setDashboardName,
    isEditingDashboardName,
    setIsEditingDashboardName,
    isRefreshing,
    setIsRefreshing,
    isEditingInteractions,
    setIsEditingInteractions,
    showFiltersPanel,
    setShowFiltersPanel,
    clearFilters,
}: TopToolbarProps) {
    return (
        <div className="p-2 bg-[#250d46] text-white border-b border-[#250d46]/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <button
                    className="p-1.5 rounded hover:bg-[#250d46]/80 transition-colors"
                    onClick={() => setShowFieldsPanel(!showFieldsPanel)}
                    title={showFieldsPanel ? "Ocultar panel de campos" : "Mostrar panel de campos"}
                >
                    <PanelLeft size={18} />
                </button>

                <div className="px-3 py-1 rounded bg-[#250d46]/80 flex items-center gap-1">
                    {isEditingDashboardName ? (
                        <input
                            type="text"
                            value={dashboardName}
                            onChange={(e) => setDashboardName(e.target.value)}
                            className="bg-[#250d46]/60 text-white text-sm px-2 py-1 rounded border border-white/30"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setIsEditingDashboardName(false)
                                if (e.key === "Escape") setIsEditingDashboardName(false)
                            }}
                            onBlur={() => setIsEditingDashboardName(false)}
                            autoFocus
                        />
                    ) : (
                        <>
                            <span className="text-sm font-medium cursor-pointer" onClick={() => setIsEditingDashboardName(true)}>
                                {dashboardName}
                            </span>
                            <ChevronDown size={14} className="cursor-pointer" onClick={() => setIsEditingDashboardName(true)} />
                        </>
                    )}
                </div>

                <button
                    className={`p-1.5 rounded hover:bg-[#250d46]/80 transition-colors ${isRefreshing ? "animate-spin" : ""}`}
                    title="Actualizar datos"
                    onClick={() => {
                        setIsRefreshing(true)
                        setTimeout(() => setIsRefreshing(false), 1000)
                    }}
                >
                    <RefreshCw size={16} />
                </button>

                <button
                    className={`p-1.5 rounded hover:bg-[#250d46]/80 transition-colors ${isEditingInteractions ? "bg-white text-[#250d46]" : ""}`}
                    title="Editar interacciones"
                    onClick={() => setIsEditingInteractions(!isEditingInteractions)}
                >
                    <Settings size={16} />
                </button>

                <button
                    className="p-1.5 rounded hover:bg-[#250d46]/80 transition-colors"
                    title="Limpiar filtros"
                    onClick={clearFilters}
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    className={`p-1.5 rounded hover:bg-[#250d46]/80 transition-colors ${showFiltersPanel ? "bg-[#250d46]/80" : ""}`}
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                >
                    <Filter size={16} />
                </button>
            </div>
        </div>
    )
}
