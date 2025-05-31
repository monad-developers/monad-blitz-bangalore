import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const user = await database.getUserByWallet(address.toLowerCase())

    if (user) {
      // Update last login timestamp
      await database.updateUserLogin(address.toLowerCase())

      return NextResponse.json({
        userId: user.id,
        address: user.wallet_address,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        verified: user.verified,
      })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      userId: user.id,
      address: user.wallet_address,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
