"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Globe,
  Play,
  Pause,
  Download,
  Settings,
  Zap,
  Target,
  Database,
  TrendingUp,
  ShoppingCart,
  Newspaper,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
  Search,
} 
from "lucide-react"

// Extend the JSX.IntrinsicElements interface for style jsx
declare module "react" {
  interface HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

interface ScrapedData {
  id: string
  title: string
  price?: string
  description: string
  url: string
  image?: string
  category: string
  timestamp: Date
  status: "success" | "error" | "pending"
}

interface ScrapingTarget {
  id: string
  name: string
  url: string
  
  type: "ecommerce" | "news" | "social" | "finance"
  icon: React.ReactNode
  color: string
  status: "idle" | "running" | "completed" | "error"
  progress: number
  itemsFound: number
}

export default function WebScraperView({ isDarkMode }: { isDarkMode: boolean }) {
  const [isScrapingActive, setIsScrapingActive] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [scrapingSpeed, setScrapingSpeed] = useState(2)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const scrollRef = useRef<HTMLDivElement>(null)

  const [targets, setTargets] = useState<ScrapingTarget[]>([
    {
      id: "amazon",
      name: "Amazon Products",
      url: "amazon.com",
      type: "ecommerce",
      icon: <ShoppingCart size={16} />,
      color: "#FF9500",
      status: "idle",
      progress: 0,
      itemsFound: 0,
    },
    {
      id: "news",
      name: "Tech News",
      url: "techcrunch.com",
      type: "news",
      icon: <Newspaper size={16} />,
      color: "#00D4AA",
      status: "idle",
      progress: 0,
      itemsFound: 0,
    },
    {
      id: "social",
      name: "Social Media",
      url: "twitter.com",
      type: "social",
      icon: <Users size={16} />,
      color: "#1DA1F2",
      status: "idle",
      progress: 0,
      itemsFound: 0,
    },
    {
      id: "finance",
      name: "Stock Prices",
      url: "finance.yahoo.com",
      type: "finance",
      icon: <TrendingUp size={16} />,
      color: "#7C3AED",
      status: "idle",
      progress: 0,
      itemsFound: 0,
    },
  ])

  // Simulación de datos de scraping
  const mockData = {
    ecommerce: [
      {
        title: 'MacBook Pro 16"',
        price: "$2,399",
        description: "Apple M2 Pro chip, 16GB RAM, 512GB SSD",
        category: "Electronics",
      },
      {
        title: "iPhone 15 Pro",
        price: "$999",
        description: "128GB, Titanium Blue, A17 Pro chip",
        category: "Electronics",
      },
      {
        title: "AirPods Pro",
        price: "$249",
        description: "Active Noise Cancellation, Spatial Audio",
        category: "Audio",
      },
      { title: "iPad Air", price: "$599", description: "10.9-inch, M1 chip, 64GB Wi-Fi", category: "Tablets" },
      {
        title: "Apple Watch Ultra",
        price: "$799",
        description: "49mm, GPS + Cellular, Titanium",
        category: "Wearables",
      },
    ],
    news: [
      {
        title: "AI Revolution in 2024",
        description: "How artificial intelligence is transforming industries worldwide",
        category: "Technology",
      },
      {
        title: "Quantum Computing Breakthrough",
        description: "Scientists achieve new milestone in quantum supremacy",
        category: "Science",
      },
      {
        title: "Green Energy Surge",
        description: "Renewable energy adoption reaches record highs globally",
        category: "Environment",
      },
      { title: "Space Exploration Update", description: "NASA announces new Mars mission timeline", category: "Space" },
      { title: "Cybersecurity Alert", description: "New threats emerge in digital landscape", category: "Security" },
    ],
    social: [
      {
        title: "Viral Tech Trend",
        description: "New social media feature gains millions of users",
        category: "Social Media",
      },
      {
        title: "Influencer Marketing",
        description: "How brands are leveraging social influence",
        category: "Marketing",
      },
      { title: "Digital Wellness", description: "Tips for maintaining healthy online habits", category: "Lifestyle" },
      { title: "Creator Economy", description: "The rise of independent content creators", category: "Business" },
      { title: "Social Commerce", description: "Shopping directly through social platforms", category: "E-commerce" },
    ],
    finance: [
      { title: "AAPL", price: "$185.92", description: "Apple Inc. - Up 2.3% today", category: "Tech Stocks" },
      { title: "TSLA", price: "$248.50", description: "Tesla Inc. - Down 1.2% today", category: "Auto Stocks" },
      { title: "NVDA", price: "$875.28", description: "NVIDIA Corp. - Up 5.7% today", category: "Tech Stocks" },
      { title: "MSFT", price: "$378.85", description: "Microsoft Corp. - Up 1.8% today", category: "Tech Stocks" },
      { title: "GOOGL", price: "$142.56", description: "Alphabet Inc. - Up 0.9% today", category: "Tech Stocks" },
    ],
  }

  const startScraping = () => {
    setIsScrapingActive(true)
    setScrapedData([])
    setTotalItems(0)

    // Reset all targets
    setTargets((prev) =>
      prev.map((target) => ({
        ...target,
        status: "running",
        progress: 0,
        itemsFound: 0,
      })),
    )

    // Simulate scraping process
    targets.forEach((target, targetIndex) => {
      const targetData = mockData[target.type] || []

      targetData.forEach((item, itemIndex) => {
        setTimeout(
          () => {
            const newItem: ScrapedData = {
              id: `${target.id}-${itemIndex}-${Date.now()}`,
              title: item.title,
              price: "100",
              description: item.description,
              url: `https://${target.url}/item/${itemIndex}`,
              category: item.category,
              timestamp: new Date(),
              status: Math.random() > 0.1 ? "success" : "error",
            }

            setScrapedData((prev) => [newItem, ...prev])
            setTotalItems((prev) => prev + 1)

            // Update target progress
            setTargets((prev) =>
              prev.map((t) =>
                t.id === target.id
                  ? {
                      ...t,
                      progress: ((itemIndex + 1) / targetData.length) * 100,
                      itemsFound: itemIndex + 1,
                      status: itemIndex === targetData.length - 1 ? "completed" : "running",
                    }
                  : t,
              ),
            )

            // Auto-scroll to latest item
            if (scrollRef.current) {
              scrollRef.current.scrollTop = 0
            }
          },
          targetIndex * 2000 + itemIndex * (3000 / scrapingSpeed),
        )
      })
    })

    // Stop scraping after all items are processed
    setTimeout(
      () => {
        setIsScrapingActive(false)
      },
      targets.length * 2000 + 5 * (3000 / scrapingSpeed),
    )
  }

  const stopScraping = () => {
    setIsScrapingActive(false)
    setTargets((prev) =>
      prev.map((target) => ({
        ...target,
        status: target.progress > 0 ? "completed" : "idle",
      })),
    )
  }

  const exportData = () => {
    const dataStr = JSON.stringify(scrapedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `scraped-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const filteredData = scrapedData.filter((item) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "success" && item.status === "success") ||
      (filter === "error" && item.status === "error")

    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-[#250d46]/30 to-[#250d46]/60">
      {/* Header */}
      <div className="p-6 bg-[#250d46]/80 border-b border-[#250d46]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Web Scraper Pro</h1>
              <p className="text-white/70">Extrae datos de cualquier sitio web en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#250d46]/60 rounded-lg">
              <Database size={16} className="text-white/70" />
              <span className="text-white font-medium">{totalItems}</span>
              <span className="text-white/70 text-sm">items</span>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-[#250d46]/60 hover:bg-[#250d46]/80 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Targets & Controls */}
        <div className="w-80 bg-[#250d46]/60 border-r border-[#250d46]/40 flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-[#250d46]/40">
            <div className="flex gap-2 mb-4">
              {!isScrapingActive ? (
                <button
                  onClick={startScraping}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-medium transition-all transform hover:scale-105"
                >
                  <Play size={18} />
                  Iniciar Scraping
                </button>
              ) : (
                <button
                  onClick={stopScraping}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all"
                >
                  <Pause size={18} />
                  Detener
                </button>
              )}

              <button
                onClick={exportData}
                disabled={scrapedData.length === 0}
                className="px-4 py-3 bg-[#250d46]/80 hover:bg-[#250d46] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                <Download size={18} />
              </button>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Velocidad de Scraping</label>
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-yellow-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={scrapingSpeed}
                  onChange={(e) => setScrapingSpeed(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white/70 text-sm w-8">{scrapingSpeed}x</span>
              </div>
            </div>
          </div>

          {/* Targets */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Target size={16} />
              Objetivos de Scraping
            </h3>

            <div className="space-y-3">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTarget === target.id
                      ? "border-white/40 bg-[#250d46]/80"
                      : "border-[#250d46]/40 bg-[#250d46]/40 hover:bg-[#250d46]/60"
                  }`}
                  onClick={() => setSelectedTarget(target.id === selectedTarget ? null : target.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded"
                        style={{ backgroundColor: target.color + "20", color: target.color }}
                      >
                        {target.icon}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{target.name}</div>
                        <div className="text-white/60 text-xs">{target.url}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {target.status === "running" && <Loader2 size={14} className="animate-spin text-blue-400" />}
                      {target.status === "completed" && <CheckCircle size={14} className="text-green-400" />}
                      {target.status === "error" && <AlertCircle size={14} className="text-red-400" />}
                    </div>
                  </div>

                  {target.status !== "idle" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Progreso</span>
                        <span className="text-white/70">{Math.round(target.progress)}%</span>
                      </div>
                      <div className="w-full bg-[#250d46]/60 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${target.progress}%`,
                            backgroundColor: target.color,
                          }}
                        />
                      </div>
                      <div className="text-xs text-white/60">{target.itemsFound} items encontrados</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="p-4 bg-[#250d46]/40 border-b border-[#250d46]/40">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-white/70" />
                <input
                  type="text"
                  placeholder="Buscar en resultados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 bg-[#250d46]/60 border border-[#250d46]/40 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-white/70" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 bg-[#250d46]/60 border border-[#250d46]/40 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">Todos</option>
                  <option value="success">Exitosos</option>
                  <option value="error">Con errores</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-400" />
                  {scrapedData.filter((item) => item.status === "success").length} exitosos
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle size={14} className="text-red-400" />
                  {scrapedData.filter((item) => item.status === "error").length} errores
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Globe size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
                <p className="text-sm">Inicia el scraping para ver los resultados aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredData.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all transform hover:scale-105 ${
                      item.status === "success"
                        ? "border-green-400/30 bg-green-400/10"
                        : "border-red-400/30 bg-red-400/10"
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.status === "success" ? (
                          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-xs text-white/60">{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                      {item.price && <span className="text-green-400 font-bold">{item.price}</span>}
                    </div>

                    <h4 className="text-white font-medium mb-2 line-clamp-2">{item.title}</h4>
                    <p className="text-white/70 text-sm mb-3 line-clamp-3">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-[#250d46]/60 rounded text-white/80">{item.category}</span>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#250d46] p-6 rounded-xl border border-[#250d46]/40 w-96">
            <h3 className="text-white font-bold mb-4">Configuración del Scraper</h3>

            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm font-medium block mb-2">Delay entre requests (ms)</label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 bg-[#250d46]/60 border border-[#250d46]/40 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm font-medium block mb-2">User Agent</label>
                <select className="w-full px-3 py-2 bg-[#250d46]/60 border border-[#250d46]/40 rounded-lg text-white">
                  <option>Chrome Desktop</option>
                  <option>Firefox Desktop</option>
                  <option>Mobile Safari</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="respectRobots" className="rounded" />
                <label htmlFor="respectRobots" className="text-white/80 text-sm">
                  Respetar robots.txt
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-[#250d46]/60 hover:bg-[#250d46]/80 rounded-lg text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white transition-all"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    <style jsx>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}</style>

    </div>
  )
}
