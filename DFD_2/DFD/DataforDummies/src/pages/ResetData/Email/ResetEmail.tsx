import { useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"

export default function UsernameChange() {
  const [currentUsername, setCurrentUsername] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [password, setPassword] = useState("")
  const [changeStatus, setChangeStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Validar el nuevo nombre de usuario
  const validateUsername = (username: string) => {
    if (username.length < 4) {
      return "El nombre de usuario debe tener al menos 4 caracteres"
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "El nombre de usuario solo puede contener letras, números y guiones bajos"
    }
    return ""
  }

  // Manejar el cambio de nombre de usuario
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!currentUsername || !newUsername || !password) {
      setErrorMessage("Por favor completa todos los campos")
      return
    }

    const usernameError = validateUsername(newUsername)
    if (usernameError) {
      setErrorMessage(usernameError)
      return
    }

    if (currentUsername === newUsername) {
      setErrorMessage("El nuevo nombre de usuario debe ser diferente al actual")
      return
    }

    try {
      setChangeStatus("loading")
      // Endpoint para cambiar nombre de usuario
      await axios.post(
        "http://localhost:8000/auth/users/change_username/",
        {
          current_username: currentUsername,
          new_username: newUsername,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Asumiendo que guardas el token en localStorage
          },
        },
      )
      setChangeStatus("success")
    } catch (error: any) {
      console.error("Error cambiando nombre de usuario:", error)
      setErrorMessage(error.response?.data?.detail || "No pudimos procesar tu solicitud. Por favor intenta nuevamente.")
      setChangeStatus("error")
    }
  }

  // Reiniciar el formulario
  const handleReset = () => {
    setChangeStatus("idle")
    setCurrentUsername("")
    setNewUsername("")
    setPassword("")
    setErrorMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl">
        {changeStatus === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Cambiar nombre de usuario</h1>
              <p className="text-purple-200">Actualiza tu nombre de usuario completando el siguiente formulario</p>
            </div>

            <form onSubmit={handleUsernameChange} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="currentUsername" className="block text-sm font-medium text-purple-200 text-left">
                  Nombre de usuario actual
                </label>
                <input
                  type="text"
                  id="currentUsername"
                  value={currentUsername}
                  onChange={(e) => setCurrentUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="usuario_actual"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newUsername" className="block text-sm font-medium text-purple-200 text-left">
                  Nuevo nombre de usuario
                </label>
                <input
                  type="text"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="nuevo_usuario"
                  required
                />
                <p className="text-xs text-purple-300 text-left">
                  Mínimo 4 caracteres, solo letras, números y guiones bajos
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-purple-200 text-left">
                  Contraseña (para confirmar)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              {errorMessage && <div className="text-red-300 text-sm text-left">{errorMessage}</div>}

              <button
                type="submit"
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 transition-colors"
              >
                Cambiar nombre de usuario
              </button>
            </form>

            <p className="mt-6 text-purple-300 text-sm">
              <a href="/dashboard/settings" className="text-purple-400 hover:text-purple-300">
                Volver a configuración
              </a>
            </p>
          </div>
        )}

        {changeStatus === "loading" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-500 rounded-full mx-auto mb-8 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Procesando cambio</h2>
            <p className="text-purple-200">
              Estamos actualizando tu nombre de usuario. Esto tomará solo unos segundos...
            </p>
          </div>
        )}

        {changeStatus === "success" && (
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">¡Nombre de usuario actualizado!</h2>
            <p className="text-purple-200 mb-8">
              Tu nombre de usuario ha sido cambiado exitosamente a <span className="font-semibold">{newUsername}</span>.
              La próxima vez que inicies sesión, deberás usar tu nuevo nombre de usuario.
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard/settings")}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 transition-colors"
            >
              Volver a configuración
            </button>
          </div>
        )}

        {changeStatus === "error" && (
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Error al cambiar nombre de usuario</h2>
            <p className="text-purple-200 mb-8">
              {errorMessage || "No pudimos procesar tu solicitud. Por favor intenta nuevamente."}
            </p>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}