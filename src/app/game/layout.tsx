import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kaplay Game Canvas',
  description: 'A simple game built with Kaplay JS',
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="game-layout">
      {children}
    </div>
  )
} 