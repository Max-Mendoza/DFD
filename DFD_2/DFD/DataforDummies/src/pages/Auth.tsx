"use client"

import Background from "@/components/background"
import { Outlet } from "react-router"
import { BarChart2, BarChartIcon as ChartBar, Activity, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export default function Auth() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return (
    <>
      <Background />
      <main className="h-full w-full flex justify-center items-center absolute">
        <div
          className={`z-1 bg-white/3 backdrop-blur-2xl
                    border border-white/20 rounded-lg shadow-lg 
                    flex
                    flex-1
                    max-w-[90%] lg:max-w-[80%] xl:max-w-[1200px]
                    mx-auto
                    text-white
                    overflow-hidden
                    relative
                    transition-opacity duration-500 ease-out
                    ${mounted ? "opacity-100" : "opacity-0"}
                `}
        >
          
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>

          

          <div className="flex-1 relative flex flex-col items-center justify-center p-8">
            <div className="relative z-10 flex flex-col items-center">
              
              <div className="mb-8 relative group perspective">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl blur-xl"></div>
                <div className="relative p-6 rounded-xl border border-white/10 backdrop-blur-sm bg-white/5 transition-transform duration-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <div className="flex gap-3">
                    <BarChart2 className="w-[clamp(20px,5vw,32px)] h-[clamp(20px,5vw,32px)] text-white/90" />
                    <Activity className="w-[clamp(20px,5vw,32px)] h-[clamp(20px,5vw,32px)] text-white/70" />
                    <ChartBar className="w-[clamp(20px,5vw,32px)] h-[clamp(20px,5vw,32px)] text-white/50" />
                  </div>
                </div>
              </div>

              
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-bold text-[clamp(1.5rem,4vw,2.5rem)] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                  Analiza Tus Datos
                </h2>
                <Sparkles className="w-[clamp(16px,3vw,24px)] h-[clamp(16px,3vw,24px)] text-purple-300/70" />
              </div>

              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-[clamp(10px,4vw,16px)] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                <div className="w-[clamp(1.5px,0.5vw,2px)] h-[clamp(1.5px,0.5vw,2px)] rounded-full bg-purple-500/30"></div>
                <div className="w-[clamp(2px,0.75vw,3px)] h-[clamp(2px,0.75vw,3px)] rounded-full bg-violet-500/30"></div>
                <div className="w-[clamp(1.5px,0.5vw,2px)] h-[clamp(1.5px,0.5vw,2px)] rounded-full bg-purple-500/30"></div>
                <div className="h-[1px] w-[clamp(10px,4vw,16px)] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              </div>

              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-full blur-lg"></div>
                <p
                  className="relative text-white/70 text-center text-[clamp(0.75rem,2vw,0.875rem)] max-w-[clamp(200px,30vw,280px)] leading-relaxed 
                                    backdrop-blur-sm py-3 px-[clamp(1rem,4vw,2rem)] rounded-full 
                                    border border-white/10 bg-white/5
                                    transition-colors duration-300 hover:text-white/90"
                >
                  Simplifica el análisis y visualización de la información
                </p>
              </div>

              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-40">
                <div className="w-[clamp(0.5px,0.25vw,1px)] h-[clamp(4px,2vw,8px)] bg-gradient-to-t from-purple-500/30 to-transparent rounded-full"></div>
                <div className="w-[clamp(0.5px,0.25vw,1px)] h-[clamp(3px,1.5vw,6px)] bg-gradient-to-t from-purple-500/30 to-transparent rounded-full"></div>
                <div className="w-[clamp(0.5px,0.25vw,1px)] h-[clamp(2px,1vw,4px)] bg-gradient-to-t from-purple-500/30 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          
          <div className="flex-1 ">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}

