import { NextResponse } from "next/server"

// In-memory storage for demo (use a database in production)
const verifications = new Map<
  string,
  {
    verified: boolean
    timestamp: string
    anonymousId: string
    signature: string
  }
>()

export async function GET() {
  try {
    const allVerifications = Array.from(verifications.entries()).map(([walletAddress, data]) => ({
      walletAddress,
      ...data,
    }))

    return NextResponse.json({
      verifications: allVerifications,
    })
  } catch (error) {
    console.error("Fetch verifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
