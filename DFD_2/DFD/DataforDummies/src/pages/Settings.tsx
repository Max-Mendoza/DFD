import { useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"

// Simple icon components using SVG to avoid Lucide dependency
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
)

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
    <path d="M20 12v4H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14z"></path>
  </svg>
)

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3 text-purple-300"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export default function SettingsPage() {
  const { user, loading } = useAuth()


  const navigate = useCallback((path: string) => {
    window.location.href = path
  }, [])

  const [activeTab, setActiveTab] = useState("profile")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  if (loading || !user) {
    return (
      <h1 className="text-white">Cargando...</h1>
    )
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Configuración
          </h1>
          <p className="text-purple-200/60">Administra tu cuenta y preferencias</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md">
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="bg-white/10 p-1 mb-6 rounded-md flex">
          {[
            { id: "profile", label: "Perfil", icon: <UserIcon /> },
            { id: "security", label: "Seguridad", icon: <ShieldIcon /> },
            { id: "preferences", label: "Preferencias", icon: <BellIcon /> },
            
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${activeTab === tab.id ? "bg-white text-gray-800 font-medium" : "text-white hover:bg-white/5"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">Información personal</h2>
                  <p className="text-purple-200/60 text-sm">Actualiza tu información personal y de contacto</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm text-purple-200/60 mb-1.5 block">Nombre</label>
                      <input
                        type="text"
                        defaultValue={`${user.name}`}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                      />
                    </div>
                    
                  </div>
                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      defaultValue={`${user.email}`}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Empresa</label>
                    <input
                      type="text"
                      defaultValue="Data Analytics Inc."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Cargo</label>
                    <input
                      type="text"
                      defaultValue="Data Analyst"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    />
                  </div>
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md">
                    Actualizar información
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">Foto de perfil</h2>
                  <p className="text-purple-200/60 text-sm">Actualiza tu foto de perfil</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-32 w-32 rounded-full bg-purple-700 flex items-center justify-center text-2xl text-white">
                    AJ
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button className="w-full py-2 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md">
                      Cambiar foto
                    </button>
                    <button className="w-full py-2 border border-white/10 bg-white/90 text-red-600 hover:bg-white font-medium rounded-md">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 mr-2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <h2 className="text-xl font-semibold text-white">Contraseña y autenticación</h2>
                </div>
                <p className="text-purple-200/60 text-sm mb-4">Gestiona tu contraseña y métodos de autenticación</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Contraseña</p>
                      <p className="text-sm text-purple-200/60">Última actualización: hace 3 meses</p>
                    </div>
                    <button className="px-3 py-1.5 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center">
                      <EyeIcon />
                      Cambiar
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Autenticación de dos factores</p>
                      <p className="text-sm text-purple-200/60">Añade una capa extra de seguridad</p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactor ? "bg-purple-600" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactor ? "translate-x-6" : "translate-x-1"}`}
                        onClick={() => setTwoFactor(!twoFactor)}
                      />
                    </div>
                  </div>

                  {twoFactor && (
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <p className="text-white font-medium mb-2">Autenticación de dos factores activada</p>
                      <p className="text-sm text-purple-200/80 mb-3">
                        Tu cuenta está protegida con autenticación de dos factores. Se te pedirá un código cada vez que
                        inicies sesión.
                      </p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12" y2="18"></line>
                          </svg>
                          Configurar app
                        </button>
                        <button className="px-3 py-1.5 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                          </svg>
                          Códigos de respaldo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-center">
                  <ShieldIcon />
                  <h2 className="text-xl font-semibold text-white">Seguridad de la cuenta</h2>
                </div>
                <p className="text-purple-200/60 text-sm mb-4">Configura opciones adicionales de seguridad</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Tiempo de sesión</p>
                      <p className="text-sm text-purple-200/60">Cerrar sesión después de 30 minutos de inactividad</p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sessionTimeout ? "bg-purple-600" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sessionTimeout ? "translate-x-6" : "translate-x-1"}`}
                        onClick={() => setSessionTimeout(!sessionTimeout)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Alertas de inicio de sesión</p>
                      <p className="text-sm text-purple-200/60">Recibir alertas de inicios de sesión sospechosos</p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${loginAlerts ? "bg-purple-600" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loginAlerts ? "translate-x-6" : "translate-x-1"}`}
                        onClick={() => setLoginAlerts(!loginAlerts)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white font-medium mb-2">Dispositivos conectados</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-purple-600/20 p-2 rounded-full mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-purple-300"
                            >
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                              <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                          </div>
                          <div>
                            <p className="text-white text-sm">iPhone 13 Pro - Madrid</p>
                            <p className="text-xs text-purple-200/60">Activo ahora</p>
                          </div>
                        </div>
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">Actual</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-purple-600/20 p-2 rounded-full mr-3">
                            <GlobeIcon />
                          </div>
                          <div>
                            <p className="text-white text-sm">Chrome - Windows</p>
                            <p className="text-xs text-purple-200/60">Hace 2 días</p>
                          </div>
                        </div>
                        <button className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-md text-sm">
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-2 border border-white/10 bg-white/90 text-red-600 hover:bg-white font-medium rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Cerrar todas las sesiones
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-center">
                  <BellIcon />
                  <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
                </div>
                <p className="text-purple-200/60 text-sm mb-4">
                  Configura cómo y cuándo quieres recibir notificaciones
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificaciones por email</p>
                      <p className="text-sm text-purple-200/60">Recibe actualizaciones importantes por email</p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? "bg-purple-600" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`}
                        onClick={() => setNotifications(!notifications)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificaciones push</p>
                      <p className="text-sm text-purple-200/60">Recibe notificaciones en tiempo real</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Resumen semanal</p>
                      <p className="text-sm text-purple-200/60">Recibe un resumen de actividad cada semana</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificaciones de marketing</p>
                      <p className="text-sm text-purple-200/60">Recibe ofertas y novedades</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 mr-2"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <h2 className="text-xl font-semibold text-white">Apariencia y localización</h2>
                </div>
                <p className="text-purple-200/60 text-sm mb-4">Personaliza la apariencia y configuración regional</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Modo oscuro</p>
                      <p className="text-sm text-purple-200/60">Ajusta el tema de la aplicación</p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? "bg-purple-600" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`}
                        onClick={() => setDarkMode(!darkMode)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Idioma</label>
                    <button className="w-full py-2 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center justify-center">
                      <GlobeIcon />
                      Español
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Zona horaria</label>
                    <button className="w-full py-2 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      (GMT+01:00) Madrid
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-purple-200/60 mb-1.5 block">Formato de fecha</label>
                    <button className="w-full py-2 border border-white/10 bg-white/90 text-gray-800 hover:bg-white font-medium rounded-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      DD/MM/AAAA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  )
}
