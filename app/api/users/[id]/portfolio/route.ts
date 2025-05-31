import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

// Interfaces (BlockVisionToken, BlockVisionAccountTokensResponse, PortfolioToken) remain the same

interface BlockVisionToken {
  contractAddress: string
  name: string
  imageURL: string
  symbol: string
  price: string
  decimal: number
  balance: string
  verified: boolean
}

interface BlockVisionAccountTokensResponse {
  code: number
  reason: string
  message: string
  result: {
    data: BlockVisionToken[]
    total: number
    firstSeen: number
    usdValue: number
  }
}

export interface PortfolioToken {
  name: string
  symbol: string
  value: number
  imageURL?: string
  contractAddress: string
}

async function fetchTokensForAddress(address: string, apiKey: string): Promise<PortfolioToken[]> {
  console.log(`Fetching tokens for address: ${address} using API key: ${apiKey ? "******" : "NOT PROVIDED"}`)
  try {
    const response = await fetch(`https://api.blockvision.org/v2/monad/account/tokens?address=${address}`, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `BlockVision API error for address ${address}: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 500)}`,
      )
      return []
    }

    const responseText = await response.text() // Get text first
    let data: BlockVisionAccountTokensResponse
    try {
      data = JSON.parse(responseText)
    } catch (e: any) {
      console.error(
        `BlockVision API response for address ${address} was not valid JSON. Error: ${e.message}. Response text: ${responseText.substring(0, 500)}`,
      )
      return []
    }

    if (data.code !== 0 || !data.result || !data.result.data) {
      console.error(`BlockVision API data error for address ${address}: ${data.message || data.reason}`)
      return []
    }
    console.log(`Successfully fetched ${data.result.data.length} tokens for address ${address}`)
    return data.result.data.map((token) => ({
      name: token.name,
      symbol: token.symbol,
      value: Number.parseFloat(token.balance) || 0,
      imageURL: token.imageURL,
      contractAddress: token.contractAddress,
    }))
  } catch (error: any) {
    console.error(`Critical error in fetchTokensForAddress for ${address}:`, error.message, error.stack)
    return [] // Ensure it always returns an array on error
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id
  console.log(`[Portfolio API] Invoked for userId: ${userId}`)
  try {
    const apiKey = process.env.BLOCKVISION_API_KEY
    if (!apiKey) {
      console.error("[Portfolio API] BLOCKVISION_API_KEY environment variable is not set.")
      return NextResponse.json(
        { error: "Server configuration error: Missing API key for BlockVision." },
        { status: 500 },
      )
    }
    console.log("[Portfolio API] API key found.")

    const { searchParams } = new URL(request.url)
    const walletQuery = searchParams.get("walletAddress")
    console.log(`[Portfolio API] Wallet query: ${walletQuery}`)

    if (!userId) {
      console.error("[Portfolio API] User ID is required but not provided in params.")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`[Portfolio API] Fetching user data for userId: ${userId}`)
    const dbUser = await database.getUserById(userId)
    if (!dbUser) {
      console.warn(`[Portfolio API] User not found in database for userId: ${userId}`)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }
    console.log(
      `[Portfolio API] User data fetched. User has ${dbUser.connectedAddresses?.length || 0} connected addresses.`,
    )

    let targetAddresses: string[] = []
    if (walletQuery && walletQuery !== "all") {
      targetAddresses = [walletQuery]
    } else {
      targetAddresses = dbUser.connectedAddresses || []
    }
    console.log(`[Portfolio API] Target addresses for BlockVision API: ${targetAddresses.join(", ")}`)

    if (targetAddresses.length === 0) {
      console.log("[Portfolio API] No target wallets to fetch data for.")
      return NextResponse.json({ portfolio: [], message: "No wallets to fetch data for." })
    }

    const allTokensPromises = targetAddresses.map((address) => fetchTokensForAddress(address, apiKey))
    console.log(`[Portfolio API] Created ${allTokensPromises.length} promises for fetching tokens.`)

    const results = await Promise.all(allTokensPromises)
    console.log("[Portfolio API] All token fetch promises resolved.")

    const aggregatedPortfolio: { [symbol: string]: PortfolioToken } = {}

    for (const tokens of results) {
      for (const token of tokens) {
        if (aggregatedPortfolio[token.symbol]) {
          aggregatedPortfolio[token.symbol].value += token.value
        } else {
          aggregatedPortfolio[token.symbol] = { ...token }
        }
      }
    }

    const finalPortfolio = Object.values(aggregatedPortfolio).filter((token) => token.value > 0)
    console.log(
      `[Portfolio API] Successfully processed. Returning ${finalPortfolio.length} aggregated portfolio items.`,
    )
    return NextResponse.json({ portfolio: finalPortfolio })
  } catch (error: any) {
    console.error(`[Portfolio API] Critical error in GET handler for userId ${userId}:`, error.message, error.stack)
    // Ensure a JSON response even in critical failure
    return NextResponse.json(
      { error: "Failed to fetch portfolio due to an unexpected internal server error." },
      { status: 500 },
    )
  }
}
