"use client"

import { useState, useMemo, useRef } from "react"
import {
    Filter,
    ArrowRight,
    Plus,
    Database,
    Trash,
    MoreHorizontal,
    PanelLeft,
    PanelRight,
    ChevronUp,
    ChevronDown,
} from "lucide-react"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import axiosInstance from "@/api/axiosInstance"
import { Table, Tables } from "../lib/data"



interface TransformationStep {
    id: number
    type: string
    name: string
    description: string
    config: Record<string, any>
}

interface StepConfig {
    column?: string
    operator?: string
    value?: string
    direction?: "asc" | "desc"
    name?: string
    formula?: string
}

interface TransformViewProps {
    isDarkMode: boolean
    tables: Tables
    activeTable: string
    setActiveTable: (table: string) => void
    showSidebar: boolean
    setShowSidebar: (show: boolean) => void
    appliedSteps: TransformationStep[]
    setAppliedSteps: (steps: TransformationStep[] | ((prev: TransformationStep[]) => TransformationStep[])) => void
    addTable: (table: Table) => void
}

export default function TransformView({
    isDarkMode,
    tables,
    activeTable,
    setActiveTable,
    showSidebar,
    setShowSidebar,
    appliedSteps,
    setAppliedSteps,
    addTable
}: TransformViewProps) {
    const [showAddStepModal, setShowAddStepModal] = useState<boolean>(false)
    const [stepType, setStepType] = useState<string>("filter")
    const [stepConfig, setStepConfig] = useState<StepConfig>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const tableContainerRef = useRef<HTMLDivElement>(null)




    // Transform columnar data to row data for TanStack Table
    const data = useMemo(() => {
        if (!tables[activeTable]) return []

        const table = tables[activeTable]
        const rowCount = table.columns.length > 0 ? table.values[table.columns[0]]?.length || 0 : 0

        const rows: Record<string, any>[] = []

        for (let i = 0; i < rowCount; i++) {
            const row: Record<string, any> = {}
            table.columns.forEach((column) => {
                row[column] = table.values[column]?.[i]
            })
            rows.push(row)
        }

        return rows
    }, [tables, activeTable])

    // Memoized columns for TanStack Table
    const columns = useMemo<ColumnDef<any>[]>(() => {
        if (!tables[activeTable]) return []

        const columnHelper = createColumnHelper<any>()
        const table = tables[activeTable]

        return table.columns.map((columnName) =>
            columnHelper.accessor(columnName, {
                id: columnName,
                header: ({ column: col }) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                            {columnName}
                            {columnName === "ID"}
                        </span>
                        <button className="flex flex-col" onClick={() => col.toggleSorting()}>
                            <ChevronUp size={12} className={`${col.getIsSorted() === "asc" ? "text-blue-400" : "text-gray-500"}`} />
                            <ChevronDown
                                size={12}
                                className={`${col.getIsSorted() === "desc" ? "text-blue-400" : "text-gray-500"} -mt-1`}
                            />
                        </button>
                    </div>
                ),
                cell: ({ getValue }) => {
                    const value = getValue()
                    return (
                        <div className="text-white/90 text-sm py-2">
                            {value !== null && value !== undefined ? String(value) : "-"}
                        </div>
                    )
                },
                enableSorting: true,
                enableColumnFilter: true,
            }),
        )
    }, [tables, activeTable])

    // TanStack Table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 50,
            },
        },
    })

    // Virtualization
    const { rows } = table.getRowModel()
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 45,
        overscan: 10,
    })

    // Function to add a new transformation step
    const handleAddStep = (): void => {
        const newStep: TransformationStep = {
            id: Date.now(),
            type: stepType,
            config: stepConfig,
            name: "",
            description: "",
        }

        // Generate description based on step type
        switch (stepType) {
            case "filter":
                newStep.name = "Filtrar datos"
                newStep.description = `Filtrar donde ${stepConfig.column || "columna"} ${stepConfig.operator || "="} ${stepConfig.value || "valor"}`
                break
            case "sort":
                newStep.name = "Ordenar datos"
                newStep.description = `Ordenar por ${stepConfig.column || "columna"} en orden ${stepConfig.direction === "asc" ? "ascendente" : "descendente"}`
                break
            case "group":
                newStep.name = "Agrupar datos"
                newStep.description = `Agrupar por ${stepConfig.column || "columna"}`
                break
            case "calculate":
                newStep.name = "Calcular columna"
                newStep.description = `Nueva columna: ${stepConfig.name || "resultado"}`
                break
            default:
                newStep.name = "Transformación personalizada"
                newStep.description = "Paso personalizado aplicado"
        }

        setAppliedSteps((prev) => [...prev, newStep])
        setShowAddStepModal(false)
        setStepConfig({})
    }

    // Function to apply changes
    const handleApplyChanges = (): void => {
        if (appliedSteps.length === 0) {
            alert("No hay cambios para aplicar")
            return
        }

        alert(`Se aplicarían ${appliedSteps.length} transformaciones a los datos en una aplicación real`)
    }
    const handleCleanData = async (tableId: string) => {
        const data = tables[tableId]
        const response = await axiosInstance.post('/analyze/file/data-cleaner/',
            data
        )
        addTable(response.data)
        console.log(response.data)
    }

    // Get current table info
    const currentTable = tables[activeTable]
    const hasData = currentTable && data.length > 0

    return (
        <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div
                    className={`p-4 bg-[#250d46] text-white border-b ${isDarkMode ? "border-gray-700" : "border-[#250d46]/20"} flex justify-between items-center`}
                >
                    <div className="flex items-center gap-4">
                        <select
                            className="px-3 py-2 border border-[#250d46]/30 bg-[#250d46]/80 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            value={activeTable}
                            onChange={(e) => setActiveTable(e.target.value)}
                        >
                            {Object.entries(tables).map(([id, table]) => (
                                <option key={id} value={id}>
                                    {table.name}
                                </option>
                            ))}
                        </select>

                        {/* Global Search */}
                        <input
                            type="text"
                            placeholder="Buscar en todos los campos..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="px-3 py-2 border border-[#250d46]/30 bg-[#250d46]/80 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/60"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-white/30 rounded hover:bg-[#250d46]/80 cursor-pointer"
                        onClick={()=> handleCleanData(activeTable.toLocaleLowerCase())}>
                            Limpiar datos
                        </button>
                        <button
                            className="px-3 py-1 text-sm bg-white text-[#250d46] rounded hover:bg-opacity-90 font-medium shadow-sm cursor-pointer"
                            
                        >
                            Aplicar cambios
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Table Container */}
                    <div className={`flex-1 overflow-hidden p-4 ${isDarkMode ? "bg-gray-900" : "bg-[#250d46]/80"}`}>
                        {hasData ? (
                            <div className="h-full flex flex-col">
                                {/* Table Info */}
                                <div className="mb-4 flex justify-between items-center text-white/80 text-sm">
                                    <div className="flex items-center gap-4">
                                        <span>
                                            Mostrando {table.getRowModel().rows.length} de {data.length} filas
                                        </span>
                                        <span className="text-white/60">{currentTable.description}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="px-2 py-1 border border-white/30 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                                        >
                                            Anterior
                                        </button>
                                        <span className="px-2 py-1">
                                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                                        </span>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="px-2 py-1 border border-white/30 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>

                                {/* Virtualized Table */}
                                <div
                                    ref={tableContainerRef}
                                    className="flex-1 overflow-auto border border-white/20 rounded-lg bg-[#250d46]/60"
                                    style={{ height: "100%" }}
                                >
                                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                                        {/* Table Header */}
                                        <div className="sticky top-0 z-10 bg-[#250d46] border-b border-white/20">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <div key={headerGroup.id} className="flex">
                                                    {headerGroup.headers.map((header) => (
                                                        <div
                                                            key={header.id}
                                                            className="flex-1 min-w-[120px] px-4 py-3 text-left border-r border-white/10 last:border-r-0"
                                                            style={{ width: header.getSize() }}
                                                        >
                                                            {header.isPlaceholder ? null : (
                                                                <div className="flex flex-col gap-2">
                                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                                    {header.column.getCanFilter() && (
                                                                        <input
                                                                            type="text"
                                                                            value={(header.column.getFilterValue() ?? "") as string}
                                                                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                                            placeholder="Filtrar..."
                                                                            className="px-2 py-1 text-xs bg-[#250d46]/80 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Virtualized Rows */}
                                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                            const row = rows[virtualRow.index]
                                            return (
                                                <div
                                                    key={row.id}
                                                    className="absolute w-full flex hover:bg-white/5 border-b border-white/10"
                                                    style={{
                                                        height: `${virtualRow.size}px`,
                                                        transform: `translateY(${virtualRow.start}px)`,
                                                    }}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <div
                                                            key={cell.id}
                                                            className="flex-1 min-w-[120px] px-4 py-2 border-r border-white/10 last:border-r-0 flex items-center"
                                                            style={{ width: cell.column.getSize() }}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center text-white/70">
                                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
                                    <p className="text-sm">Selecciona una tabla con datos para comenzar el análisis</p>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Modal for adding step */}
            {showAddStepModal && currentTable && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-[#250d46]/90 text-white"} rounded-lg p-6 w-96 max-w-full shadow-xl`}
                    >
                        <h3 className="text-lg font-medium mb-4 text-white">
                            {stepType === "filter"
                                ? "Aplicar filtro"
                                : stepType === "sort"
                                    ? "Ordenar datos"
                                    : stepType === "calculate"
                                        ? "Crear columna calculada"
                                        : "Agrupar datos"}
                        </h3>

                        <div className="space-y-4">
                            {stepType === "filter" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Columna</label>
                                        <select
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.column || ""}
                                            onChange={(e) => setStepConfig({ ...stepConfig, column: e.target.value })}
                                        >
                                            {currentTable.columns.map((col) => (
                                                <option key={col} value={col}>
                                                    {col}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Operador</label>
                                        <select
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.operator || "="}
                                            onChange={(e) => setStepConfig({ ...stepConfig, operator: e.target.value })}
                                        >
                                            <option value="=">=</option>
                                            <option value="!=">!=</option>
                                            <option value=">">{">"}</option>
                                            <option value="<">{"<"}</option>
                                            <option value=">=">{"≥"}</option>
                                            <option value="<=">{"≤"}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Valor</label>
                                        <input
                                            type="text"
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.value || ""}
                                            onChange={(e) => setStepConfig({ ...stepConfig, value: e.target.value })}
                                            placeholder="Valor a filtrar"
                                        />
                                    </div>
                                </>
                            )}

                            {stepType === "sort" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Columna</label>
                                        <select
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.column || ""}
                                            onChange={(e) => setStepConfig({ ...stepConfig, column: e.target.value })}
                                        >
                                            {currentTable.columns.map((col) => (
                                                <option key={col} value={col}>
                                                    {col}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Dirección</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="direction"
                                                    value="asc"
                                                    checked={stepConfig.direction === "asc"}
                                                    onChange={() => setStepConfig({ ...stepConfig, direction: "asc" })}
                                                    className="mr-2 text-[#250d46]"
                                                />
                                                <span className="text-white">Ascendente</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="direction"
                                                    value="desc"
                                                    checked={stepConfig.direction === "desc"}
                                                    onChange={() => setStepConfig({ ...stepConfig, direction: "desc" })}
                                                    className="mr-2 text-[#250d46]"
                                                />
                                                <span className="text-white">Descendente</span>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {stepType === "calculate" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Nombre de la columna</label>
                                        <input
                                            type="text"
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.name || ""}
                                            onChange={(e) => setStepConfig({ ...stepConfig, name: e.target.value })}
                                            placeholder="Nombre de la nueva columna"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-white/90">Fórmula</label>
                                        <input
                                            type="text"
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                                }`}
                                            value={stepConfig.formula || ""}
                                            onChange={(e) => setStepConfig({ ...stepConfig, formula: e.target.value })}
                                            placeholder="Ej: [Precio] * [Cantidad]"
                                        />
                                    </div>
                                </>
                            )}

                            {stepType === "group" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/90">Agrupar por</label>
                                    <select
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                            }`}
                                        value={stepConfig.column || ""}
                                        onChange={(e) => setStepConfig({ ...stepConfig, column: e.target.value })}
                                    >
                                        {currentTable.columns.map((col) => (
                                            <option key={col} value={col}>
                                                {col}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 border border-white/30 rounded text-sm text-white hover:bg-[#250d46]/60 cursor-pointer"
                                onClick={() => setShowAddStepModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-white text-[#250d46] rounded text-sm hover:bg-opacity-90 shadow-sm font-medium cursor-pointer"
                                onClick={handleAddStep}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
