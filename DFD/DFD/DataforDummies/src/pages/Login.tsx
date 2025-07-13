"use client"

import type React from "react"
import api from "@/lib/api"

import { AnimatedButton } from "@/components/Button"
import { MaterialInput } from "@/components/Input"
import { Mail, Lock, ChromeIcon as Google, Github, AlertCircle, RefreshCw } from "lucide-react"
import { Separator } from "@/components/Separator"
import { Link, useNavigate } from "react-router"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("")
  const [captchaQuestion, setCaptchaQuestion] = useState<{ question: string; answer: number }>({
    question: "",
    answer: 0,
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    captcha?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [attempts, setAttempts] = useState<number>(0)
  const [isBlocked, setIsBlocked] = useState<boolean>(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState<number>(0)
  const navigate = useNavigate()

  // Generar captcha matemático
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operators = ["+", "-", "*"]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    let answer: number
    let question: string

    switch (operator) {
      case "+":
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case "-":
        // Asegurar que el resultado sea positivo
        const larger = Math.max(num1, num2)
        const smaller = Math.min(num1, num2)
        answer = larger - smaller
        question = `${larger} - ${smaller}`
        break
      case "*":
        answer = num1 * num2
        question = `${num1} × ${num2}`
        break
      default:
        answer = num1 + num2
        question = `${num1} + ${num2}`
    }

    setCaptchaQuestion({ question, answer })
    setCaptchaAnswer("")
  }

  // Generar captcha al cargar el componente
  useEffect(() => {
    generateCaptcha()
  }, [])

  // Manejar bloqueo temporal
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(blockTimeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false)
      setAttempts(0)
    }
  }, [isBlocked, blockTimeLeft])

  // Validación de email
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "El email es requerido"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Ingresa un email válido"
    }
    return null
  }

  // Validación de contraseña
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return "La contraseña es requerida"
    }
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres"
    }
    return null
  }

  // Validación de captcha
  const validateCaptcha = (answer: string): string | null => {
    if (!answer.trim()) {
      return "Resuelve la operación matemática"
    }
    if (Number.parseInt(answer) !== captchaQuestion.answer) {
      return "Respuesta incorrecta"
    }
    return null
  }

  // Validar formulario completo
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const captchaError = validateCaptcha(captchaAnswer)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    if (captchaError) newErrors.captcha = captchaError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  if (isBlocked) return

  setErrors({})

  if (!validateForm()) {
    setAttempts((prev) => prev + 1)

    if (attempts + 1 >= 3) {
      setIsBlocked(true)
      setBlockTimeLeft(300) // 5 min
      setErrors({
        general: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos.",
      })
      generateCaptcha()
    }
    return
  }

  setIsLoading(true)

  try {
    // Aquí haces la llamada API directamente si no usas hook, por ejemplo con axios:
    // const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/token/login/`, { email, password })

    // Pero tú usas tu hook `login` que debe manejar la llamada y almacenamiento de token
    await login(email, password)

    navigate("/home")
  } catch (error: any) {
    setAttempts((prev) => prev + 1)

    setErrors({
      general: "Credenciales incorrectas. Verifica tu email y contraseña.",
    })

    generateCaptcha()

    if (attempts + 1 >= 3) {
      setIsBlocked(true)
      setBlockTimeLeft(300)
      setErrors({
        general: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos.",
      })
    }
  } finally {
    setIsLoading(false)
  }
}


  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Validación en tiempo real
    if (errors.email) {
      const emailError = validateEmail(value)
      setErrors((prev) => ({
        ...prev,
        email: emailError || undefined,
      }))
    }
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)

    // Validación en tiempo real
    if (errors.password) {
      const passwordError = validatePassword(value)
      setErrors((prev) => ({
        ...prev,
        password: passwordError || undefined,
      }))
    }
  }

  const handleChangeCaptcha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCaptchaAnswer(value)

    // Validación en tiempo real
    if (errors.captcha) {
      const captchaError = validateCaptcha(value)
      setErrors((prev) => ({
        ...prev,
        captcha: captchaError || undefined,
      }))
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <>
      <h1 className="text-4xl mt-4 font-bold text-[#775da3] ml-4">Bienvenido</h1>
      <p className="text-[#bbb] mt-3 ml-4 mb-6">Ingresa tus datos para ingresar a tu cuenta</p>

      {/* Mostrar intentos restantes */}
      {attempts > 0 && !isBlocked && (
        <div className="mx-10 mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">Intentos restantes: {3 - attempts}</p>
        </div>
      )}

      {/* Mostrar bloqueo */}
      {isBlocked && (
        <div className="mx-10 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm text-center">
            Cuenta bloqueada temporalmente. Tiempo restante: {formatTime(blockTimeLeft)}
          </p>
        </div>
      )}

      <form className="mx-10 mt-5 flex flex-col" onSubmit={handleLogin}>
        {/* Error general */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Campo Email */}
        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block text-white">
            Email
          </label>
          <MaterialInput
            id="email"
            type="email"
            label=""
            value={email}
            className={`border-white/20 text-white/50 bg-transparent rounded ${
              errors.email ? "border-red-500/50 focus:border-red-500" : ""
            }`}
            startIcon={Mail}
            onChange={handleChangeEmail}
            placeholder="tu@email.com"
            disabled={isBlocked}
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.email}
            </p>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="mb-5">
          <label htmlFor="password" className="mb-2 block text-white">
            Contraseña
          </label>
          <MaterialInput
            id="password"
            type="password"
            label=""
            value={password}
            className={`border-white/20 text-white/50 bg-transparent rounded ${
              errors.password ? "border-red-500/50 focus:border-red-500" : ""
            }`}
            startIcon={Lock}
            onChange={handleChangePassword}
            placeholder="••••••••"
            disabled={isBlocked}
          />
          {errors.password && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Campo Captcha */}
        <div className="mb-6">
          <label htmlFor="captcha" className="mb-2 block text-white">
            Verificación de Seguridad
          </label>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 border border-white/20 rounded px-4 py-2 text-white font-mono text-lg">
              {captchaQuestion.question} = ?
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              className="p-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors"
              disabled={isBlocked}
            >
              <RefreshCw size={16} className="text-white" />
            </button>
          </div>
          <MaterialInput
            id="captcha"
            type="number"
            label=""
            value={captchaAnswer}
            className={`border-white/20 text-white/50 bg-transparent rounded ${
              errors.captcha ? "border-red-500/50" : ""
            }`}
            onChange={handleChangeCaptcha}
            placeholder="Respuesta"
            disabled={isBlocked}
          />
          {errors.captcha && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.captcha}
            </p>
          )}
        </div>

        {/* Botón de login */}
        <AnimatedButton
          type="submit"
          variant="default"
          className="bg-[#935af5] text-white flex-1 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isBlocked}
        >
          {isLoading
            ? "Iniciando sesión..."
            : isBlocked
              ? `Bloqueado (${formatTime(blockTimeLeft)})`
              : "Iniciar Sesión"}
        </AnimatedButton>

        {/* Separador */}
        <div className="relative flex items-center justify-center mb-2">
          <Separator className="absolute w-full bg-white/10" />
          <span className="relative bg-black/20 px-2 text-xs text-gray-400">O continúa con</span>
        </div>

        {/* Botones sociales */}
        <div className="flex flex-1 m-5 mb-0">
          <AnimatedButton
            type="button"
            variant="default"
            startIcon={Google}
            className="bg-white/3 border border-white/20 text-white flex-1 mb-8 mr-4"
            disabled={isLoading || isBlocked}
          >
            Google
          </AnimatedButton>
          <AnimatedButton
            type="button"
            variant="default"
            startIcon={Github}
            className="bg-white/3 border border-white/20 text-white flex-1 mb-8"
            disabled={isLoading || isBlocked}
          >
            Github
          </AnimatedButton>
        </div>

        {/* Link de registro */}
        <div className="text-center text-sm text-gray-400 mb-5">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </form>
    </>
  )
}
