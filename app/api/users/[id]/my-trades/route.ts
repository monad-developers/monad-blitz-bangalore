import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

// Helper to get user ID - replace with your actual auth mechanism
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // This is a placeholder. In a real app, you'd get the user ID
  // from a session, JWT, or other authentication mechanism.
  // For now, we'll assume the [id] param is the user_id if no other auth is set up for API routes.
  // If you have a server-side session or JWT, use that.
  const url = new URL(request.url)
  const pathSegments = url.pathname.split("/")
  // Assuming URL is /api/users/{userId}/my-trades, userId is at index 3
  if (pathSegments.length > 3 && pathSegments[1] === "api" && pathSegments[2] === "users") {
    return pathSegments[3]
  }
  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id // The user ID from the route parameter

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Optional: Add authentication check to ensure the requester is the user
    // or has permission to view these trades.

    const trades = await database.getExecutedCopyTrades(userId)
    return NextResponse.json({ trades })
  } catch (error) {
    console.error("Error fetching executed copy trades:", error)
    return NextResponse.json({ error: "Failed to fetch executed copy trades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id // The user ID from the route parameter

    if (!userId) {
      return NextResponse.json({ error: "User ID is required for saving trade" }, { status: 400 })
    }

    // Optional: Add authentication check here as well.

    const tradeData = await request.json()

    if (!tradeData.copyTransactionHash || !tradeData.originalTransactionHash) {
      return NextResponse.json({ error: "Missing required trade data" }, { status: 400 })
    }

    const savedTradeId = await database.saveExecutedCopyTrade({
      userId, // Ensure userId from the path is used
      ...tradeData,
    })

    return NextResponse.json({ success: true, tradeId: savedTradeId, message: "Copy trade saved successfully" })
  } catch (error) {
    console.error("Error saving executed copy trade:", error)
    if (
      error instanceof Error &&
      error.message.includes(
        'duplicate key value violates unique constraint "executed_copy_trades_copy_transaction_hash_key"',
      )
    ) {
      return NextResponse.json({ error: "This trade has already been recorded." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to save executed copy trade" }, { status: 500 })
  }
}
