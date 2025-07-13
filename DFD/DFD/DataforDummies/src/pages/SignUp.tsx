"use client"

import type React from "react"
import api from "@/lib/api"

import { AnimatedButton } from "@/components/Button"
import { MaterialInput } from "@/components/Input"
import { Lock, Mail, ChromeIcon as Google, Github, User, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Separator } from "@/components/Separator"
import { useState, useEffect } from "react"
import axios from "axios"

export default function SignUp() {
  const [email, setEmail] = useState<string>("")
  const [user, setUser] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [passwordConfirm, setPasswordConfirm] = useState<string>("")
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("")
  const [captchaQuestion, setCaptchaQuestion] = useState<{ question: string; answer: number }>({
    question: "",
    answer: 0,
  })
  const [errors, setErrors] = useState<{
    email?: string
    user?: string
    password?: string
    passwordConfirm?: string
    captcha?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
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

  // Validación de usuario
  const validateUser = (user: string): string | null => {
    if (!user.trim()) {
      return "El nombre de usuario es requerido"
    }
    if (user.length < 3) {
      return "El usuario debe tener al menos 3 caracteres"
    }
    if (user.length > 20) {
      return "El usuario no puede tener más de 20 caracteres"
    }
    if (!/^[a-zA-Z0-9_]+$/.test(user)) {
      return "Solo se permiten letras, números y guiones bajos"
    }
    return null
  }

  // Validación de contraseña (actualizada)
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return "La contraseña es requerida"
    }
    if (password.length < 12) {
      return "La contraseña debe tener al menos 12 caracteres"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Debe contener al menos una letra minúscula"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Debe contener al menos una letra mayúscula"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Debe contener al menos un número"
    }
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      return "Debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;':\",./<>?)"
    }
    return null
  }

  // Validación de confirmación de contraseña
  const validatePasswordConfirm = (passwordConfirm: string, password: string): string | null => {
    if (!passwordConfirm) {
      return "Confirma tu contraseña"
    }
    if (passwordConfirm !== password) {
      return "Las contraseñas no coinciden"
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
    const userError = validateUser(user)
    const passwordError = validatePassword(password)
    const passwordConfirmError = validatePasswordConfirm(passwordConfirm, password)
    const captchaError = validateCaptcha(captchaAnswer)

    if (emailError) newErrors.email = emailError
    if (userError) newErrors.user = userError
    if (passwordError) newErrors.password = passwordError
    if (passwordConfirmError) newErrors.passwordConfirm = passwordConfirmError
    if (captchaError) newErrors.captcha = captchaError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (errors.email) {
      const emailError = validateEmail(value)
      setErrors((prev) => ({
        ...prev,
        email: emailError || undefined,
      }))
    }
  }

  const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUser(value)

    if (errors.user) {
      const userError = validateUser(value)
      setErrors((prev) => ({
        ...prev,
        user: userError || undefined,
      }))
    }
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)

    if (errors.password) {
      const passwordError = validatePassword(value)
      setErrors((prev) => ({
        ...prev,
        password: passwordError || undefined,
      }))
    }

    if (passwordConfirm && errors.passwordConfirm) {
      const passwordConfirmError = validatePasswordConfirm(passwordConfirm, value)
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: passwordConfirmError || undefined,
      }))
    }
  }

  const handleChangePasswordConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPasswordConfirm(value)

    if (errors.passwordConfirm) {
      const passwordConfirmError = validatePasswordConfirm(value, password)
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: passwordConfirmError || undefined,
      }))
    }
  }

  const handleChangeCaptcha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCaptchaAnswer(value)

    if (errors.captcha) {
      const captchaError = validateCaptcha(value)
      setErrors((prev) => ({
        ...prev,
        captcha: captchaError || undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isBlocked) {
    return;
  }

  setErrors({});
  setSuccess(null);

  if (!validateForm()) {
    setAttempts((prev) => prev + 1);
    if (attempts + 1 >= 3) {
      setIsBlocked(true);
      setBlockTimeLeft(300);
      setErrors({ general: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos." });
      generateCaptcha();
    }
    return;
  }

  setIsLoading(true);

  try {
    const response = await api.post("/auth/users/", {
      name: user,
      email,
      password,
      re_password: passwordConfirm,
    });

    setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
    navigate("/auth/login")
  } catch (error: any) {
    setAttempts((prev) => prev + 1);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.email?.[0] ||
      error.response?.data?.name?.[0] ||
      "Error al crear la cuenta. Intenta nuevamente.";

    setErrors({ general: errorMessage });
    generateCaptcha();

    if (attempts + 1 >= 3) {
      setIsBlocked(true);
      setBlockTimeLeft(300);
      setErrors({ general: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos." });
    }
  } finally {
    setIsLoading(false);
  }
};
  // Función para obtener el color del indicador de fortaleza (actualizada)
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 12) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) strength++

    return {
      score: strength,
      label:
        strength === 0
          ? ""
          : strength === 1
            ? "Muy Débil"
            : strength === 2
              ? "Débil"
              : strength === 3
                ? "Regular"
                : strength === 4
                  ? "Buena"
                  : "Muy Fuerte",
      color:
        strength === 0
          ? ""
          : strength === 1
            ? "bg-red-500"
            : strength === 2
              ? "bg-orange-500"
              : strength === 3
                ? "bg-yellow-500"
                : strength === 4
                  ? "bg-blue-500"
                  : "bg-green-500",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <>
      <h1 className="text-4xl mt-4 font-bold text-[#775da3] ml-4">¡Registrate!</h1>

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

      <form className="mx-10 mt-5 flex flex-col" onSubmit={handleSubmit}>
        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        {/* Error general */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Campo Email */}
        <div className="mb-5">
          <label htmlFor="email" className="mb-2 block text-white">
            Email
          </label>
          <MaterialInput
            id="email"
            type="email"
            label=""
            value={email}
            className={`border-white/20 text-white/50 bg-transparent rounded ${
              errors.email ? "border-red-500/50" : ""
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

        {/* Campo Usuario */}
        <div className="mb-5">
          <label htmlFor="user" className="mb-2 block text-white">
            Usuario
          </label>
          <MaterialInput
            id="user"
            type="text"
            label=""
            value={user}
            className={`border-white/20 text-white/50 bg-transparent rounded ${errors.user ? "border-red-500/50" : ""}`}
            startIcon={User}
            onChange={handleChangeUser}
            placeholder="tu_usuario"
            disabled={isBlocked}
          />
          {errors.user && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.user}
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
              errors.password ? "border-red-500/50" : ""
            }`}
            startIcon={Lock}
            onChange={handleChangePassword}
            placeholder="••••••••••••"
            disabled={isBlocked}
          />

          {/* Indicador de fortaleza */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength.score ? passwordStrength.color : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">Fortaleza: {passwordStrength.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos
              </p>
            </div>
          )}

          {errors.password && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Campo Confirmar Contraseña */}
        <div className="mb-5">
          <label htmlFor="passwordConfirm" className="mb-2 block text-white">
            Confirma Tu Contraseña
          </label>
          <MaterialInput
            id="passwordConfirm"
            type="password"
            label=""
            value={passwordConfirm}
            className={`border-white/20 text-white/50 bg-transparent rounded ${
              errors.passwordConfirm
                ? "border-red-500/50"
                : passwordConfirm && password && passwordConfirm === password
                  ? "border-green-500/50"
                  : ""
            }`}
            startIcon={Lock}
            onChange={handleChangePasswordConfirm}
            placeholder="••••••••••••"
            disabled={isBlocked}
          />
          {passwordConfirm && password && passwordConfirm === password && !errors.passwordConfirm && (
            <p className="mt-1 text-green-400 text-xs flex items-center gap-1">
              <CheckCircle size={12} />
              Las contraseñas coinciden
            </p>
          )}
          {errors.passwordConfirm && (
            <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.passwordConfirm}
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

        {/* Botón de registro */}
        <AnimatedButton
          type="submit"
          variant="default"
          className="bg-[#935af5] text-white flex-1 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isBlocked}
        >
          {isLoading ? "Registrando..." : isBlocked ? `Bloqueado (${formatTime(blockTimeLeft)})` : "Regístrate"}
        </AnimatedButton>

        {/* Separador */}
        <div className="relative flex items-center justify-center mb-1">
          <Separator className="absolute w-full bg-white/10" />
          <span className="relative bg-black/20 px-2 text-xs text-gray-400">O continúa con</span>
        </div>

        {/* Botones sociales */}
        <div className="flex flex-1 m-2 mb-0">
          <AnimatedButton
            type="button"
            variant="default"
            startIcon={Google}
            className="bg-white/3 border border-white/20 text-white flex-1 mr-4"
            disabled={isLoading || isBlocked}
          >
            Google
          </AnimatedButton>
          <AnimatedButton
            type="button"
            variant="default"
            startIcon={Github}
            className="bg-white/3 border border-white/20 text-white flex-1 mb-2"
            disabled={isLoading || isBlocked}
          >
            Github
          </AnimatedButton>
        </div>

        {/* Link de login */}
        <div className="text-center text-sm text-gray-400 mb-5">
          ¿Tienes una cuenta?{" "}
          <Link to="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Inicia Sesión
          </Link>
        </div>
      </form>
    </>
  )
}
