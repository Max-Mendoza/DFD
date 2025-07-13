"use client"

import { useState } from "react"
import { Calendar, Edit3, Trash2, Save, X } from "lucide-react"

interface NoteProps {
    id: string | number
    title: string
    text: string
    date: Date
    onUpdate?: (data: { id: string | number; title: string; text: string }) => void
    onDelete?: (data: { id: string | number }) => void
}

export default function Note({ id, title, text, date, onUpdate, onDelete }: NoteProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(title)
    const [editText, setEditText] = useState(text)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleSave = () => {
        if (editTitle.trim() && editText.trim() && onUpdate) {
            onUpdate({
                id,
                title: editTitle.trim(),
                text: editText.trim(),
            })
            setIsEditing(false)
        }
    }

    const handleCancel = () => {
        setEditTitle(title)
        setEditText(text)
        setIsEditing(false)
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete({ id })
        }
        setShowDeleteConfirm(false)
    }

    return (
        <div className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all mt-15 mb-5">
            {/* Header con título y botones */}
            <div className="flex justify-between items-start mb-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-[#250d46]/60 border border-purple-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 mr-4"
                        placeholder="Título de la nota..."
                        autoFocus
                    />
                ) : (
                    <h3 className="font-bold text-white text-lg flex-1">{title}</h3>
                )}

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={!editTitle.trim() || !editText.trim()}
                                className="p-2 rounded-lg hover:bg-green-600/20 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                title="Guardar cambios"
                            >
                                <Save size={16} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 rounded-lg hover:bg-gray-600/20 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                                title="Cancelar"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg hover:bg-purple-600/20 text-purple-300 hover:text-white transition-colors cursor-pointer"
                                title="Editar nota"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                title="Eliminar nota"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Contenido */}
            {isEditing ? (
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    className="w-full bg-[#250d46]/60 border border-purple-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none mb-4"
                    placeholder="Contenido de la nota..."
                />
            ) : (
                <p className="text-purple-200 text-sm leading-relaxed mb-4">{text}</p>
            )}

            {/* Fecha */}
            <div className="flex items-center gap-2 text-xs text-purple-400">
                <Calendar size={12} />
                <span>{date.toString()}</span>
            </div>

            {/* Modal de confirmación para eliminar */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#250d46] border border-red-500/30 rounded-xl p-6 max-w-md mx-4">
                        <h3 className="text-lg font-bold text-white mb-2">¿Eliminar nota?</h3>
                        <p className="text-purple-200 text-sm mb-6">
                            Esta acción no se puede deshacer. La nota "{title}" será eliminada permanentemente.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
