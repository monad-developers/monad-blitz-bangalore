import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { farcasterAPI } from "@/lib/farcaster-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const watchlist = await database.getWatchlist(userId)
    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { watcherUserId, watchedUserId } = await request.json()

    if (!watcherUserId || !watchedUserId) {
      return NextResponse.json({ error: "Both user IDs are required" }, { status: 400 })
    }

    console.log("Adding to watchlist:", { watcherUserId, watchedUserId })

    // First, fetch the user data from Farcaster API to ensure we have the latest info
    try {
      const fid = Number.parseInt(watchedUserId)
      console.log("Fetching user data for FID:", fid)

      const apiUsers = await farcasterAPI.getUsersByFids([fid])
      console.log("API users returned:", apiUsers.length)

      if (apiUsers.length > 0) {
        const rawUser = apiUsers[0]
        console.log("Raw user from API:", rawUser)
        console.log("Raw verified_addresses:", rawUser.verified_addresses)

        const user = farcasterAPI.transformUser(rawUser)
        console.log("Transformed user:", user)
        console.log("Connected addresses:", user.connectedAddresses)

        // Save the user data to ensure wallet addresses are stored
        await database.saveUser(user)
        console.log("User saved to database")
      } else {
        console.log("No user data returned from Farcaster API")
      }
    } catch (apiError) {
      console.error("Error fetching/saving user data:", apiError)
      // Continue with watchlist addition even if user data fetch fails
    }

    await database.addToWatchlist(watcherUserId, watchedUserId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const watcherUserId = searchParams.get("watcherUserId")
    const watchedUserId = searchParams.get("watchedUserId")

    if (!watcherUserId || !watchedUserId) {
      return NextResponse.json({ error: "Both user IDs are required" }, { status: 400 })
    }

    await database.removeFromWatchlist(watcherUserId, watchedUserId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}
