"use client"

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Wallet, LayoutGrid } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function Menu() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show menu on home page
  if (pathname === '/') return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/80 backdrop-blur-lg rounded-full shadow-lg px-6 py-3 flex items-center gap-6">
        <button
          onClick={() => router.push('/portfolio')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition"
        >
          <Wallet className="w-4 h-4" />
          Portfolio
        </button>
        <div className="w-px h-4 bg-border" />
        <button
          onClick={()  => router.push('/categories')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition"
        >
          <LayoutGrid className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => signOut({callbackUrl: "/"})}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}