"use client"

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Skull, Star, Rocket, Brain, Menu } from 'lucide-react'
import { CategoryCard } from '@/components/ui/category-card'
import { useState } from 'react'

const categories = [
  {
    id: 'meme-coins',
    name: 'Meme Coins',
    icon: Star,
    description: 'Popular and trending meme tokens',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'risky-degens',
    name: 'Risky Degens',
    icon: Skull,
    description: 'High risk, high reward tokens',
    color: 'from-red-400 to-pink-500',
  },
  {
    id: 'newly-launched',
    name: 'Newly Launched',
    icon: Rocket,
    description: 'Recently launched tokens',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'blue-chips',
    name: 'Blue Chips',
    icon: Sparkles,
    description: 'Established and trusted tokens',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'ai-analyzed',
    name: 'AI Analyzed',
    icon: Brain,
    description: 'AI-recommended tokens',
    color: 'from-purple-400 to-violet-500',
  },
]

export function CategoryPage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#001F3F] via-[#1A1A2E] to-[#2D1B3D] relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MonaSwipe
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <button className="text-gray-300 hover:text-white transition">Profile</button>
            <button className="text-gray-300 hover:text-white transition">Settings</button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg md:hidden border-b border-white/10"
          >
            <div className="flex flex-col p-4 gap-4">
              <button className="text-gray-300 hover:text-white transition text-left">Profile</button>
              <button className="text-gray-300 hover:text-white transition text-left">Settings</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Choose Your Path
            </h1>
            <p className="text-base md:text-xl text-gray-400">
              Select a category to start discovering tokens
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard
                  category={category}
                  onClick={() => router.push(`/swipe/${category.id}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}