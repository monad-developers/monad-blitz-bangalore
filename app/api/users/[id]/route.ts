import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { farcasterAPI } from "@/lib/farcaster-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // First try to get user from database
    let user = await database.getUserById(userId)

    // If not found in database, try to fetch from Farcaster API
    if (!user) {
      try {
        const fid = Number.parseInt(userId)
        if (!isNaN(fid)) {
          const apiUsers = await farcasterAPI.getUsersByFids([fid])

          if (apiUsers.length > 0) {
            const apiUser = farcasterAPI.transformUser(apiUsers[0])
            await database.saveUser(apiUser)
            user = apiUser
          }
        }
      } catch (apiError) {
        console.error("Error fetching user from Farcaster API:", apiError)
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
