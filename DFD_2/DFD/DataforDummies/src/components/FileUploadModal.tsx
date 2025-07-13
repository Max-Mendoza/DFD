"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Modal } from "./Modal"
import { AnimatedButton as Button } from "@/components/Button"
import { Upload, File, X } from "lucide-react"

interface FileUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onFileUpload: (files: File[]) => void
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileUpload }) => {
    

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const acceptedTypes = [".csv", ".txt", ".xls", ".xlsx"]
    const acceptedMimeTypes = [
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return

        const validFiles = Array.from(files).filter((file) => {
            const extension = "." + file.name.split(".").pop()?.toLowerCase()
            return acceptedTypes.includes(extension) || acceptedMimeTypes.includes(file.type)
        })

        setSelectedFiles((prev) => [...prev, ...validFiles])
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        handleFileSelect(e.dataTransfer.files)
    }

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onFileUpload(selectedFiles)
            setSelectedFiles([])
            onClose()
        }
    }

    const handleClose = () => {
        setSelectedFiles([])
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Subir Archivos" size="lg">
            <div className="space-y-4">
                {/* Zona de drag & drop */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Formatos soportados: CSV, TXT, XLS, XLSX</p>
                </div>

                {/* Input oculto */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />

                {/* Lista de archivos seleccionados */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <h3 className={`font-medium text-gray-900 dark:text-gray-100 `}>
                            Archivos seleccionados ({selectedFiles.length})
                        </h3>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3  rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <File className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                        className="h-8 w-8 cursor-pointer "
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={handleClose} className="cursor-pointer">
                        Cancelar
                    </Button>
                    <Button onClick={handleUpload} disabled={selectedFiles.length === 0} className={`cursor-pointer 
                        ${selectedFiles.length > 0 ? ("bg-white text-black") : ("")} `}>
                        Subir {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
