import { useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"

export default function UsernameRecovery() {
  const [email, setEmail] = useState("")
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setErrorMessage("Por favor ingresa tu correo electrónico")
      return
    }

    try {
      setRecoveryStatus("loading")
      // Endpoint para recuperar nombre de usuario
      await axios.post(
        "http://localhost:8000/auth/users/recover_username/",
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      setRecoveryStatus("success")
    } catch (error: any) {
      console.error("Error recuperando nombre de usuario:", error)
      setErrorMessage(error.response?.data?.detail || "No pudimos procesar tu solicitud. Por favor intenta nuevamente.")
      setRecoveryStatus("error")
    }
  }

  // Reiniciar el formulario
  const handleReset = () => {
    setRecoveryStatus("idle")
    setEmail("")
    setErrorMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl">
        {recoveryStatus === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Recuperar nombre de usuario</h1>
              <p className="text-purple-200">Ingresa tu correo electrónico y te enviaremos tu nombre de usuario</p>
            </div>

            <form onSubmit={handleRecovery} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-purple-200 text-left">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {errorMessage && <div className="text-red-300 text-sm text-left">{errorMessage}</div>}

              <button
                type="submit"
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 transition-colors"
              >
                Recuperar nombre de usuario
              </button>
            </form>

            <p className="mt-6 text-purple-300 text-sm">
              ¿Recordaste tu nombre de usuario?{" "}
              <a href="/login" className="text-purple-400 hover:text-purple-300">
                Iniciar sesión
              </a>
            </p>
          </div>
        )}

        {recoveryStatus === "loading" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-500 rounded-full mx-auto mb-8 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Procesando solicitud</h2>
            <p className="text-purple-200">Estamos verificando tu información. Esto tomará solo unos segundos...</p>
          </div>
        )}

        {recoveryStatus === "success" && (
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">¡Solicitud enviada!</h2>
            <p className="text-purple-200 mb-8">
              Hemos enviado un correo electrónico con tu nombre de usuario a la dirección proporcionada. Por favor
              revisa tu bandeja de entrada.
            </p>

            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 transition-colors"
            >
              Ir a iniciar sesión
            </button>
          </div>
        )}

        {recoveryStatus === "error" && (
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Error en la solicitud</h2>
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