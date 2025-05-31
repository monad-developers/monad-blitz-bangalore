import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "darkID - Anonymous Decentralized Identity",
  description:
    "Prove your identity without revealing who you are. Anonymous verified identity through blockchain technology.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark bg-slate-900 text-white`}>{children}</body>
    </html>
  )
}
