import { type NextRequest, NextResponse } from "next/server"

interface MonadHolder {
  holder: string
  accountAddress: string
  percentage: string
  usdValue: string
  amount: string
  isContract: boolean
}

interface BlockVisionResponse {
  code: number
  reason: string
  message: string
  result: {
    data: MonadHolder[]
    nextPageIndex: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BLOCKVISION_API_KEY
    if (!apiKey) {
      console.error("BLOCKVISION_API_KEY environment variable is not set.")
      return NextResponse.json(
        { error: "Server configuration error: Missing API key for BlockVision." },
        { status: 500 },
      )
    }
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Fetch real Monad holders data from BlockVision API
    const response = await fetch(`https://api.blockvision.org/v2/monad/native/holders?pageIndex=1&pageSize=${limit}`, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`BlockVision API error: ${response.status}`)
    }

    const data: BlockVisionResponse = await response.json()

    if (data.code !== 0) {
      throw new Error(`BlockVision API error: ${data.reason || data.message}`)
    }

    // Transform the data to match our interface
    const traders = data.result.data.map((holder, index) => {
      const amount = Number.parseFloat(holder.amount)
      const percentage = Number.parseFloat(holder.percentage)

      // Generate a display name from the address
      const displayName = `${holder.accountAddress.slice(0, 6)}...${holder.accountAddress.slice(-4)}`

      return {
        id: holder.accountAddress,
        username: holder.accountAddress.slice(0, 10),
        displayName,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${holder.accountAddress}`,
        verified: false, // We don't have verification data from this API
        farcasterFid: 0, // These are just wallet addresses, not Farcaster users
        rank: index + 1,
        volume: amount,
        transactionCount: 1, // We don't have transaction count from this API
        avgTransactionSize: amount,
        percentageChange: percentage,
        lastActivity: new Date().toISOString(),
        isContract: holder.isContract,
        walletAddress: holder.accountAddress,
        holdingPercentage: percentage,
      }
    })

    return NextResponse.json({
      traders,
      period: "all-time", // Holdings are cumulative
      totalTraders: traders.length,
      isMockData: false,
      message: "Real Monad native token holders",
      dataSource: "BlockVision API",
    })
  } catch (error) {
    console.error("Error fetching Monad holders:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Monad holders data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
