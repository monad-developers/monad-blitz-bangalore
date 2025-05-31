"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, PieChartIcon, AlertTriangle, Info } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { PortfolioToken } from "@/app/api/users/[id]/portfolio/route" // Import the interface
import Image from "next/image"

interface PortfolioChartTabProps {
  userId: string
  selectedWallet?: string
}

const COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#00C49F", // Teal
  "#FFBB28", // Amber
  "#FF8042", // Coral
  "#0088FE", // Blue
  "#A28BFA", // Light Purple
  "#E57373", // Light Red
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-800/90 text-white p-3 rounded-lg border border-gray-700 shadow-xl backdrop-blur-sm">
        <div className="flex items-center mb-1">
          {data.imageURL && (
            <Image
              src={data.imageURL || "/placeholder.svg"}
              alt={data.name}
              width={20}
              height={20}
              className="rounded-full mr-2"
              unoptimized // If BlockVision URLs are not in next.config images domains
            />
          )}
          <p className="font-semibold">
            {data.name} ({data.symbol})
          </p>
        </div>
        <p className="text-sm">
          Quantity: {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </p>
        <p className="text-sm">Percentage: {`${(payload[0].percent * 100).toFixed(2)}%`}</p>
      </div>
    )
  }
  return null
}

const renderLegend = (props: any) => {
  const { payload } = props
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-300">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          {entry.payload.payload.imageURL && (
            <Image
              src={entry.payload.payload.imageURL || "/placeholder.svg"}
              alt={entry.payload.payload.name}
              width={14}
              height={14}
              className="rounded-full mr-1.5"
              unoptimized
            />
          )}
          <span style={{ color: entry.color, marginRight: "4px" }}>●</span>
          {entry.value} ({`${(entry.payload.percent * 100).toFixed(1)}%`})
        </li>
      ))}
    </ul>
  )
}

// Custom label function that only shows labels for slices above a threshold
const renderLabel = ({ symbol, percent }: any) => {
  // Only show labels for slices that are 8% or larger to prevent overlap
  if (percent > 0.08) {
    return `${symbol} (${(percent * 100).toFixed(0)}%)`
  }
  return null
}

export default function PortfolioChartTab({ userId, selectedWallet }: PortfolioChartTabProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let apiUrl = `/api/users/${userId}/portfolio`
      if (selectedWallet && selectedWallet !== "all") {
        apiUrl += `?walletAddress=${selectedWallet}`
      } else {
        apiUrl += `?walletAddress=all` // Explicitly ask for all if no specific wallet
      }

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Portfolio API request failed with status ${response.status}. Response body:`, errorText)
        let errorMessage = `Failed to fetch portfolio: ${response.status}`
        try {
          const errData = JSON.parse(errorText) // Try to parse if it's a JSON error from our API
          if (errData.error) errorMessage = errData.error
        } catch (e) {
          // If parsing fails, it's likely HTML or non-JSON, use the generic message
          // or include a snippet of the errorText if it's short
          if (errorText.length < 200) {
            // Avoid logging huge HTML pages
            errorMessage = `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}...`
          }
        }
        throw new Error(errorMessage)
      }

      const responseText = await response.text() // Get text first, regardless of status
      try {
        const data = JSON.parse(responseText) // Now try to parse
        setPortfolioData(data.portfolio || [])
      } catch (e) {
        console.error("Failed to parse Portfolio API response as JSON. Response text:", responseText) // Log the HTML
        throw new Error("Received an invalid response from the server. Expected JSON but got something else.")
      }
    } catch (err) {
      console.error("Error fetching portfolio data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setPortfolioData([])
    } finally {
      setLoading(false)
    }
  }, [userId, selectedWallet])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  const chartData = portfolioData
    .map((token) => ({
      name: token.name, // For display
      symbol: token.symbol, // For key/grouping
      value: token.value, // Quantity
      imageURL: token.imageURL,
    }))
    .sort((a, b) => b.value - a.value) // Sort for consistent color assignment

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-purple-400" />
          Portfolio Allocation
        </CardTitle>
        <CardDescription className="text-gray-300">
          Current token distribution by quantity
          {selectedWallet && selectedWallet !== "all"
            ? ` for wallet ${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}`
            : " for all connected wallets"}
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="ml-2 text-gray-300">Loading portfolio...</p>
          </div>
        ) : error ? (
          <div className="h-[400px] w-full flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-red-400 font-semibold">Error loading portfolio</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            <Button
              onClick={fetchPortfolioData}
              variant="outline"
              className="mt-4 text-white border-gray-600 hover:bg-gray-700"
            >
              Try Again
            </Button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] w-full flex flex-col items-center justify-center text-center">
            <Info className="h-10 w-10 text-gray-500 mb-3" />
            <p className="text-gray-300">No token data found for this wallet.</p>
            <p className="text-sm text-gray-400 mt-1">This wallet may be empty or data is unavailable.</p>
          </div>
        ) : (
          <div className="h-[450px] w-full">
            {" "}
            {/* Increased height for legend */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="symbol"
                  label={renderLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && !error && (
          <div className="space-y-2 mt-4">
            <p className="text-xs text-gray-500 text-center">
              Note: Pie chart shows token allocation by quantity, not USD value, as real-time price data may not be
              available for all tokens.
            </p>
            <p className="text-xs text-gray-400 text-center">
              Labels shown only for holdings above 8%. See legend below for all tokens.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
