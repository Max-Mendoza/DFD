import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router"
import { CheckCircle, AlertCircle, Lock } from "lucide-react"
import axios from "axios"

export default function PasswordReset() {
  const navigate = useNavigate()
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { uid, token } = useParams<{ uid: string; token: string }>()

  const [passwords, setPasswords] = useState({
    new_password: "",
    re_new_password: "",
  })

  const [passwordError, setPasswordError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))

    // Limpiar error cuando el usuario comienza a escribir de nuevo
    if (passwordError) setPasswordError("")
  }

  // Validar contraseñas
  const validatePasswords = () => {
    if (passwords.new_password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return false
    }

    if (passwords.new_password !== passwords.re_new_password) {
      setPasswordError("Las contraseñas no coinciden")
      return false
    }

    return true
  }

  // Restablecer la contraseña
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) return

    try {
      setResetStatus("loading")
      await axios.post(
        "http://localhost:8000/auth/users/reset_password_confirm/",
        {
          uid,
          token,
          new_password: passwords.new_password,
          re_new_password: passwords.re_new_password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      setResetStatus("success")
    } catch (error: any) {
      console.error("Error restableciendo contraseña:", error)
      setErrorMessage(error.response?.data?.detail || "Ocurrió un error al restablecer tu contraseña")
      setResetStatus("error")
    }
  }

  // Redirigir al inicio de sesión
  const handleContinue = () => {
    navigate("/login")
  }

  // Reintentar el restablecimiento
  const handleRetry = () => {
    setResetStatus("idle")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl"
      >
        {resetStatus === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-4">Restablecer contraseña</h1>
              <p className="text-purple-200">Crea una nueva contraseña para tu cuenta</p>
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
                  <Lock className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    name="new_password"
                    value={passwords.new_password}
                    onChange={handleChange}
                    placeholder="Nueva contraseña"
                    required
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    name="re_new_password"
                    value={passwords.re_new_password}
                    onChange={handleChange}
                    placeholder="Confirmar nueva contraseña"
                    required
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {passwordError && <p className="text-red-400 text-sm text-left">{passwordError}</p>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30 mt-4"
              >
                Restablecer contraseña
              </motion.button>
            </form>

            <p className="mt-6 text-purple-300 text-sm">Asegúrate de crear una contraseña segura y fácil de recordar</p>
          </motion.div>
        )}

        {resetStatus === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-300 border-t-purple-500 rounded-full mx-auto mb-8"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Restableciendo contraseña</h2>
            <p className="text-purple-200">Estamos actualizando tu contraseña. Esto tomará solo unos segundos...</p>
          </motion.div>
        )}

        {resetStatus === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña restablecida!</h2>
            <p className="text-purple-200 mb-8">
              Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>

            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
            >
              Iniciar sesión
            </motion.button>
          </motion.div>
        )}

        {resetStatus === "error" && (
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
              {errorMessage || "No pudimos restablecer tu contraseña en este momento. Por favor, intenta nuevamente."}
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