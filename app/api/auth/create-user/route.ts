import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { verifyMessage } from "viem"

export async function POST(request: NextRequest) {
  try {
    const { address, message, signature } = await request.json()

    if (!address || !message || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Create user in database with signature
    const userId = await database.createWalletUser(address.toLowerCase(), signature)

    // Update login timestamp
    await database.updateUserLogin(address.toLowerCase())

    return NextResponse.json({
      userId,
      address: address.toLowerCase(),
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
