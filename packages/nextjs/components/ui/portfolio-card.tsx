"use client"

import { Token } from '@/types/token'
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import { useTokens } from '@/components/providers/token-provider'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface PortfolioCardProps {
  token: Token
}

export function PortfolioCard({ token }: PortfolioCardProps) {
  const { removeToken } = useTokens()

  const handleSell = () => {
    // Implement sell functionality here
    console.log('Selling token:', token.name)
    removeToken(token.address)
  }

  return (
    <motion.div 
      className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:bg-black/40 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col gap-4">
        {/* Token Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur-sm opacity-50" />
              <Image
                width={48}
                height={48}
                src={token.image}
                alt={token.name}
                className="w-12 h-12 rounded-xl object-cover relative"
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{token.name}</h3>
              <div className="flex items-center gap-1 text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">{token.priceChange.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Sell Button */}
          <button
            onClick={handleSell}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 to-pink-600 text-white hover:opacity-90 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <DollarSign className="w-4 h-4" />
            Sell
          </button>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-base font-semibold text-white">{token.amount} ETH</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-sm text-gray-400">Value</p>
            <p className="text-base font-semibold text-white">
              {token.value} ETH
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}