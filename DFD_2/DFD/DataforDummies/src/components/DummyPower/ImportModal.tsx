import { useState, useRef } from "react"
import { Upload, FileText, FileSpreadsheet, X, Check, AlertCircle } from "lucide-react"
import { AnimatedButton as Button } from "@/components/Button"

interface ImportFileContentProps {
  onImport?: (file: File) => void
  onClose?: () => void
}

export const ImportFileContent: React.FC<ImportFileContentProps> = ({ onImport, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tipos de archivos permitidos
  const allowedTypes = [
    { ext: ".txt", type: "text/plain", icon: <FileText className="h-8 w-8 text-purple-400" /> },
    { ext: ".csv", type: "text/csv", icon: <FileSpreadsheet className="h-8 w-8 text-purple-400" /> },
    { ext: ".xls", type: "application/vnd.ms-excel", icon: <FileSpreadsheet className="h-8 w-8 text-purple-400" /> },
    {
      ext: ".xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      icon: <FileSpreadsheet className="h-8 w-8 text-purple-400" />,
    },
  ]

  const acceptString = allowedTypes.map((t) => t.type).join(",")

  // Manejo de eventos de arrastrar y soltar
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Manejo de soltar archivo
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // Manejo de selección de archivo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // Validación y procesamiento del archivo
  const handleFile = (file: File) => {
    // Verificar si el tipo de archivo es permitido
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
    const isAllowed = allowedTypes.some((type) => type.ext === fileExt || type.type === file.type)

    if (!isAllowed) {
      setErrorMessage("Tipo de archivo no soportado. Por favor selecciona un archivo TXT, CSV o XLS/XLSX.")
      setImportStatus("error")
      return
    }

    setSelectedFile(file)
    setImportStatus("idle")
    setErrorMessage("")
  }

  // Iniciar importación
  const startImport = () => {
    if (!selectedFile) return

    setImportStatus("loading")

    // Simulación de proceso de importación
    setTimeout(() => {
      if (onImport) {
        onImport(selectedFile)
      }
      setImportStatus("success")

      // Cerrar modal después de importación exitosa
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    }, 1000)
  }

  // Reiniciar el proceso
  const resetImport = () => {
    setSelectedFile(null)
    setImportStatus("idle")
    setErrorMessage("")
  }

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Área principal */}
      {importStatus !== "success" && (
        <div className="space-y-6">
          {/* Área de arrastrar y soltar */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">Arrastra y suelta tu archivo aquí</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    o{" "}
                    <span
                      className="text-purple-600 dark:text-purple-400 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      selecciona un archivo
                    </span>{" "}
                    de tu dispositivo
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {allowedTypes.map((type, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      {type.icon}
                      <span className="text-sm">{type.ext.toUpperCase().replace(".", "")}</span>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={acceptString}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Archivo seleccionado */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {selectedFile.name.endsWith(".txt") ? (
                    <FileText className="h-8 w-8 text-purple-500" />
                  ) : (
                    <FileSpreadsheet className="h-8 w-8 text-purple-500" />
                  )}
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetImport}
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mensaje de error */}
              {importStatus === "error" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetImport}
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={startImport}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={importStatus === "loading"}
                >
                  {importStatus === "loading" ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    "Importar archivo"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado de éxito */}
      {importStatus === "success" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold">¡Importación exitosa!</h3>
          <p className="text-center text-gray-600 dark:text-gray-400">
            El archivo {selectedFile?.name} ha sido importado correctamente.
          </p>
        </div>
      )}
    </div>
  )
}
