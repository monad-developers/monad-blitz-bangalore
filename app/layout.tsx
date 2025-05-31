import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

const dollarFaviconSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23000'/%3E%3Cpath d='M16 4v2.5c2.5 0.5 4.5 2.2 4.5 4.5h-3c0-1.1-0.7-2-2.5-2s-2.5 0.9-2.5 2c0 1.1 0.7 2 2.5 2h1c3.3 0 6 2.7 6 6s-2.7 6-6 6v2.5h-2V25c-2.5-0.5-4.5-2.2-4.5-4.5h3c0 1.1 0.7 2 2.5 2s2.5-0.9 2.5-2c0-1.1-0.7-2-2.5-2h-1c-3.3 0-6-2.7-6-6s2.7-6 6-6V4h2z' fill='%23fff'/%3E%3C/svg%3E"

export const metadata: Metadata = {
  title: "$enigma - Turn your Farcaster feed into alpha",
  description: "Monitor Farcaster users trading activity on Monad blockchain and get real-time notifications",
  keywords: ["farcaster", "monad", "trading", "social", "signals", "defi", "web3"],
  authors: [{ name: "Social Signals Team" }],
  openGraph: {
    title: "$enigma",
    description: "Turn your Farcaster feed into alpha",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "$enigma",
    description: "Turn your Farcaster feed into alpha",
    images: ["/og-image.png"],
  },
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: dollarFaviconSvg,
        type: "image/svg+xml",
      },
    ],
    shortcut: dollarFaviconSvg,
    apple: dollarFaviconSvg,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="icon" href={dollarFaviconSvg} type="image/svg+xml" />
        <link rel="shortcut icon" href={dollarFaviconSvg} />
        <link rel="apple-touch-icon" href={dollarFaviconSvg} />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
