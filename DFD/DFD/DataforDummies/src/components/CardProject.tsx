"use client"

import { TypeIcon as type, LucideIcon, User, Clock } from 'lucide-react'

interface CardProjectProps {
  title: string
  description: string
  icon: LucideIcon
  progress: number
  people: number
  time: string
  onClickProject: ()=> void 
  
}

export default function CardProject({
  title = "Project Title",
  description = "Project description goes here",
  icon: Icon = User,
  progress = 65,
  people = 3,
  time = "2 weeks",
  
  onClickProject
}: CardProjectProps) {
  return (
    <article
      className="rounded-xl p-5 bg-white/4 border border-purple-900/20 
                shadow-lg w-full max-w-xs 
                flex flex-col h-full hover:shadow-purple-900/10"
      onClick={()=> onClickProject()}
    >
      <div className="flex flex-col items-center mb-4">
        <div
          className="p-4 bg-gradient-to-br from-purple-800/20 to-purple-600/10 
                    rounded-xl border border-purple-700/20 backdrop-blur-sm mb-3"
        >
          <Icon className="h-8 w-8 text-purple-400" aria-hidden="true" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-purple-200/50 text-sm">{description}</p>
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-purple-300/70">Progreso</p>
          <p className="text-white font-medium text-sm">{progress}%</p>
        </div>

        <div className="w-full rounded-full h-2.5 bg-purple-950/40 backdrop-blur-sm overflow-hidden p-[1px]">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="pt-4 mt-2 border-t border-purple-900/30 grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center text-purple-300/60 text-sm">
            <User className="w-4 h-4 mr-2 text-purple-400" />
            <span>
              {people} {people === 1 ? "persona" : "personas"}
            </span>
          </div>

          <div className="flex items-center justify-center text-purple-300/60 text-sm">
            <Clock className="w-4 h-4 mr-2 text-purple-400" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
