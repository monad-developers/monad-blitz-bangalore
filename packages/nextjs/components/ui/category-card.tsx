"use client"

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    icon: LucideIcon
    description: string
    color: string
  }
  onClick: () => void
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const Icon = category.icon

  return (
    <button
      onClick={onClick}
      className="w-full p-6 md:p-8 rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10 hover:bg-black/40 transition-all duration-300 group"
    >
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <div className="text-left space-y-2">
        <h3 className="text-lg md:text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-blue-500 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {category.name}
        </h3>
        <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
          {category.description}
        </p>
      </div>
    </button>
  )
}