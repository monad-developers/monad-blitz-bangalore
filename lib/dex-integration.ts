// Define KNOWN_CONTRACTS and TokenData directly in this file
export const KNOWN_CONTRACTS = {
  MULTICALL3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11", name: "Multicall3" },
  UNISWAP_V2_FACTORY: { address: "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0", name: "UniswapV2Factory" },
  UNISWAP_V2_ROUTER: { address: "0xfb8e1c3b833f9e67a71c859a132cf783b645e436", name: "UniswapV2Router02" },
  UNISWAP_V3_FACTORY: { address: "0x961235a9020b05c44df1026d956d1f4d78014276", name: "UniswapV3Factory" },
  UNIVERSAL_ROUTER: { address: "0x3aE6D8A282D67893e17AA70ebFFb33EE5aa65893", name: "UniversalRouter" },
  WMON: { address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701", name: "Wrapped Monad", symbol: "WMON", decimals: 18 },
  USDC: { address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", name: "USD Coin", symbol: "USDC", decimals: 6 },
  USDT: { address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D", name: "Tether USD", symbol: "USDT", decimals: 6 },
  WBTC: { address: "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d", name: "Wrapped BTC", symbol: "WBTC", decimals: 8 },
  WETH: { address: "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37", name: "Wrapped Ether", symbol: "WETH", decimals: 18 },
  CREATEX: { address: "0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed", name: "CreateX" },
  PERMIT2: { address: "0x000000000022d473030f116ddee9f6b43ac78ba3", name: "Permit2" },
  NATIVE_MON: { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", name: "Monad", symbol: "MON", decimals: 18 },
}

export interface TokenData {
  address: string
  symbol: string
  name: string
  decimals: number
}

import { parseUnits, formatUnits } from "viem"
import { ethers } from "ethers"

const UNISWAP_V2_ROUTER_ABI = [
  "function WETH() external pure returns (address)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)",
]

const uniswapV2RouterInterface = new ethers.Interface(UNISWAP_V2_ROUTER_ABI)

export interface Token extends TokenData {
  logoURI?: string
  price?: number
}

export interface SwapQuote {
  inputToken: Token
  outputToken: Token
  inputAmount: string
  outputAmount: string
  priceImpact?: number
  gasEstimate?: string
  route?: string[]
  inputAmountRaw: bigint
  outputAmountRaw: bigint
}

export interface PrepareSwapParams {
  inputTokenAddress: string
  outputTokenAddress: string
  inputAmount: string
  slippage: number
  recipient: string
}

class TokenRegistry {
  private tokens: Map<string, Token> = new Map()

  constructor() {
    this.addToken({
      address: KNOWN_CONTRACTS.WMON.address,
      symbol: "WMON",
      name: "Wrapped Monad",
      decimals: 18,
      logoURI: "/tokens/wmon.png",
    })
    this.addToken({
      address: KNOWN_CONTRACTS.USDC.address,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "/tokens/usdc.png",
    })
    this.addToken({
      address: KNOWN_CONTRACTS.USDT.address,
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logoURI: "/tokens/usdt.png",
    })
    this.addToken({
      address: KNOWN_CONTRACTS.WBTC.address,
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      logoURI: "/tokens/wbtc.png",
    })
    this.addToken({
      address: KNOWN_CONTRACTS.WETH.address,
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI: "/tokens/weth.png",
    })
    this.addToken({
      address: KNOWN_CONTRACTS.NATIVE_MON.address,
      symbol: "MON",
      name: "Monad",
      decimals: 18,
      logoURI: "/tokens/mon.png",
    })
  }

  addToken(tokenData: TokenData & { logoURI?: string }): void {
    const address = tokenData.address.toLowerCase()
    if (!this.tokens.has(address)) {
      this.tokens.set(address, { ...tokenData, address })
    }
  }

  getTokenByAddress(address: string): Token | undefined {
    return this.tokens.get(address.toLowerCase())
  }

  getTokenBySymbol(symbol: string): Token | undefined {
    for (const token of this.tokens.values()) {
      if (token.symbol.toLowerCase() === symbol.toLowerCase()) {
        return token
      }
    }
    return undefined
  }

  getAvailableTokens(): Token[] {
    return Array.from(this.tokens.values())
  }

  public updateTokensFromBlockVision(
    bvTokens: Array<{ contractAddress: string; name: string; symbol: string; decimal: number; imageURL?: string }>,
  ) {
    bvTokens.forEach((bvToken) => {
      this.addToken({
        address: bvToken.contractAddress,
        name: bvToken.name,
        symbol: bvToken.symbol,
        decimals: bvToken.decimal,
        logoURI: bvToken.imageURL || undefined,
      })
    })
  }
}

export const tokenRegistry = new TokenRegistry()

export class MonadDEX {
  private rpcUrl = "https://testnet-rpc.monad.xyz"
  private provider: ethers.JsonRpcProvider
  private uniswapV2RouterAddress: string = KNOWN_CONTRACTS.UNISWAP_V2_ROUTER.address
  private uniswapV2Router: ethers.Contract
  private WMON_ADDRESS: string = KNOWN_CONTRACTS.WMON.address

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl)
    this.uniswapV2Router = new ethers.Contract(this.uniswapV2RouterAddress, UNISWAP_V2_ROUTER_ABI, this.provider)
  }

  async getQuote(params: {
    inputTokenAddress: string
    outputTokenAddress: string
    inputAmount: string
  }): Promise<SwapQuote | null> {
    const inputToken = tokenRegistry.getTokenByAddress(params.inputTokenAddress)
    const outputToken = tokenRegistry.getTokenByAddress(params.outputTokenAddress)

    if (!inputToken || !outputToken) {
      console.error("Input or output token not found in registry for quote.")
      return null
    }
    if (Number.parseFloat(params.inputAmount) <= 0) {
      console.warn("Input amount for quote is zero or invalid.")
      return null
    }

    try {
      const inputAmountRaw = parseUnits(params.inputAmount, inputToken.decimals)
      if (inputAmountRaw === 0n) {
        console.warn("Parsed input amount raw is zero.")
        return null
      }

      let path: string[]
      const actualInputAddress =
        inputToken.address === KNOWN_CONTRACTS.NATIVE_MON.address ? this.WMON_ADDRESS : inputToken.address
      const actualOutputAddress =
        outputToken.address === KNOWN_CONTRACTS.NATIVE_MON.address ? this.WMON_ADDRESS : outputToken.address

      if (actualInputAddress === actualOutputAddress) {
        console.error(
          "Invalid path for quote: input and output WMON addresses are the same after NATIVE_MON conversion.",
        )
        throw new Error("Input and output tokens are effectively the same (WMON).")
      }

      if (actualInputAddress === this.WMON_ADDRESS && actualOutputAddress !== this.WMON_ADDRESS) {
        path = [this.WMON_ADDRESS, actualOutputAddress]
      } else if (actualInputAddress !== this.WMON_ADDRESS && actualOutputAddress === this.WMON_ADDRESS) {
        path = [actualInputAddress, this.WMON_ADDRESS]
      } else if (actualInputAddress !== this.WMON_ADDRESS && actualOutputAddress !== this.WMON_ADDRESS) {
        path = [actualInputAddress, this.WMON_ADDRESS, actualOutputAddress]
      } else {
        // This case should ideally be caught by actualInputAddress === actualOutputAddress check above
        console.error("Unhandled path construction in getQuote.")
        throw new Error("Could not determine a valid swap path.")
      }

      const amountsOut = await this.uniswapV2Router.getAmountsOut(inputAmountRaw, path)
      const outputAmountRaw = amountsOut[amountsOut.length - 1] as bigint
      const outputAmountFormatted = formatUnits(outputAmountRaw, outputToken.decimals)
      const gasEstimateFormatted = "0.005"

      return {
        inputToken,
        outputToken,
        inputAmount: params.inputAmount,
        outputAmount: outputAmountFormatted,
        inputAmountRaw,
        outputAmountRaw,
        priceImpact: 0.1,
        gasEstimate: gasEstimateFormatted,
        route: path,
      }
    } catch (error: any) {
      let detailedMessage = "Unknown error during quote fetching."
      // Ethers v6 often wraps errors. Check for common properties.
      if (error.code === "CALL_EXCEPTION" && error.reason) {
        // ethers.isCallException(error)
        detailedMessage = `DEX call reverted: ${error.reason}`
      } else if (error.info?.error?.message) {
        // Nested error info from provider/RPC
        detailedMessage = `RPC Error: ${error.info.error.message}`
      } else if (error.data && typeof error.data.message === "string") {
        detailedMessage = `DEX Error: ${error.data.message}`
      } else if (error.message) {
        detailedMessage = error.message
      } else if (typeof error === "string") {
        detailedMessage = error
      }

      console.error(
        `Error in getQuote for ${inputToken?.symbol} -> ${outputToken?.symbol}, amount: ${params.inputAmount}. Details: ${detailedMessage}`,
        error, // Log the full error object for more context
      )

      if (detailedMessage.toLowerCase().includes("insufficient liquidity")) {
        throw new Error("Insufficient liquidity for this trade.")
      }
      if (detailedMessage.toLowerCase().includes("pair doesn't exist")) {
        // Example of another specific check
        throw new Error("This trading pair does not exist or has no liquidity.")
      }
      throw new Error(`Could not fetch quote. DEX Error: ${detailedMessage.substring(0, 200)}`)
    }
  }

  async prepareSwapTransaction(
    params: PrepareSwapParams,
  ): Promise<{ to: string; data: string; value?: string } | null> {
    const { inputTokenAddress, outputTokenAddress, inputAmount, slippage, recipient } = params

    const inputToken = tokenRegistry.getTokenByAddress(inputTokenAddress)
    const outputToken = tokenRegistry.getTokenByAddress(outputTokenAddress)

    if (!inputToken || !outputToken) {
      console.error("Invalid token address in prepareSwapTransaction")
      return null
    }
    if (Number.parseFloat(inputAmount) <= 0) {
      console.error("Input amount for swap is zero or invalid.")
      return null
    }

    const inputAmountRaw = parseUnits(inputAmount, inputToken.decimals)

    const quote = await this.getQuote({ inputTokenAddress, outputTokenAddress, inputAmount })
    if (!quote || !quote.outputAmountRaw || !quote.route) {
      console.error("Failed to get quote for preparing swap transaction")
      // Propagate the error message from getQuote if it exists
      const quoteErrorMessage = quote === null ? "Quote object was null." : "Quote missing outputAmountRaw or route."
      throw new Error(
        `Failed to get quote for swap preparation. ${quoteErrorMessage} This could be due to insufficient liquidity or an invalid pair.`,
      )
    }

    const expectedOutputAmountRaw = quote.outputAmountRaw
    const amountOutMin =
      expectedOutputAmountRaw - (expectedOutputAmountRaw * BigInt(Math.floor(slippage * 100))) / BigInt(10000)

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20

    let txData: string
    let txValue: string | undefined = "0"
    const path = quote.route

    const isInputNative = inputToken.address === KNOWN_CONTRACTS.NATIVE_MON.address

    if (isInputNative) {
      txData = uniswapV2RouterInterface.encodeFunctionData("swapExactETHForTokens", [
        amountOutMin,
        path,
        recipient,
        deadline,
      ])
      txValue = inputAmountRaw.toString()
    } else {
      const isOutputNative = outputToken.address === KNOWN_CONTRACTS.NATIVE_MON.address
      if (isOutputNative) {
        txData = uniswapV2RouterInterface.encodeFunctionData("swapExactTokensForETH", [
          inputAmountRaw,
          amountOutMin,
          path,
          recipient,
          deadline,
        ])
      } else {
        txData = uniswapV2RouterInterface.encodeFunctionData("swapExactTokensForTokens", [
          inputAmountRaw,
          amountOutMin,
          path,
          recipient,
          deadline,
        ])
      }
    }

    return {
      to: this.uniswapV2RouterAddress,
      data: txData,
      value: txValue,
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const token = tokenRegistry.getTokenByAddress(tokenAddress)
    if (!token) return "0"

    if (token.address === KNOWN_CONTRACTS.NATIVE_MON.address) {
      const balance = await this.provider.getBalance(userAddress)
      return formatUnits(balance, 18)
    } else {
      const tokenContract = new ethers.Contract(
        token.address,
        ["function balanceOf(address owner) view returns (uint256)"],
        this.provider,
      )
      const balance = await tokenContract.balanceOf(userAddress)
      return formatUnits(balance, token.decimals)
    }
  }

  getAvailableTokens(): Token[] {
    return tokenRegistry.getAvailableTokens()
  }
}

export const monadDEX = new MonadDEX()
