"use client"

import { useState, useRef } from "react"
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Link, Plus, Edit } from "lucide-react"
import DraggableEntity from "../utils/DraggableEntitty"
import Relationship from "../utils/Relationship"
import { relationships } from "../lib/data"
import { Entities } from "../lib/data"
interface ModelsViewProps {
    isDarkMode: boolean;
    entities: Entities;
    relationships: relationships;
    setRelationships: React.Dispatch<React.SetStateAction<relationships>>;
    selectedEntity: string | null;
    selectedRelationship: string | number | null;
    handleEntityDrag: (id: string, position: { x: number; y: number }) => void;
    handleEntitySelect: (id: string | null) => void;
    handleRelationshipSelect: (id: string | number | null) => void;
}

export default function ModelsView({
    isDarkMode,
    entities,
    relationships,
    setRelationships,
    selectedEntity,
    selectedRelationship,
    handleEntityDrag,
    handleEntitySelect,
    handleRelationshipSelect,
}: ModelsViewProps) {
    const [diagramZoom, setDiagramZoom] = useState(1)
    const [showRelationshipModal, setShowRelationshipModal] = useState(false)
    const [newRelationship, setNewRelationship] = useState({
        from: "",
        to: "",
        type: "oneToMany",
    })

    const diagramContainerRef = useRef(null)

    // Function to change diagram zoom
    const handleZoomChange = (delta) => {
        setDiagramZoom((prev) => {
            const newZoom = prev + delta
            return Math.min(Math.max(0.5, newZoom), 2)
        })
    }

    // Function to reset zoom
    const handleResetZoom = () => {
        setDiagramZoom(1)
    }

    // Function to center the diagram
    const handleCenterDiagram = () => {
        if (diagramContainerRef.current) {
            diagramContainerRef.current.scrollTo({
                top: 300,
                left: 300,
                behavior: "smooth",
            })
        }
    }

    // Function to add a new relationship
    const handleAddRelationship = () => {
        if (newRelationship.from && newRelationship.to) {
            const newId = Date.now()
            setRelationships((prev) => [
                ...prev,
                {
                    id: newId,
                    from: newRelationship.from,
                    to: newRelationship.to,
                    type: newRelationship.type,
                },
            ])
            setNewRelationship({ from: "", to: "", type: "oneToMany" })
            setShowRelationshipModal(false)
            handleRelationshipSelect(newId)
        }
    }

    // Function to delete a relationship
    const handleDeleteRelationship = (id) => {
        setRelationships((prev) => prev.filter((rel) => rel.id !== id))
        if (selectedRelationship === id) {
            handleRelationshipSelect(null)
        }
    }

    return (
        <div className="flex-1 overflow-hidden flex">
            <div className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} overflow-hidden flex flex-col`}>
                <div
                    className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-[#250d46]"} border-b ${isDarkMode ? "border-gray-700" : "border-[#250d46]/20"} flex justify-between items-center`}
                >
                    <h2 className="text-lg font-medium text-white">Diagrama de relaciones</h2>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 bg-white/10 border border-white/30 text-white rounded-full shadow-sm hover:bg-white/20"
                            title="Crear relación"
                            onClick={() => setShowRelationshipModal(true)}
                        >
                            <Link size={20} />
                        </button>
                        <button
                            className="p-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                            onClick={() => handleZoomChange(-0.1)}
                            title="Reducir zoom"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <div className="bg-white/10 px-3 py-1 rounded-md text-white text-sm">{Math.round(diagramZoom * 100)}%</div>
                        <button
                            className="p-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                            onClick={() => handleZoomChange(0.1)}
                            title="Aumentar zoom"
                        >
                            <ZoomIn size={18} />
                        </button>
                        <button
                            className="p-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                            onClick={handleResetZoom}
                            title="Restablecer zoom"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            className="p-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                            onClick={handleCenterDiagram}
                            title="Centrar diagrama"
                        >
                            <Maximize size={18} />
                        </button>
                    </div>
                </div>

                <div
                    className={`flex-1 overflow-auto p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
                    ref={diagramContainerRef}
                >
                    <div
                        className={`relative h-[1000px] w-[1000px] border border-dashed ${isDarkMode ? "border-gray-700" : "border-gray-300"} rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-white"} p-4`}
                    >
                        {/* SVG for relationships */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                            {relationships.map((rel) => (
                                <Relationship
                                    key={rel.id}
                                    id={rel.id}
                                    start={entities[rel.from].position}
                                    end={entities[rel.to].position}
                                    type={rel.type}
                                    scale={diagramZoom}
                                    selected={selectedRelationship === rel.id}
                                    onSelect={handleRelationshipSelect}
                                />
                            ))}
                        </svg>

                        {/* Draggable entities */}
                        {Object.values(entities).map((entity) => (
                            <DraggableEntity
                                key={entity.id}
                                id={entity.id}
                                initialPosition={entity.position}
                                onDrag={handleEntityDrag}
                                scale={diagramZoom}
                                selected={selectedEntity === entity.id}
                                onSelect={handleEntitySelect}
                            >
                                <div
                                    className={`font-medium mb-2 flex justify-between items-center ${selectedEntity === entity.id ? "text-[#250d46]" : "text-gray-800"
                                        }`}
                                >
                                    <span>{entity.name}</span>
                                    <div className="flex gap-1">
                                        <button
                                            className="p-1 text-gray-500 hover:text-[#250d46] rounded"
                                            onClick={() => alert(`Editar entidad ${entity.name}`)}
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">{entity.description}</div>
                                <div className="space-y-1 text-sm">
                                    {

                                        entity.columns.map((column) => {

                                            return (
                                                <div key={column.name} className="flex items-center">
                                                    {column.isPrimary && <span className="text-[#250d46] mr-1">🔑</span>}
                                                    <span className="text-gray-700">
                                                        {column.name} ({column.type})
                                                    </span>
                                                </div>
                                            )
                                        })}
                                </div>
                            </DraggableEntity>
                        ))}


                    </div>
                </div>
            </div>

            {/* Modal for adding relationship */}
            {showRelationshipModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-[#250d46]/90 text-white"} rounded-lg p-6 w-96 max-w-full shadow-xl`}
                    >
                        <h3 className="text-lg font-medium mb-4 text-white">Crear nueva relación</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/90">Desde entidad</label>
                                <select
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                        }`}
                                    value={newRelationship.from}
                                    onChange={(e) => setNewRelationship({ ...newRelationship, from: e.target.value })}
                                >
                                    <option value="">Seleccionar entidad</option>
                                    {Object.values(entities).map((entity) => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/90">Hacia entidad</label>
                                <select
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                        }`}
                                    value={newRelationship.to}
                                    onChange={(e) => setNewRelationship({ ...newRelationship, to: e.target.value })}
                                >
                                    <option value="">Seleccionar entidad</option>
                                    {Object.values(entities).map((entity) => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/90">Tipo de relación</label>
                                <select
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-white ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-[#250d46]/60 border-[#250d46]/30 text-white"
                                        }`}
                                    value={newRelationship.type}
                                    onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value })}
                                >
                                    <option value="oneToOne">Uno a uno (1:1)</option>
                                    <option value="oneToMany">Uno a muchos (1:N)</option>
                                    <option value="manyToMany">Muchos a muchos (N:M)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 border border-white/30 rounded text-sm text-white hover:bg-[#250d46]/60"
                                onClick={() => setShowRelationshipModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-white text-[#250d46] rounded text-sm hover:bg-opacity-90 shadow-sm font-medium"
                                onClick={handleAddRelationship}
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
