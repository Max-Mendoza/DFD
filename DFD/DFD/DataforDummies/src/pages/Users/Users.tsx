"use client"
import { useState, useEffect } from "react"
import { Search, UserPlus, X, MessageCircle, RotateCcw } from "lucide-react"
import axiosInstance from "@/api/axiosInstance"
import type { User } from "@/api/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchUsers } from "@/api/users/usersNotSent"
import { fetchUsersPendingReceived } from "@/api/users/usersPendingReceived"
import { fetchUsersPendingSent } from "@/api/users/usersPendingSent"
import { fetchUsersAccepted } from "@/api/users/usersContacts"
import ChatComponent from "@/components/Messages/ChatComponent"

export default function Users() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [addedContacts, setAddedContacts] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<string>("search")
  const [chatUser, setChatUser] = useState<User | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const currentUserId = 1 // Obtén este ID del contexto de autenticación

  const handleOpenChat = (user: User) => {
    setChatUser(user)
    setIsChatOpen(true)
  }

  // Función para cerrar el chat
  const handleCloseChat = () => {
    setIsChatOpen(false)
    setChatUser(null)
  }

  // Aca para mandar la solicitud de contacto
  const addContact = async (id: number) => {
    const response = await axiosInstance.post("/contacts/", {
      receiver: id,
      state: "pending",
    })
    return response.data
  }

  //Para destruir la solicitud
  const handleDestroyRequest = async (userTwo: number) => {
    const response = await axiosInstance.delete("/contacts/delete/", {
      data: {
        user_two: userTwo,
      },
    })
    return response.data
  }

  // para aceptar la solicitud
  const acceptRequest = async (userTwo: number) => {
    const response = await axiosInstance.patch("/contacts/accept/", {
      user_two: userTwo,
    })
    return response.data
  }

  const {
    data: users,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useQuery<User[]>({
    queryFn: fetchUsers,
    queryKey: ["users"],
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: pendingContactsReceived,
    isLoading: isLoading1,
    error: error1,
    refetch: refetchPendingCR,
  } = useQuery<User[]>({
    queryFn: fetchUsersPendingReceived,
    queryKey: ["usersPendingR"],
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: pendingContactsSent,
    isLoading: isLoading2,
    error: error2,
    refetch: refetchPendingCS,
  } = useQuery<User[]>({
    queryFn: fetchUsersPendingSent,
    queryKey: ["usersPendingS"],
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: usersContacts,
    isLoading: isLoading3,
    error: error3,
    refetch: refetchC,
  } = useQuery<User[]>({
    queryFn: fetchUsersAccepted,
    queryKey: ["usersContacts"],
    staleTime: 1000 * 60 * 5,
  })

  const addContactMutation = useMutation({
    mutationFn: addContact,
    onMutate: async () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["usersPendingS"] })
    },
    onError: (error) => {
      console.error("Ocurrio un error, papu: ", error)
    },
  })

  const cancelRequestMutation = useMutation({
    mutationFn: handleDestroyRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersPendingS"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      console.error("Ocurrio un error, papu: ", error)
    },
  })

  const rejectRequestMutation = useMutation({
    mutationFn: handleDestroyRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["usersPendingR"] })
    },
    onError: (error) => {
      console.error("Ocurrio un error, papu: ", error)
    },
  })

  const acceptRequestMutation = useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersPendingR"] })
      queryClient.invalidateQueries({ queryKey: ["usersContacts"] })
    },
    onError: (error) => {
      console.error("Ocurrio un error, papu: ", error)
    },
  })

  const deleteContactMutation = useMutation({
    mutationFn: handleDestroyRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["usersContacts"] })
    },
  })

  // Simple console log para ver los usuarios
  useEffect(() => {
    console.log("Usuarios actualizados:", users)
    console.log("pending actualizados:", pendingContactsSent)
  }, [users])

  return (
    <div className="min-h-screen p-4">
      {/* Literalmente el header jaja */}
      <header className="mb-6 px-5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl md:text-3xl">Contactos</h1>
            <p className="text-white/40 text-base md:text-xl font-thin">Encuentra y gestiona tus contactos</p>
          </div>
        </div>
      </header>

      {/* Headbar para cambiar de seccion */}
      <div className="flex mb-6 border-b border-white/10 ml-5 justify-between">
        <div>
          {/* boton para la seccion de busqueda de usuarios */}
          <button
            className={`px-4 py-2 text-white cursor-pointer font-medium relative ${activeTab === "search" ? "text-[#9334ea]" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveTab("search")}
          >
            Buscar
            {activeTab === "search" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9334ea]" />}
          </button>
          {/* Boton para la seccion de pending */}
          <button
            className={`px-4 py-2 text-white cursor-pointer font-medium relative ${activeTab === "pending" ? "text-[#9334ea]" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pendientes
            {pendingContactsReceived != undefined && pendingContactsReceived.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#9334ea] rounded-full">
                {pendingContactsReceived?.length}
              </span>
            )}
            {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9334ea]" />}
          </button>
          {/* Boton para la seccion de contactos (ya aceptaron la soli o te la aceptaron) */}
          <button
            className={`px-4 py-2 text-white cursor-pointer font-medium relative ${activeTab === "contacts" ? "text-[#9334ea]" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveTab("contacts")}
          >
            Mis Contactos
            {activeTab === "contacts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9334ea]" />}
          </button>
        </div>
        <button
          onClick={() => {
            refetchC()
            refetchPendingCR()
            refetchPendingCS()
            refetchUsers()
          }}
          className="p-2 bg-transparent cursor-pointer text-white rounded-full hover:text-purple-500/30 transition-colors self-end"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Seccion de buscar usuarios */}
      {activeTab === "search" && (
        <div className="space-y-6 ml-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o @usuario"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9334ea]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="text-white/60 text-center py-8 col-span-full">Cargando usuarios...</div>
            ) : users != undefined ? (
              users
                .filter(
                  (user) =>
                    searchTerm.trim() === "" ||
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1E0A3C] bg-green-500"></span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name || user.email}</div>
                        <div className="text-white/60 text-sm">@{user.email?.split("@")[0]}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {addedContacts.includes(user.id) ? (
                        <button className="p-2 bg-[#9334ea]/20 text-[#9334ea] rounded-full hover:bg-[#9334ea]/30 transition-colors">
                          <MessageCircle size={18} />
                        </button>
                      ) : pendingContactsSent?.some((pendingUser) => pendingUser.id === user.id) ? (
                        <span className="text-white/60 text-sm px-3 py-1 bg-white/10 rounded-full">Pendiente</span>
                      ) : (
                        <button
                          onClick={() => addContactMutation.mutate(user.id)}
                          className="flex cursor-pointer items-center gap-1 bg-[#9334ea] text-white px-3 py-1.5 rounded-full hover:bg-[#9334ea]/80 transition-colors"
                        >
                          <UserPlus size={14} />
                          <span className="text-sm">Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-white/60 text-center py-8 col-span-full">
                No se encontraron usuarios con ese criterio de búsqueda
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seccion de pending */}
      {activeTab === "pending" && (
        <div className="space-y-4 ml-5">
          <h3 className="text-white/80 font-medium">Solicitudes enviadas</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pendingContactsSent != undefined && pendingContactsSent.length > 0 ? (
              pendingContactsSent.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-white/60 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cancelRequestMutation.mutate(user.id)}
                      className="p-2 bg-red-500/20 cursor-pointer text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-center py-8 col-span-full">No tienes solicitudes enviadas</div>
            )}
          </div>

          <h3 className="text-white/80 font-medium">Solicitudes recibidas</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pendingContactsReceived != undefined && pendingContactsReceived.length > 0 ? (
              pendingContactsReceived.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-white/60 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectRequestMutation.mutate(user.id)}
                      className="p-2 bg-red-500/20 cursor-pointer text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => acceptRequestMutation.mutate(user.id)}
                      className="p-2 bg-green-500/20 cursor-pointer text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-center py-8 col-span-full">No tienes solicitudes pendientes</div>
            )}
          </div>
        </div>
      )}

      {/* Seccion de contactos (soli aceptada) */}
      {activeTab === "contacts" && (
        <div className="space-y-6 ml-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {usersContacts != undefined && usersContacts.length > 0 ? (
              usersContacts.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col items-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/8 transition-colors hover:-translate-y-1"
                >
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1E0A3C] bg-green-500"></span>
                  </div>
                  <div className="text-white font-medium text-center">{user.name}</div>
                  <div className="text-white/60 text-sm text-center mb-4">{user.email}</div>
                  <div className="flex flex-row gap-3 w-full">
                    <button
                      className="flex-1 flex items-center cursor-pointer justify-center gap-1 bg-[#9334ea]/20 text-white px-3 py-1.5 rounded-full hover:bg-[#9334ea]/30 transition-colors"
                      onClick={() => {
                        handleOpenChat(user)
                      }}
                    >
                      <MessageCircle size={14} />
                      <span className="text-sm">Mensaje</span>
                    </button>
                    <button
                      className="flex-1 flex items-center cursor-pointer justify-center gap-1 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-500/30 transition-colors"
                      onClick={() => deleteContactMutation.mutate(user.id)}
                    >
                      <X size={14} />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-center py-12 col-span-full">No tienes contactos agregados</div>
            )}
          </div>
        </div>
      )}

      {chatUser && (
        <ChatComponent user={chatUser} isOpen={isChatOpen} onClose={handleCloseChat} currentUserId={currentUserId} />
      )}
    </div>
  )
}
