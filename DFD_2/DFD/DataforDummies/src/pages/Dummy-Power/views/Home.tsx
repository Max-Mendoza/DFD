"use client"

import { useAuth } from "@/hooks/useAuth"
import SearchInput from "@/components/SearchInput"
import axiosInstance from "@/api/axiosInstance"
import { AnimatedButton } from "@/components/Button"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import CardProject from "@/components/CardProject"
import { AreaChartIcon as ChartArea } from "lucide-react"
import { Modal } from "@/components/Modal"
import { useState } from "react"
import { useNavigate } from "react-router"
import type { ChangeEvent, FormEvent } from "react"

interface Proyect {
  id: number
  name: string
  subject: string
  progress: number
  date: Date
}

export default function Home() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isOpenModal, setIsOpenModal] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
  })

  const createProyect = async () => {
    console.log("Datos enviados:", formData)
    setIsOpenModal(false)
    const response = await axiosInstance.post("/proyects/", formData)
    return response.data
  }

  const fetchProyects = async () => {
    const response = await axiosInstance.get("/proyects/created/")
    console.log(response.data)
    return response.data
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createProyectMutation.mutate()
  }

  const {
    data: proyects,
    isLoading,
    error,
  } = useQuery<Proyect[]>({
    queryFn: fetchProyects,
    queryKey: ["proyects"],
    staleTime: 1000 * 60 * 5,
  })

  const createProyectMutation = useMutation({
    mutationFn: createProyect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proyects"] })
    },
  })

  if (!user) {
    return (
      <>
        <h1>Cargando jaja</h1>
      </>
    )
  }

  return (
    <>
      <header className="p-4">
        <div className="px-5">
          <h1 className="text-white font-bold text-3xl">Bienvenido de vuelta, {`${user.name}`}</h1>
          <p className="text-white/40 text-xl font-thin">Continua donde lo dejaste</p>
        </div>
        <div className="flex px-5 gap-4 mt-4">
          <SearchInput className="flex-1/2" />
          <AnimatedButton
            className="flex-1/6 bg-[#9533e8] text-white"
            startIcon={Plus}
            colorIcon="white"
            onClick={() => {
              setIsOpenModal(true)
            }}
          >
            Nuevo Proyecto
          </AnimatedButton>
        </div>
      </header>

      <section className="p-10 grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
        {proyects?.map((proyect) => (
          <CardProject
            key={proyect.id}
            time={proyect.date.toString()}
            title={proyect.name}
            icon={ChartArea}
            description={proyect.subject}
            progress={proyect.progress}
            people={1}
            onClickProject={() => navigate(`/proyects/${proyect.id}`)}
          />
        ))}
      </section>

      <Modal
        onClose={() => {
          setIsOpenModal(false)
        }}
        isOpen={isOpenModal}
        title="Crear Un Nuevo Proyecto"
      >
        <div className="min-h-50 bg-transparent flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#250d46] rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo: Nombre del Proyecto */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium uppercase tracking-wider text-purple-300 mb-2"
                >
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#250d46]/60 border border-purple-400/30 rounded-lg text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="Ej: Dashboard de ventas"
                  required
                />
              </div>

              {/* Campo: Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium uppercase tracking-wider text-purple-300 mb-2"
                >
                  Subject
                </label>
                <textarea
                  id="subject"
                  name="subject"
                  rows={4}
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#250d46]/60 border border-purple-400/30 rounded-lg text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
                  placeholder="Describe tu proyecto..."
                  required
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium uppercase text-sm tracking-wider rounded-lg hover:from-purple-700 hover:to-blue-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                Crear Proyecto
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  )
}