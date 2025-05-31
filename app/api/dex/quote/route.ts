import { type NextRequest, NextResponse } from "next/server"
import { monadDEX, tokenRegistry } from "@/lib/dex-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inputTokenSymbol = searchParams.get("inputToken")
    const outputTokenSymbol = searchParams.get("outputToken")
    const inputAmount = searchParams.get("inputAmount")

    if (!inputTokenSymbol || !outputTokenSymbol || !inputAmount) {
      return NextResponse.json(
        { error: "Missing required parameters: inputToken, outputToken, inputAmount" },
        { status: 400 },
      )
    }

    if (Number.parseFloat(inputAmount) <= 0) {
      return NextResponse.json({ error: "Input amount must be greater than 0" }, { status: 400 })
    }

    const inputToken = tokenRegistry.getTokenBySymbol(inputTokenSymbol)
    const outputToken = tokenRegistry.getTokenBySymbol(outputTokenSymbol)

    if (!inputToken) {
      return NextResponse.json({ error: `Input token ${inputTokenSymbol} not supported` }, { status: 400 })
    }
    if (!outputToken) {
      return NextResponse.json({ error: `Output token ${outputTokenSymbol} not supported` }, { status: 400 })
    }
    if (inputToken.address === outputToken.address) {
      return NextResponse.json({ error: "Input and output tokens cannot be the same" }, { status: 400 })
    }

    const quote = await monadDEX.getQuote({
      inputTokenAddress: inputToken.address,
      outputTokenAddress: outputToken.address,
      inputAmount,
    })

    // If getQuote returns null (e.g. parsed input amount raw is zero, or specific internal logic decided no quote)
    if (!quote) {
      return NextResponse.json(
        { error: "Unable to get quote. Input amount might be too small or pair invalid." },
        { status: 500 },
      )
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error("Error getting DEX quote (API Level):", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to get quote due to an internal server error."
    return NextResponse.json({ error: "Failed to get quote.", details: errorMessage }, { status: 500 })
  }
}
