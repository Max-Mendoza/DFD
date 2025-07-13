import { useState } from "react"
import { motion } from "framer-motion"
import { Navigate, useNavigate, useParams } from "react-router"
import { CheckCircle, AlertCircle } from "lucide-react"
import api from "@/lib/api"

import axios from "axios"

export default function AccountActivation() {

    const navigate = useNavigate()
    const [activationStatus, setActivationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const { uid, token } = useParams<{ uid: string; token: string }>()
    console.log("uid:", uid)
    console.log("token:", token)
    // Activar la cuenta con solo presionar el botón
    const handleActivation = async () => {
  if (!uid || !token) {
    setActivationStatus("error")
    return
  }

  try {
    setActivationStatus("loading")
    await axios.post(
      "http://localhost:5000/auth/users/activation/",
      { uid, token },
      { headers: { "Content-Type": "application/json" } }
    )
    setActivationStatus("success")
  } catch (error) {
    console.error("Error activando cuenta:", error)
    setActivationStatus("error")
  }
}


    // Redirigir al inicio después de la activación exitosa
    const handleContinue = () => {
        navigate("/login")
    }

    // Reintentar la activación
    const handleRetry = () => {
        setActivationStatus("idle")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl"
            >
                {activationStatus === "idle" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl font-bold text-white mb-4">Activar tu cuenta</h1>
                            <p className="text-purple-200">
                                Estás a un paso de activar tu cuenta y comenzar a disfrutar de todos los beneficios
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
                                    <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>

                        <motion.button
                            onClick={handleActivation}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
                        >
                            Activar cuenta
                        </motion.button>

                        <p className="mt-6 text-purple-300 text-sm">
                            Al activar tu cuenta, aceptas nuestros términos y condiciones
                        </p>
                    </motion.div>
                )}

                {activationStatus === "loading" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
                            className="w-16 h-16 border-4 border-purple-300 border-t-purple-500 rounded-full mx-auto mb-8"
                        />
                        <h2 className="text-2xl font-bold text-white mb-2">Activando cuenta</h2>
                        <p className="text-purple-200">
                            Estamos verificando y activando tu cuenta. Esto tomará solo unos segundos...
                        </p>
                    </motion.div>
                )}

                {activationStatus === "success" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta activada!</h2>
                        <p className="text-purple-200 mb-8">
                            Tu cuenta ha sido activada exitosamente. Ahora puedes acceder a todas las funcionalidades.
                        </p>

                        <motion.button
                            onClick={handleContinue}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white text-lg shadow-lg shadow-purple-500/30"
                        >
                            Continuar
                        </motion.button>
                    </motion.div>
                )}

                {activationStatus === "error" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6"
                        >
                            <AlertCircle className="w-12 h-12 text-red-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-2">Error de activación</h2>
                        <p className="text-purple-200 mb-8">
                            No pudimos activar tu cuenta en este momento. Por favor, intenta nuevamente.
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
