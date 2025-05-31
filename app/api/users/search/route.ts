import { type NextRequest, NextResponse } from "next/server"
import { farcasterAPI } from "@/lib/farcaster-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Search users via Farcaster API
    const apiUsers = await farcasterAPI.searchUsers(query)

    // Transform users without saving to database to avoid constraint errors
    const users = apiUsers.map((apiUser) => farcasterAPI.transformUser(apiUser))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}
