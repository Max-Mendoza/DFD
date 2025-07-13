import type { ReactNode } from "react"
import Sidebar from "@components/Sidebar"
import { Bell, CircleHelp } from "lucide-react"
import { AnimatedButton } from "@/components/Button"
import { Outlet } from "react-router"


export default function LayoutWithSidebar() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#270E47] via-[#1C0740] to-[#2D0C41]">
      <Sidebar />

      <main className="flex-1 ml-16 md:ml-64  overflow-y-auto ">
        
        <article className="bg-[#17147] h-full">
          <Outlet />
        </article>

      </main>
    </div>
  )
}