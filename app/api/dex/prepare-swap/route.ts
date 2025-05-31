import { type NextRequest, NextResponse } from "next/server"
import { monadDEX, tokenRegistry } from "@/lib/dex-integration"

export async function POST(request: NextRequest) {
  try {
    const { inputTokenSymbol, outputTokenSymbol, inputAmount, slippage, recipient } = await request.json()

    if (!inputTokenSymbol || !outputTokenSymbol || !inputAmount || slippage === undefined || !recipient) {
      return NextResponse.json(
        { error: "Missing required parameters: inputTokenSymbol, outputTokenSymbol, inputAmount, slippage, recipient" },
        { status: 400 },
      )
    }

    if (Number.parseFloat(inputAmount) <= 0) {
      return NextResponse.json({ error: "Input amount must be greater than 0" }, { status: 400 })
    }
    if (Number.parseFloat(slippage) <= 0 || Number.parseFloat(slippage) > 50) {
      return NextResponse.json({ error: "Slippage must be between 0.1 and 50" }, { status: 400 })
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

    const txParams = await monadDEX.prepareSwapTransaction({
      inputTokenAddress: inputToken.address,
      outputTokenAddress: outputToken.address,
      inputAmount,
      slippage: Number.parseFloat(slippage),
      recipient,
    })

    if (!txParams) {
      return NextResponse.json({ error: "Failed to prepare swap transaction" }, { status: 500 })
    }

    return NextResponse.json(txParams)
  } catch (error) {
    console.error("Error preparing swap transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error during swap preparation"
    return NextResponse.json({ error: "Failed to prepare swap", details: errorMessage }, { status: 500 })
  }
}
