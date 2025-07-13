import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Filter,
  Search,
  Share2,
  LayoutDashboard,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  Bell,
  User,
  Palette,
  Sliders,
  Grid,
  Copy,
  Trash2,
  Save,
  Eye,
  PanelLeft,
  PanelRight,
  Map,
} from "lucide-react"

export default function PowerBIReportPage() {
  const navigate = useNavigate()
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [selectedVisual, setSelectedVisual] = useState<string | null>("chart1")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Data for Dummies: Editor de Informes</h1>
          <div className="hidden md:flex items-center space-x-1 text-sm">
            <button className="px-3 py-1.5 rounded hover:bg-white/10">Archivo</button>
            <button className="px-3 py-1.5 rounded hover:bg-white/10">Inicio</button>
            <button className="px-3 py-1.5 rounded hover:bg-white/10">Insertar</button>
            <button className="px-3 py-1.5 rounded hover:bg-white/10">Modelado</button>
            <button className="px-3 py-1.5 rounded hover:bg-white/10">Vista</button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10">
            <RefreshCw size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <HelpCircle size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left panel - Visualizations */}
        {showLeftPanel && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-56 border-r border-white/10 p-3 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xs uppercase text-purple-300 font-semibold px-3 mb-2">Visualizaciones</h3>
              <div className="grid grid-cols-3 gap-2 p-2">
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <BarChart3 size={20} />
                </button>
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <LineChart size={20} />
                </button>
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <PieChart size={20} />
                </button>
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <Table size={20} />
                </button>
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <Map size={20} />
                </button>
                <button className="p-2 rounded hover:bg-white/10 flex items-center justify-center">
                  <Grid size={20} />
                </button>
              </div>
            </div>

            <div className="mb-6 flex-1 overflow-auto">
              <h3 className="text-xs uppercase text-purple-300 font-semibold px-3 mb-2">Campos</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between px-3 py-1 text-sm font-medium">
                    <div className="flex items-center">
                      <Table size={14} className="mr-2" />
                      <span>Ventas</span>
                    </div>
                    <ChevronDown size={14} />
                  </div>
                  <div className="pl-8 space-y-1 mt-1">
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">ID Venta</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">Fecha</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">ID Producto</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">ID Cliente</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">Cantidad</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">Precio unitario</div>
                    <div className="px-3 py-1 text-xs rounded hover:bg-white/10 cursor-pointer">Total</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between px-3 py-1 text-sm font-medium">
                    <div className="flex items-center">
                      <Table size={14} className="mr-2" />
                      <span>Productos</span>
                    </div>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between px-3 py-1 text-sm font-medium">
                    <div className="flex items-center">
                      <Table size={14} className="mr-2" />
                      <span>Clientes</span>
                    </div>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between px-3 py-1 text-sm font-medium">
                    <div className="flex items-center">
                      <Table size={14} className="mr-2" />
                      <span>Regiones</span>
                    </div>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase text-purple-300 font-semibold px-3 mb-2">Páginas</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/20">
                  <LayoutDashboard size={14} />
                  <span className="text-sm">Resumen</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10">
                  <BarChart3 size={14} />
                  <span className="text-sm">Ventas por producto</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10">
                  <Map size={14} />
                  <span className="text-sm">Distribución geográfica</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {/* Toolbar */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className={`p-1.5 rounded ${showLeftPanel ? "bg-white/10" : "hover:bg-white/10"}`}
              >
                <PanelLeft size={18} />
              </button>
              <button className="p-1.5 rounded hover:bg-white/10">
                <Filter size={18} />
              </button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 text-purple-300" size={16} />
                <input
                  type="text"
                  placeholder="Buscar"
                  className="pl-9 pr-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 w-40 md:w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1.5 rounded hover:bg-white/10">
                <Eye size={16} />
                <span className="hidden md:inline">Vista previa</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1.5 rounded hover:bg-white/10">
                <Share2 size={16} />
                <span className="hidden md:inline">Compartir</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded">
                <Save size={16} />
                <span className="hidden md:inline">Guardar</span>
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`p-1.5 rounded ${showRightPanel ? "bg-white/10" : "hover:bg-white/10"}`}
              >
                <PanelRight size={18} />
              </button>
            </div>
          </div>

          {/* Report canvas */}
          <div className="p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[calc(100vh-200px)]"
            >
              {/* Grid layout */}
              <div className="grid grid-cols-4 gap-6">
                {/* KPI cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="col-span-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer"
                  onClick={() => setSelectedVisual("kpi1")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "kpi1" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm text-purple-200">Ventas totales</h3>
                      <p className="text-2xl font-bold mt-1">$1,458,290</p>
                    </div>
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <BarChart3 size={20} />
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-green-400">+12.5% vs mes anterior</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="col-span-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer"
                  onClick={() => setSelectedVisual("kpi2")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "kpi2" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm text-purple-200">Clientes nuevos</h3>
                      <p className="text-2xl font-bold mt-1">2,854</p>
                    </div>
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <User size={20} />
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-green-400">+7.2% vs mes anterior</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer"
                  onClick={() => setSelectedVisual("kpi3")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "kpi3" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm text-purple-200">Tasa de conversión</h3>
                      <p className="text-2xl font-bold mt-1">24.8%</p>
                    </div>
                    <div className="bg-green-500 p-2 rounded-lg">
                      <PieChart size={20} />
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-green-400">+3.1% vs mes anterior</div>
                </motion.div>

                {/* Charts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer h-64"
                  onClick={() => setSelectedVisual("chart1")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "chart1" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Tendencia de ventas</h3>
                    <button className="text-xs flex items-center text-purple-300 hover:text-white">
                      Últimos 12 meses <ChevronDown size={14} className="ml-1" />
                    </button>
                  </div>
                  <div className="h-44 w-full">
                    {/* Simulated line chart */}
                    <div className="h-full w-full flex items-end justify-between px-2">
                      {[35, 45, 30, 60, 75, 65, 75, 90, 85, 95, 100, 85].map((height, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className="w-3 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm"
                          ></motion.div>
                          <div className="text-xs mt-2 text-purple-300">
                            {["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer h-64"
                  onClick={() => setSelectedVisual("chart2")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "chart2" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Ventas por categoría</h3>
                    <button className="text-xs flex items-center text-purple-300 hover:text-white">
                      Este año <ChevronDown size={14} className="ml-1" />
                    </button>
                  </div>
                  <div className="h-44 w-full flex items-center justify-center">
                    {/* Simulated pie chart */}
                    <div className="relative w-32 h-32">
                      <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: 270 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 rounded-full border-[16px] border-purple-500"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                      ></motion.div>
                      <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: 90 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        className="absolute inset-0 rounded-full border-[16px] border-blue-500"
                        style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)" }}
                      ></motion.div>
                      <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 1.5, delay: 0.6 }}
                        className="absolute inset-0 rounded-full border-[16px] border-green-500"
                        style={{ clipPath: "polygon(50% 50%, 50% 100%, 0 100%, 0 50%)" }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { label: "Tecnología", color: "bg-purple-500", value: "45%" },
                      { label: "Muebles", color: "bg-blue-500", value: "30%" },
                      { label: "Oficina", color: "bg-green-500", value: "25%" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                        <div>
                          <div className="text-xs">{item.label}</div>
                          <div className="text-xs font-bold">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="col-span-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 cursor-pointer"
                  onClick={() => setSelectedVisual("table1")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: selectedVisual === "table1" ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : "none",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Productos más vendidos</h3>
                    <button className="text-xs flex items-center text-purple-300 hover:text-white">
                      Ver todos <ChevronDown size={14} className="ml-1" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Producto</th>
                          <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Categoría</th>
                          <th className="text-right py-2 px-4 text-xs font-medium text-purple-300">Precio</th>
                          <th className="text-right py-2 px-4 text-xs font-medium text-purple-300">Ventas</th>
                          <th className="text-right py-2 px-4 text-xs font-medium text-purple-300">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            product: "Laptop Pro X1",
                            category: "Tecnología",
                            price: "$1,299",
                            sales: "245",
                            revenue: "$318,255",
                          },
                          {
                            product: 'Monitor UltraWide 32"',
                            category: "Tecnología",
                            price: "$499",
                            sales: "189",
                            revenue: "$94,311",
                          },
                          {
                            product: "Silla Ergonómica Deluxe",
                            category: "Muebles",
                            price: "$349",
                            sales: "156",
                            revenue: "$54,444",
                          },
                        ].map((item, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-4">{item.product}</td>
                            <td className="py-2 px-4">{item.category}</td>
                            <td className="py-2 px-4 text-right">{item.price}</td>
                            <td className="py-2 px-4 text-right">{item.sales}</td>
                            <td className="py-2 px-4 text-right font-medium">{item.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right panel - Properties */}
        {showRightPanel && selectedVisual && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-64 border-l border-white/10 p-3 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xs uppercase text-purple-300 font-semibold px-3 mb-2">Propiedades</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-purple-300 px-3 mb-1">Título</label>
                  <input
                    type="text"
                    value={
                      selectedVisual === "chart1"
                        ? "Tendencia de ventas"
                        : selectedVisual === "chart2"
                          ? "Ventas por categoría"
                          : selectedVisual === "table1"
                            ? "Productos más vendidos"
                            : selectedVisual === "kpi1"
                              ? "Ventas totales"
                              : selectedVisual === "kpi2"
                                ? "Clientes nuevos"
                                : "Tasa de conversión"
                    }
                    className="w-full px-3 py-1.5 bg-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-purple-300 px-3 mb-1">Tipo de visualización</label>
                  <select className="w-full px-3 py-1.5 bg-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 border-none">
                    {selectedVisual?.startsWith("chart1") ? (
                      <option>Gráfico de barras</option>
                    ) : selectedVisual?.startsWith("chart2") ? (
                      <option>Gráfico circular</option>
                    ) : selectedVisual?.startsWith("table") ? (
                      <option>Tabla</option>
                    ) : (
                      <option>Tarjeta</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-purple-300 px-3 mb-1">Campos</label>
                  <div className="space-y-2">
                    {selectedVisual?.startsWith("chart") ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/10 rounded-lg">
                          <span className="text-xs">Eje X</span>
                          <span className="text-xs text-purple-300">Fecha</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/10 rounded-lg">
                          <span className="text-xs">Eje Y</span>
                          <span className="text-xs text-purple-300">Total</span>
                        </div>
                      </>
                    ) : selectedVisual?.startsWith("table") ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/10 rounded-lg">
                          <span className="text-xs">Valores</span>
                          <span className="text-xs text-purple-300">Múltiples</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/10 rounded-lg">
                          <span className="text-xs">Valor</span>
                          <span className="text-xs text-purple-300">
                            {selectedVisual === "kpi1"
                              ? "Ventas"
                              : selectedVisual === "kpi2"
                                ? "Clientes"
                                : "Conversión"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-purple-300 px-3 mb-1">Formato</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-xs">Color</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <button className="p-1 rounded hover:bg-white/10">
                          <Palette size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-xs">Tamaño</span>
                      <button className="p-1 rounded hover:bg-white/10">
                        <Sliders size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
              <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10">
                <Copy size={14} />
                <span className="text-sm">Duplicar</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 text-red-400">
                <Trash2 size={14} />
                <span className="text-sm">Eliminar</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
