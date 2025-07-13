import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"

export default function PasswordRecoveryRequest() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Solicitar recuperación de contraseña
  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setRecoveryStatus("loading")
      await axios.post(
        "http://localhost:8000/auth/users/reset_password/",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      setRecoveryStatus("success")
    } catch (error: any) {
      console.error("Error solicitando recuperación:", error)
      setErrorMessage(error.response?.data?.detail || "Ocurrió un error al procesar tu solicitud")
      setRecoveryStatus("error")
    }
  }

  // Redirigir al inicio
  const handleBackToLogin = () => {
    navigate("/login")
  }

  // Reintentar la solicitud
  const handleRetry = () => {
    setRecoveryStatus("idle")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl"
      >
        {recoveryStatus === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-4">Recuperar contraseña</h1>
              <p className="text-purple-200">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </motion.div>

            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <Mail className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
            </div>

            <form onSubmit={handleRecoveryRequest} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
              >
                Enviar instrucciones
              </motion.button>
            </form>

            <button
              onClick={handleBackToLogin}
              className="mt-6 text-purple-300 hover:text-purple-200 text-sm font-medium"
            >
              Volver al inicio de sesión
            </button>
          </motion.div>
        )}

        {recoveryStatus === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-300 border-t-purple-500 rounded-full mx-auto mb-8"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Procesando solicitud</h2>
            <p className="text-purple-200">Estamos procesando tu solicitud. Esto tomará solo unos segundos...</p>
          </motion.div>
        )}

        {recoveryStatus === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">¡Correo enviado!</h2>
            <p className="text-purple-200 mb-8">
              Hemos enviado un correo a <span className="font-medium">{email}</span> con instrucciones para restablecer
              tu contraseña.
            </p>

            <motion.button
              onClick={handleBackToLogin}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
            >
              Volver al inicio de sesión
            </motion.button>
          </motion.div>
        )}

        {recoveryStatus === "error" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <AlertCircle className="w-12 h-12 text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-purple-200 mb-8">
              {errorMessage || "No pudimos procesar tu solicitud en este momento. Por favor, intenta nuevamente."}
            </p>

            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
            >
              Intentar nuevamente
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}