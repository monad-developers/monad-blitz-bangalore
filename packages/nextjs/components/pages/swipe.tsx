"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTokens } from "@/components/providers/token-provider";
import { TokenCard } from "@/components/ui/token-card";
import { useToast } from "@/hooks/use-toast";
import { addCoinToPortfolio } from "@/lib/dbOperations";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { HfInference } from "@huggingface/inference";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom, parseAbi } from 'viem';
const inference = new HfInference(process.env.NEXT_PUBLIC_HUGGING_FACE_API);

const MONASWIPE_ADDRESS = '0xA5cceBdb0D491c0f5e1d502718A04Bad70924D30';
const WMON_ADDRESS = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';

// ABIs
const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) external view returns (uint256)'
]);

const MONASWIPE_ABI = parseAbi([
  'function swapMonToToken(address _token, uint256 _monAmount, uint256 _minTokens) external',
  'function swapTokenToMon(address _token, uint256 _tokenAmount, uint256 _minMON) external',
  'event SwapMONToToken(address indexed user, uint256 monAmount, address token)',
  'event SwapTokenToMON(address indexed user, uint256 tokenAmount, address token)'
]);

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz/'] } },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com/' }
  }
};


import { gql, request } from "graphql-request";
const query = gql`
  {
    swapETHToTokens(
      where: { user: "0xd53cc2fAD80f2661e7Fd70fC7F2972A9fd9904C3" }
    ) {
      id
      token
    }
  }
`;
const url = "https://api.studio.thegraph.com/query/97549/swipe/version/latest";
interface SwapETHToToken {
  id: string;
  token: string;
}

interface Data {
  swapETHToTokens: SwapETHToToken[];
}

export function SwipePage({ category }: { category: string }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const {
    addToken,
    defaultAmount,
    uniswapPairs,
    tokenProfiles,
    loading,
    error,
    hasMoreTokens,
    fetchMoreTokens,
  } = useTokens();
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const { data } = useQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });
  const [trustScore, setTrustScore] = useState(0);
  const [tokenbought, setTokenBought] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  const getClient = async () => {
    if (embeddedWallet == undefined) {
      return null;
    }
    const provider = await embeddedWallet.getEthereumProvider();
    return createWalletClient({
      chain: monadTestnet, // Use the Monad config from previous example
      transport: custom(provider)
    });
  };

  const approveToken = async (tokenAddress: any, spender: any, amount: string) => {
    const client = await getClient();
    if (client == undefined) {
      return null;
    }

    const [account] = await client.getAddresses();

    return client.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, BigInt(amount)],
      account
    });
  };

  const handleSwapMonToToken = async () => {
    try {
      // setLoading(true);
      const client = await getClient();
      if (client == undefined) {
        return null;
      }
      const [account] = await client.getAddresses();

      // 1. Approve WMON spending
      await approveToken(WMON_ADDRESS, MONASWIPE_ADDRESS, '100000000');

      // 2. Execute swap
      const txHash = await client.writeContract({
        address: MONASWIPE_ADDRESS,
        abi: MONASWIPE_ABI,
        functionName: 'swapMonToToken',
        args: [
          '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
          BigInt(100000000),
          BigInt(10000)
        ],
        account
      });

      console.log('Swap successful:', txHash);
    } finally {
      // setLoading(false);
    }
  };


  useEffect(() => {
    const callHuggingFace = async () => {
      const prompt: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content: `ONLY NUMBER AS RESPONSE. Given the JSON data for a cryptocurrency token, analyze the trustworthiness of the coin based on factors such as liquidity, market data, token verification, social media presence, and developer activity. Do not provide an explanation or additional context. Only return a score out of 100 indicating the trustworthiness of the coin`,
        },
        {
          role: "user",
          content: JSON.stringify(currentToken),
        },
      ];

      let fullResponse = "";
      try {
        for await (const chunk of inference.chatCompletionStream({
          model: "mistralai/Mistral-Nemo-Instruct-2407",
          messages: prompt,
          max_tokens: 5,
          stream: false,
        })) {
          let content = chunk.choices[0]?.delta?.content || "";
          fullResponse += content;
        }

        console.log(fullResponse, "fullResponse");
        setTrustScore(parseInt(fullResponse)); // Only set trust score if valid response
      } catch (err) {
        console.error("Error calling HuggingFace API:", err);
      }
    };

    callHuggingFace();
  }, [tokenbought]);

  // Background fetching of more tokens
  useEffect(() => {
    if (currentIndex >= uniswapPairs.length - 5 && hasMoreTokens) {
      fetchMoreTokens();
    }
  }, [currentIndex, uniswapPairs.length, hasMoreTokens, fetchMoreTokens]);

  // Ensure we have a token to display
  const currentToken = uniswapPairs[currentIndex];
  if (!currentToken) return null;

  // Only show initial loading state
  if (!uniswapPairs.length && loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!uniswapPairs.length) return <div>No tokens found</div>;

  const buy = async (currentIndex: number) => {
    try {
      const currentToken = tokenProfiles[currentIndex];

      await handleSwapMonToToken();

      // const addressOfToken = currentToken.tokenAddress;
      // const response = await fetch("/api/fetch-wallet", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ addressOfToken }), // Send addressToBuy as part of the request body
      // });

      // const dataa = await response.json();

      // console.log("data from the contract", dataa);
      // if (!dataa.success) {
      //   throw new Error(dataa.error || "Contract call failed");
      // }

      // // Update wallet data with contract call results
      // console.log(dataa);

      // // GETTING THE LAST TX HASH by the user from subgraph
      // const address = (data as Data)?.swapETHToTokens[0].id;
      // console.log(address);

      await addCoinToPortfolio(
        session?.user?.email as string,
        uniswapPairs[currentIndex],
        defaultAmount
      );
      toast({
        title: "Token bought",
        description: (
          <>
            Successfully bought {defaultAmount} ETH worth.{" "}
            <a
              href={`https://sepolia.basescan.org/address/0xd53cc2fad80f2661e7fd70fc7f2972a9fd9904c3`}
              target="_blank"
              style={{ color: "#3498db" }}
            >
              Click here for details
            </a>
          </>
        ),
      });
    } catch (err) {
      console.error("Error calling contract:", err);
      toast({
        title: "Error",
        description: "Error calling contract",
        variant: "destructive",
      });
    }
    console.log("token bought", uniswapPairs[currentIndex]);

    setTokenBought(true);
  };

  const skip = async (currentIndex: number) => {
    console.log("token skipped", uniswapPairs[currentIndex]);
    setTokenBought(false);
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        await controls.start({ x: 500, opacity: 0 });
        addToken({ ...uniswapPairs[currentIndex], amount: defaultAmount });
        buy(currentIndex);
      } else {
        await controls.start({ x: -500, opacity: 0 });
        skip(currentIndex);
      }
      controls.set({ x: 0, opacity: 1 });

      // Only increment if we have more tokens
      if (currentIndex < uniswapPairs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
      }
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#001F3F] via-[#1A1A2E] to-[#2D1B3D] relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MonaSwipe
            </span>
          </div>

          <div className="flex gap-4">
            <ThumbsDown className="w-6 h-6 text-red-400 animate-pulse" />
            <ThumbsUp className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading States */}
      {(!uniswapPairs.length && loading) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent animate-spin mx-auto"></div>
            <p className="text-gray-400">Loading tokens...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-black/30 backdrop-blur-lg border border-red-500/20 rounded-xl p-6 text-center max-w-md mx-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      )}

      {(!uniswapPairs.length && !loading) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center max-w-md mx-4">
            <p className="text-gray-400">No tokens found in this category</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentToken && (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 flex items-center justify-center">
          <div className="w-full max-w-lg mx-auto">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={controls}
              className="touch-none flex justify-center relative"
            >
              {/* Swipe Instructions */}
              <div className="absolute left-0 -translate-x-full hidden md:flex items-center gap-2 text-gray-400">
                <ThumbsDown className="w-6 h-6" />
                <span>Swipe left to skip</span>
              </div>
              <div className="absolute right-0 translate-x-full hidden md:flex items-center gap-2 text-gray-400">
                <span>Swipe right to buy</span>
                <ThumbsUp className="w-6 h-6" />
              </div>

              {/* Mobile Instructions */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 md:hidden text-gray-400 text-sm whitespace-nowrap">
                Swipe left to skip, right to buy
              </div>

              <TokenCard token={currentToken} trustScore={trustScore} />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
