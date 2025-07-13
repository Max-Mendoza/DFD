"use client"

import { useEffect, useState } from "react"
import { Home, Database, GitMerge, BarChart2, MessageSquare, Moon, Globe } from "lucide-react"

import HomeView from "./views/Home"
import TransformView from "./views/Transform"
import ModelsView from "./views/Models"
import VisualizationView from "./views/Visualization"
import ChatbotView from "./views/ChatBot"
import WebScraperView from "./views/WebScraper"

import { type Entities, relationships as initialRelationships, type relationships } from "./lib/data"
import type { Tables } from "./lib/data"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/api/axiosInstance"
import { useParams } from "react-router"
import { getInitialEntities } from "./lib/data"

export default function DataForDummies() {
  const { proyectId } = useParams<string>()
  const queryClient = useQueryClient()

  // obtiene las tablas que hay en mongo db
  const fetchTables = async () => {
    const response = await axiosInstance.get("/proyects/tables/", {
      params: {
        project_id: proyectId,
      },
    })
    console.log(response.data)
    return response.data
  }

  // useQuery para las tablas
  const {
    data: tablesDB = {},
    error: tablesError,
    isLoading: tablesLoading,
    isFetching,
  } = useQuery<Tables>({
    queryKey: ["tables", proyectId],
    queryFn: fetchTables,
    staleTime: 1000 * 60 * 5,
    placeholderData: {},
    retry: 2,
    refetchOnWindowFocus: false,
  })

  // States
  const [tables, setTables] = useState<Tables>(tablesDB)
  const [entities, setEntities] = useState<Entities>({})
  const [activeView, setActiveView] = useState("home")
  const [activeTable, setActiveTable] = useState("sales")
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedRelationship, setSelectedRelationship] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [relationships, setRelationships] = useState<relationships>(initialRelationships)
  const [appliedSteps, setAppliedSteps] = useState([])

  // Navigation items - AGREGUÉ EL WEB SCRAPER
  const navItems = [
    { id: "home", icon: <Home size={20} />, label: "Inicio" },
    { id: "transform", icon: <Database size={20} />, label: "Transformar" },
    { id: "models", icon: <GitMerge size={20} />, label: "Modelos" },
    { id: "visualization", icon: <BarChart2 size={20} />, label: "Visualización" },
    { id: "webscraper", icon: <Globe size={20} />, label: "Web Scraper" },
    { id: "chatbot", icon: <MessageSquare size={20} />, label: "ChatBot" },
  ]

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  // Function to handle entity drag
  const handleEntityDrag = (id, newPosition) => {
    setEntities((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        position: newPosition,
      },
    }))
  }

  // Function to select an entity
  const handleEntitySelect = (id) => {
    setSelectedEntity(id === selectedEntity ? null : id)
    setSelectedRelationship(null)
  }

  // useEffect(() => {
  //   if (tablesDB !=undefined) {
  //     setTables(tablesDB)
  //     setEntities(getInitialEntities(tablesDB))
  //   }
  // }, [tablesDB])

  // Function to select a relationship
  const handleRelationshipSelect = (id) => {
    setSelectedRelationship(id === selectedRelationship ? null : id)
    setSelectedEntity(null)
  }

  return (
    <div
      className={`flex h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-[#250d46]/90 text-white"} overflow-hidden`}
    >
      {/* Left sidebar navigation */}
      <div className={`w-14 ${isDarkMode ? "bg-gray-800" : "bg-[#250d46]"} flex flex-col items-center py-4 shadow-sm`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`p-3 rounded-lg mb-2 relative ${
              activeView === item.id
                ? isDarkMode
                  ? "text-white bg-purple-700"
                  : "text-white bg-white/20"
                : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            onClick={() => setActiveView(item.id)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}

        <div className="mt-auto mb-4">
          <button
            className={`p-3 rounded-lg ${
              isDarkMode
                ? "text-purple-400 hover:text-white hover:bg-gray-700"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Modo oscuro"
            onClick={toggleDarkMode}
          >
            <Moon size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header
          className={`h-14 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-[#250d46] border-[#250d46]/30"} text-white flex items-center px-4 shadow-sm border-b`}
        >
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-semibold mr-8">Data for Dummies</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeView === "home" && (
            <HomeView
              isDarkMode={isDarkMode}
              tables={tables}
              setActiveTable={setActiveTable}
              setActiveView={setActiveView}
              showNotes={showNotes}
              setShowNotes={setShowNotes}
              notes={notes}
              setNotes={setNotes}
              setTables={(table) => {
                setTables((prev) => ({
                  ...prev,
                  [table.name.toLowerCase()]: table,
                }))
              }}
              setEntities={(entity) => {
                setEntities((prev) => ({
                  ...prev,
                  [entity.name.toLowerCase()]: entity,
                }))
              }}
            />
          )}
          {activeView === "transform" && (
            <TransformView
              isDarkMode={isDarkMode}
              tables={tables}
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              appliedSteps={appliedSteps}
              setAppliedSteps={setAppliedSteps}
              addTable={(table) => {
                setTables((prev) => ({
                  ...prev,
                  [table.name.toLowerCase()]: table,
                }))
              }}
            />
          )}
          {activeView === "models" && (
            <ModelsView
              isDarkMode={isDarkMode}
              entities={entities}
              relationships={relationships}
              setRelationships={setRelationships}
              selectedEntity={selectedEntity}
              selectedRelationship={selectedRelationship}
              handleEntityDrag={handleEntityDrag}
              handleEntitySelect={handleEntitySelect}
              handleRelationshipSelect={handleRelationshipSelect}
            />
          )}
          {activeView === "visualization" && (
            <VisualizationView
              isDarkMode={isDarkMode}
              entities={entities}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              tables={tables}
            />
          )}
          {activeView === "webscraper" && <WebScraperView isDarkMode={isDarkMode} />}
          {activeView === "chatbot" && <ChatbotView isDarkMode={isDarkMode} />}
        </main>
      </div>
    </div>
  )
}
