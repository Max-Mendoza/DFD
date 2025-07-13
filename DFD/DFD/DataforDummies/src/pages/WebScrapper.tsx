"use client"

import { useState } from "react"
import {
  Globe,
  Play,
  Pause,
  Download,
  Settings,
  AlertCircle,
  Clock,
  Database,
  Filter,
  Search,
  Trash2,
  Copy,
  RefreshCw,
  Bot,
  Zap,
  Code,
  ImageIcon,
  Mail,
  MapPin,
  User,
  Star,
  Heart,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react"

interface ScrapedData {
  id: string
  url: string
  title: string
  description: string
  timestamp: string
  status: "success" | "error" | "pending"
  data: any[]
  type: string
}

interface ScrapeJob {
  id: string
  url: string
  selector: string
  status: "running" | "completed" | "failed" | "queued"
  progress: number
  startTime: string
  itemsFound: number
  type: string
}

interface AutomationTemplate {
  id: string
  name: string
  description: string
  icon: any
  url: string
  selectors: { [key: string]: string }
  category: string
}

export default function WebScraperPage() {
  const [url, setUrl] = useState("")
  const [selector, setSelector] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [jobs, setJobs] = useState<ScrapeJob[]>([])
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([])
  const [activeTab, setActiveTab] = useState<"scraper" | "automation" | "jobs" | "data">("scraper")
  const [errors, setErrors] = useState<{ url?: string; selector?: string }>({})
  const [settings, setSettings] = useState({
    delay: 1000,
    maxPages: 10,
    respectRobots: true,
    userAgent: "WebScraper Bot 1.0",
    timeout: 30000,
    retries: 3,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Templates de automatización predefinidos
  const automationTemplates: AutomationTemplate[] = [
    {
      id: "ecommerce-products",
      name: "Productos E-commerce",
      description: "Extrae productos, precios y descripciones de tiendas online",
      icon: <ShoppingCart size={20} />,
      url: "https://example-shop.com",
      selectors: {
        title: ".product-title, h1.product-name, .item-title",
        price: ".price, .product-price, .cost, .amount",
        description: ".product-description, .item-desc, .product-details",
        image: ".product-image img, .item-photo img",
        rating: ".rating, .stars, .review-score",
        availability: ".stock, .availability, .in-stock",
      },
      category: "E-commerce",
    },
    {
      id: "social-media-posts",
      name: "Posts Redes Sociales",
      description: "Extrae posts, likes, comentarios y engagement",
      icon: <Heart size={20} />,
      url: "https://social-platform.com",
      selectors: {
        content: ".post-content, .tweet-text, .status-text",
        author: ".author, .username, .user-name",
        likes: ".likes-count, .heart-count, .reactions",
        comments: ".comments-count, .replies-count",
        shares: ".shares-count, .retweets-count",
        timestamp: ".timestamp, .post-time, .created-at",
      },
      category: "Social Media",
    },
    {
      id: "news-articles",
      name: "Artículos de Noticias",
      description: "Extrae títulos, contenido y metadatos de noticias",
      icon: <ImageIcon size={20} />,
      url: "https://news-site.com",
      selectors: {
        headline: "h1, .headline, .article-title",
        content: ".article-content, .post-content, .news-body",
        author: ".author, .byline, .writer",
        date: ".publish-date, .article-date, time",
        category: ".category, .section, .tag",
        summary: ".summary, .excerpt, .lead",
      },
      category: "News",
    },
    {
      id: "job-listings",
      name: "Ofertas de Trabajo",
      description: "Extrae trabajos, salarios y requisitos",
      icon: <User size={20} />,
      url: "https://job-board.com",
      selectors: {
        title: ".job-title, h2.position, .role-name",
        company: ".company-name, .employer, .organization",
        salary: ".salary, .pay, .compensation, .wage",
        location: ".location, .city, .address",
        description: ".job-description, .requirements, .duties",
        posted: ".posted-date, .job-date, .listing-date",
      },
      category: "Jobs",
    },
    {
      id: "real-estate",
      name: "Propiedades Inmobiliarias",
      description: "Extrae propiedades, precios y características",
      icon: <MapPin size={20} />,
      url: "https://real-estate.com",
      selectors: {
        title: ".property-title, .listing-title, h1",
        price: ".price, .cost, .amount, .listing-price",
        address: ".address, .location, .property-address",
        bedrooms: ".bedrooms, .beds, .room-count",
        bathrooms: ".bathrooms, .baths, .bathroom-count",
        area: ".area, .size, .square-feet, .sqft",
      },
      category: "Real Estate",
    },
    {
      id: "reviews-ratings",
      name: "Reseñas y Calificaciones",
      description: "Extrae reviews, ratings y comentarios de usuarios",
      icon: <Star size={20} />,
      url: "https://review-site.com",
      selectors: {
        rating: ".rating, .stars, .score, .review-rating",
        title: ".review-title, .review-heading, h3",
        content: ".review-content, .review-text, .comment",
        author: ".reviewer, .review-author, .user-name",
        date: ".review-date, .posted-date, time",
        helpful: ".helpful-count, .thumbs-up, .upvotes",
      },
      category: "Reviews",
    },
    {
      id: "contact-info",
      name: "Información de Contacto",
      description: "Extrae emails, teléfonos y direcciones",
      icon: <Mail size={20} />,
      url: "https://business-directory.com",
      selectors: {
        name: ".business-name, .company-name, h1, h2",
        email: "[href^='mailto:'], .email, .contact-email",
        phone: "[href^='tel:'], .phone, .contact-phone, .telephone",
        address: ".address, .location, .contact-address",
        website: ".website, .url, .homepage",
        hours: ".hours, .opening-hours, .business-hours",
      },
      category: "Business",
    },
    {
      id: "financial-data",
      name: "Datos Financieros",
      description: "Extrae precios de acciones, crypto y datos financieros",
      icon: <TrendingUp size={20} />,
      url: "https://finance-site.com",
      selectors: {
        symbol: ".symbol, .ticker, .stock-symbol",
        price: ".price, .current-price, .last-price",
        change: ".change, .price-change, .variation",
        volume: ".volume, .trading-volume, .vol",
        high: ".high, .day-high, .max",
        low: ".low, .day-low, .min",
      },
      category: "Finance",
    },
  ]

  // Funciones de automatización reales
  const automationFunctions = {
    // Función para extraer emails de una página
    extractEmails: (html: string): string[] => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      return html.match(emailRegex) || []
    },

    // Función para extraer números de teléfono
    extractPhones: (html: string): string[] => {
      const phoneRegex = /(\+?1?[-.\s]?)?$$([0-9]{3})$$[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
      return html.match(phoneRegex) || []
    },

    // Función para extraer URLs
    extractUrls: (html: string): string[] => {
      const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
      return html.match(urlRegex) || []
    },

    // Función para extraer precios
    extractPrices: (html: string): string[] => {
      const priceRegex = /\$[\d,]+\.?\d*/g
      return html.match(priceRegex) || []
    },

    // Función para limpiar texto
    cleanText: (text: string): string => {
      return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim()
    },

    // Función para validar URL
    isValidUrl: (url: string): boolean => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },

    // Función para generar datos mock realistas
    generateMockData: (template: AutomationTemplate, count = 20): any[] => {
      const mockData = []

      for (let i = 1; i <= count; i++) {
        const item: any = { id: i }

        // Generar datos según el template
        switch (template.id) {
          case "ecommerce-products":
            item.title = `Producto Premium ${i}`
            item.price = `$${(Math.random() * 500 + 50).toFixed(2)}`
            item.description = `Descripción detallada del producto ${i} con características únicas`
            item.rating = (Math.random() * 2 + 3).toFixed(1)
            item.availability = Math.random() > 0.3 ? "En stock" : "Agotado"
            break

          case "social-media-posts":
            item.content = `Este es un post interesante número ${i} con contenido relevante`
            item.author = `@usuario${i}`
            item.likes = Math.floor(Math.random() * 1000)
            item.comments = Math.floor(Math.random() * 100)
            item.shares = Math.floor(Math.random() * 50)
            break

          case "news-articles":
            item.headline = `Noticia Importante ${i}: Últimos Desarrollos`
            item.content = `Contenido completo del artículo ${i} con información detallada...`
            item.author = `Periodista ${i}`
            item.date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
            item.category = ["Tecnología", "Política", "Deportes", "Economía"][Math.floor(Math.random() * 4)]
            break

          case "job-listings":
            item.title = `Desarrollador ${["Frontend", "Backend", "Full Stack"][Math.floor(Math.random() * 3)]} ${i}`
            item.company = `Empresa Tech ${i}`
            item.salary = `$${(Math.random() * 50000 + 50000).toFixed(0)}`
            item.location = ["Madrid", "Barcelona", "Valencia", "Sevilla"][Math.floor(Math.random() * 4)]
            item.posted = `Hace ${Math.floor(Math.random() * 7) + 1} días`
            break

          case "real-estate":
            item.title = `Apartamento Moderno ${i}`
            item.price = `€${(Math.random() * 500000 + 200000).toFixed(0)}`
            item.address = `Calle Principal ${i}, Madrid`
            item.bedrooms = Math.floor(Math.random() * 4) + 1
            item.bathrooms = Math.floor(Math.random() * 3) + 1
            item.area = `${Math.floor(Math.random() * 100) + 50}m²`
            break

          case "reviews-ratings":
            item.rating = (Math.random() * 2 + 3).toFixed(1)
            item.title = `Excelente experiencia ${i}`
            item.content = `Review detallada número ${i} con opiniones constructivas`
            item.author = `Cliente${i}`
            item.date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
            item.helpful = Math.floor(Math.random() * 20)
            break

          case "contact-info":
            item.name = `Empresa ${i} S.L.`
            item.email = `contacto${i}@empresa.com`
            item.phone = `+34 ${Math.floor(Math.random() * 900000000) + 600000000}`
            item.address = `Avenida Comercial ${i}, 28001 Madrid`
            item.website = `https://empresa${i}.com`
            break

          case "financial-data":
            item.symbol = `STOCK${i}`
            item.price = `$${(Math.random() * 200 + 50).toFixed(2)}`
            item.change = `${(Math.random() * 10 - 5).toFixed(2)}%`
            item.volume = `${(Math.random() * 1000000).toFixed(0)}`
            item.high = `$${(Math.random() * 220 + 60).toFixed(2)}`
            item.low = `$${(Math.random() * 180 + 40).toFixed(2)}`
            break
        }

        mockData.push(item)
      }

      return mockData
    },
  }

  // Validaciones
  const validateUrl = (url: string): string | null => {
    if (!url.trim()) return "La URL es requerida"
    if (!automationFunctions.isValidUrl(url)) return "Ingresa una URL válida"
    return null
  }

  const validateSelector = (selector: string): string | null => {
    if (!selector.trim()) return "El selector CSS es requerido"
    if (selector.length < 2) return "El selector debe tener al menos 2 caracteres"
    return null
  }

  // Función principal de scraping
  const startScraping = async () => {
    const urlError = validateUrl(url)
    const selectorError = validateSelector(selector)

    setErrors({
      url: urlError || undefined,
      selector: selectorError || undefined,
    })

    if (urlError || selectorError) return

    setIsRunning(true)

    const jobId = `job_${Date.now()}`
    const jobType = selectedTemplate ? selectedTemplate.name : "Custom Scraping"

    const newJob: ScrapeJob = {
      id: jobId,
      url,
      selector,
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
      itemsFound: 0,
      type: jobType,
    }

    setJobs((prev) => [newJob, ...prev])

    // Simular progreso realista
    const progressSteps = [10, 25, 40, 60, 75, 85, 95, 100]

    for (const step of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, settings.delay))

      const itemsFound = Math.floor((step / 100) * (Math.random() * 50 + 10))

      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress: step, itemsFound } : job)))
    }

    // Completar job y generar datos
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: "completed", progress: 100 } : job)))

    // Generar datos usando el template seleccionado o datos genéricos
    let mockData
    if (selectedTemplate) {
      mockData = automationFunctions.generateMockData(selectedTemplate)
    } else {
      // Datos genéricos
      mockData = Array.from({ length: Math.floor(Math.random() * 30) + 10 }, (_, i) => ({
        id: i + 1,
        title: `Elemento ${i + 1}`,
        content: automationFunctions.cleanText(`Contenido extraído del elemento ${i + 1}`),
        link: `${url}/item-${i + 1}`,
        timestamp: new Date().toISOString(),
      }))
    }

    const scrapedDataEntry: ScrapedData = {
      id: `data_${Date.now()}`,
      url,
      title: selectedTemplate ? selectedTemplate.name : `Datos de ${new URL(url).hostname}`,
      description: selectedTemplate ? selectedTemplate.description : `Extraídos usando selector: ${selector}`,
      timestamp: new Date().toISOString(),
      status: "success",
      data: mockData,
      type: jobType,
    }

    setScrapedData((prev) => [scrapedDataEntry, ...prev])
    setIsRunning(false)
    setActiveTab("data")

    // Notificación de éxito
    showNotification("✅ Scraping completado exitosamente", "success")
  }

  const stopScraping = () => {
    setIsRunning(false)
    setJobs((prev) =>
      prev.map((job) => (job.status === "running" ? { ...job, status: "failed", progress: job.progress } : job)),
    )
    showNotification("⏹️ Scraping detenido", "warning")
  }

  const exportData = (data: ScrapedData, format: "json" | "csv" = "json") => {
    let content: string
    let filename: string
    let mimeType: string

    if (format === "csv") {
      // Convertir a CSV
      if (data.data.length === 0) return

      const headers = Object.keys(data.data[0]).join(",")
      const rows = data.data
        .map((item) =>
          Object.values(item)
            .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
            .join(","),
        )
        .join("\n")

      content = `${headers}\n${rows}`
      filename = `scraped-data-${data.id}.csv`
      mimeType = "text/csv"
    } else {
      // JSON por defecto
      content = JSON.stringify(data.data, null, 2)
      filename = `scraped-data-${data.id}.json`
      mimeType = "application/json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification(`📁 Datos exportados como ${format.toUpperCase()}`, "success")
  }

  const deleteData = (id: string) => {
    setScrapedData((prev) => prev.filter((data) => data.id !== id))
    showNotification("🗑️ Datos eliminados", "info")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification("📋 Copiado al portapapeles", "success")
  }

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    }

    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
  }

  const applyTemplate = (template: AutomationTemplate) => {
    setSelectedTemplate(template)
    setUrl(template.url)
    setSelector(Object.values(template.selectors).join(", "))
    showNotification(`🤖 Template "${template.name}" aplicado`, "success")
  }

  const runAutomation = async (template: AutomationTemplate) => {
    setSelectedTemplate(template)
    setUrl(template.url)
    setSelector(Object.values(template.selectors).join(", "))

    // Esperar un momento para que se actualice la UI
    setTimeout(() => {
      startScraping()
    }, 500)
  }

  const filteredTemplates = automationTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#250d46]/90 text-white">
      {/* Header */}
      <div className="bg-[#250d46] border-b border-purple-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Web Scraper Pro
              </h1>
              <p className="text-purple-200">Automatización inteligente de extracción de datos web</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#250d46]/60 p-1 rounded-lg">
            {[
              { id: "scraper", label: "Scraper Manual", icon: <Globe size={16} /> },
              { id: "automation", label: "Automatización", icon: <Zap size={16} /> },
              { id: "jobs", label: "Trabajos", icon: <Clock size={16} /> },
              { id: "data", label: "Datos", icon: <Database size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id ? "bg-purple-600 text-white" : "text-purple-200 hover:bg-purple-600/20"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "jobs" && jobs.length > 0 && (
                  <span className="bg-purple-400 text-xs px-1.5 py-0.5 rounded-full">{jobs.length}</span>
                )}
                {tab.id === "data" && scrapedData.length > 0 && (
                  <span className="bg-blue-400 text-xs px-1.5 py-0.5 rounded-full">{scrapedData.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab: Scraper Manual */}
        {activeTab === "scraper" && (
          <div className="space-y-6">
            {/* Configuración principal */}
            <div className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Configurar Scraping Manual</h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors"
                >
                  <Settings size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">URL del sitio web</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={16} />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://ejemplo.com"
                      className={`w-full pl-10 pr-4 py-3 bg-[#250d46]/60 border rounded-lg text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                        errors.url ? "border-red-500/50" : "border-purple-400/30"
                      }`}
                    />
                  </div>
                  {errors.url && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.url}
                    </p>
                  )}
                </div>

                {/* Selector Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Selector CSS</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={16} />
                    <input
                      type="text"
                      value={selector}
                      onChange={(e) => setSelector(e.target.value)}
                      placeholder=".product-title, #content h2"
                      className={`w-full pl-10 pr-4 py-3 bg-[#250d46]/60 border rounded-lg text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                        errors.selector ? "border-red-500/50" : "border-purple-400/30"
                      }`}
                    />
                  </div>
                  {errors.selector && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.selector}
                    </p>
                  )}
                </div>
              </div>

              {/* Configuración avanzada */}
              {showSettings && (
                <div className="mt-6 p-4 bg-[#250d46]/40 rounded-lg border border-purple-500/20">
                  <h3 className="text-lg font-medium mb-4">Configuración Avanzada</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-purple-300">Delay (ms)</label>
                      <input
                        type="number"
                        value={settings.delay}
                        onChange={(e) => setSettings((prev) => ({ ...prev, delay: Number(e.target.value) }))}
                        className="w-full mt-1 px-3 py-2 bg-[#250d46]/60 border border-purple-400/30 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-300">Max páginas</label>
                      <input
                        type="number"
                        value={settings.maxPages}
                        onChange={(e) => setSettings((prev) => ({ ...prev, maxPages: Number(e.target.value) }))}
                        className="w-full mt-1 px-3 py-2 bg-[#250d46]/60 border border-purple-400/30 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-300">Timeout (ms)</label>
                      <input
                        type="number"
                        value={settings.timeout}
                        onChange={(e) => setSettings((prev) => ({ ...prev, timeout: Number(e.target.value) }))}
                        className="w-full mt-1 px-3 py-2 bg-[#250d46]/60 border border-purple-400/30 rounded text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={isRunning ? stopScraping : startScraping}
                  disabled={!url || !selector}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRunning
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                  }`}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? "Detener" : "Iniciar Scraping"}
                </button>

                <button
                  onClick={() => {
                    setUrl("")
                    setSelector("")
                    setErrors({})
                    setSelectedTemplate(null)
                  }}
                  className="px-6 py-3 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Ejemplos rápidos */}
            <div className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Ejemplos Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Títulos de artículos", url: "https://news.ycombinator.com", selector: ".titleline > a" },
                  {
                    name: "Productos Amazon",
                    url: "https://amazon.com",
                    selector: "[data-component-type='s-search-result'] h2 a span",
                  },
                  { name: "Posts Reddit", url: "https://reddit.com", selector: "[data-testid='post-content'] h3" },
                  { name: "Tweets", url: "https://twitter.com", selector: "[data-testid='tweetText']" },
                  { name: "Precios Booking", url: "https://booking.com", selector: ".bui-price-display__value" },
                  { name: "Jobs LinkedIn", url: "https://linkedin.com/jobs", selector: ".job-search-card__title" },
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUrl(example.url)
                      setSelector(example.selector)
                    }}
                    className="p-4 bg-[#250d46]/40 border border-purple-500/20 rounded-lg hover:bg-purple-600/20 transition-colors text-left"
                  >
                    <h4 className="font-medium text-white mb-1">{example.name}</h4>
                    <p className="text-xs text-purple-300 mb-2">{example.url}</p>
                    <code className="text-xs text-blue-400 break-all">{example.selector}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Automatización */}
        {activeTab === "automation" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Templates de Automatización</h2>
                <p className="text-purple-300">Usa templates predefinidos para extraer datos específicos</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar templates..."
                  className="pl-10 pr-4 py-2 bg-[#250d46]/60 border border-purple-400/30 rounded-lg text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Templates grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg text-purple-400">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-purple-300 mb-2">{template.description}</p>
                      <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Selectores preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Campos a extraer:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(template.selectors)
                        .slice(0, 4)
                        .map((key) => (
                          <span key={key} className="px-2 py-1 bg-[#250d46]/60 text-xs text-purple-200 rounded">
                            {key}
                          </span>
                        ))}
                      {Object.keys(template.selectors).length > 4 && (
                        <span className="px-2 py-1 bg-[#250d46]/60 text-xs text-purple-200 rounded">
                          +{Object.keys(template.selectors).length - 4} más
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => runAutomation(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all"
                    >
                      <Zap size={14} />
                      Ejecutar
                    </button>
                    <button
                      onClick={() => applyTemplate(template)}
                      className="px-4 py-2 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors"
                    >
                      <Code size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron templates</h3>
                <p className="text-purple-300">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Jobs */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Trabajos de Scraping</h2>
              <button
                onClick={() => setJobs([])}
                className="px-4 py-2 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-600/20 transition-colors"
              >
                Limpiar historial
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-12 text-center">
                <Clock size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay trabajos</h3>
                <p className="text-purple-300">Los trabajos de scraping aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-white">{job.url}</h3>
                        <p className="text-sm text-purple-300">Tipo: {job.type}</p>
                        <p className="text-xs text-purple-400">Iniciado: {new Date(job.startTime).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            job.status === "running"
                              ? "bg-blue-500/20 text-blue-400"
                              : job.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : job.status === "failed"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {job.status === "running" && <Loader size={12} className="animate-spin" />}
                          {job.status === "completed" && <CheckCircle size={12} />}
                          {job.status === "failed" && <XCircle size={12} />}
                          {job.status === "running"
                            ? "Ejecutando"
                            : job.status === "completed"
                              ? "Completado"
                              : job.status === "failed"
                                ? "Fallido"
                                : "En cola"}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-[#250d46]/60 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-300">{job.itemsFound} elementos encontrados</span>
                      {job.status === "running" && <RefreshCw size={16} className="animate-spin text-blue-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Data */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Datos Extraídos</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors">
                  <Filter size={16} className="inline mr-2" />
                  Filtrar
                </button>
              </div>
            </div>

            {scrapedData.length === 0 ? (
              <div className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-12 text-center">
                <Database size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay datos</h3>
                <p className="text-purple-300">Los datos extraídos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scrapedData.map((data) => (
                  <div key={data.id} className="bg-[#250d46]/70 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-white">{data.title}</h3>
                        <p className="text-sm text-purple-300">{data.description}</p>
                        <p className="text-xs text-purple-400">
                          {new Date(data.timestamp).toLocaleString()} • {data.data.length} elementos • {data.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(data.url)}
                          className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors"
                          title="Copiar URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => exportData(data, "json")}
                          className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors"
                          title="Exportar JSON"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => exportData(data, "csv")}
                          className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors"
                          title="Exportar CSV"
                        >
                          <ImageIcon size={16} />
                        </button>
                        <button
                          onClick={() => deleteData(data.id)}
                          className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Preview de datos */}
                    <div className="bg-[#250d46]/40 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Vista previa de datos:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {data.data.slice(0, 5).map((item, index) => (
                          <div key={index} className="text-xs p-3 bg-[#250d46]/60 rounded border-l-2 border-purple-400">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.entries(item)
                                .slice(0, 6)
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-purple-300">{key}:</span>
                                    <span className="text-white ml-1 break-all">
                                      {typeof value === "string" && value.length > 50
                                        ? `${value.substring(0, 50)}...`
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                        {data.data.length > 5 && (
                          <div className="text-xs text-purple-400 text-center py-2">
                            ... y {data.data.length - 5} elementos más
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
