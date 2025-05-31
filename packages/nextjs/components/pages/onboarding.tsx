"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signIn, useSession, signOut } from 'next-auth/react'
import { ArrowRight, LogIn, Menu } from 'lucide-react'
import { createUser } from '@/lib/dbOperations'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from "@privy-io/react-auth";

export function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession();
  const [defaultAmount, setDefaultAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { ready, authenticated, user, login, logout } = usePrivy();

  useEffect(() => {
    console.log(session);
    // Check if user is authenticated and has email
    if (status === 'authenticated' && session?.user?.email) {
      const initUser = async () => {
        await createUser(session?.user?.email as string);
      };
      initUser();
      // Call the wallet API with email as query parameter
      // fetch(`/api/wallet?email=${encodeURIComponent(session.user.email)}`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   }
      // })
      //   .then(res => res.json())
      //   .then(data => {
      //     if (data.success) {
      //       setWalletAddress(data.data.walletAddress)
      //     } else {
      //       console.error('Failed to create/fetch wallet:', data.error)
      //     }
      //   })
      //   .catch(error => {
      //     console.error('Error accessing wallet API:', error);
      //     signOut();
      //   })
    }
  }, [session, status])

  const handleContinue = () => {
    if (session && defaultAmount && walletAddress) {
      router.push('/categories')
    }
  }

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
            <button className="text-gray-300 hover:text-white transition">Login</button>
            <button className="text-gray-300 hover:text-white transition">Register</button>
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
              <button className="text-gray-300 hover:text-white transition text-left">Login</button>
              <button className="text-gray-300 hover:text-white transition text-left">Register</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center space-y-8 mb-12"
        >
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
              Discover Crypto Like Never Before With MonaSwipe
            </h1>
            <p className="text-base md:text-xl text-gray-400 px-4 md:px-0">
              Swipe right to discover and invest in the next big cryptocurrency tokens on monad.
              Your crypto journey is just a flick away.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md mx-auto space-y-6 p-6 md:p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            {!session ? (
              <button
                // onClick={() => signIn('google')}
                onClick={() => login}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-lg p-3 md:p-4 hover:opacity-90 transition text-sm md:text-base"
              >
                <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                Sign in with Google
              </button>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-300">Default Buy Amount (Base ETH)</span>
                  <input
                    type="number"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(e.target.value)}
                    className="w-full p-3 md:p-4 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 outline-none transition text-white text-sm md:text-base"
                    placeholder="0.1"
                    step="0.01"
                  />
                </label>
                <Link href="/categories" className="block">
                  <button
                    onClick={handleContinue}
                    disabled={!defaultAmount}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-lg p-3 md:p-4 hover:opacity-90 transition disabled:opacity-50 text-sm md:text-base"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Key Features Section */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Swipe to Discover</h3>
            <p className="text-sm md:text-base text-gray-400">Find your next investment with our intuitive swipe interface.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">AI Recommendations</h3>
            <p className="text-sm md:text-base text-gray-400">Get personalized token suggestions based on AI-analyzed data.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Portfolio Management</h3>
            <p className="text-sm md:text-base text-gray-400">Track and manage your investments with detailed metrics.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}