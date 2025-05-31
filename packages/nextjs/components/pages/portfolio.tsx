"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTokens } from "@/components/providers/token-provider";
import { PortfolioCard } from "@/components/ui/portfolio-card";
import { Menu, Settings } from "lucide-react";
import { getUserDetails } from "@/lib/dbOperations";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
// import { encryptAndUpload } from "@/lib/lit";
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

export function PortfolioPage() {
  const { data: session, status } = useSession();
  const [portfolio, setPortfolio] = useState<any>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { savedTokens, tokenProfiles, defaultAmount, setDefaultAmount } =
    useTokens();
  const { data } = useQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });

  const getAllTokensAndHashesByUser = async () => {
    (data as Data)?.swapETHToTokens.forEach((item) => {
      console.log("Hash (id):", item.id);
      console.log("Token (token):", item.token);
    });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchPortfolio = async () => {
        const userDetails = await getUserDetails(
          session?.user?.email as string
        );
        setPortfolio(userDetails.portfolio);
      };
      fetchPortfolio();
    }
  }, [session, status]);
  const [inputValue, setInputValue] = useState<string>(defaultAmount);

  // useEffect(() => {
  //   const fetchAndUpload = async () => {
  //     const response = await fetch("../../my_seed.json"); // path to your JSON file
  //     const seedData = await response.json(); // Parse the JSON file
  //     const jsonString = JSON.stringify({
  //       "3be99109-1d74-43bf-b36e-80fdb9fe8227": {
  //         seed: seedData.seed,
  //         encrypted: true,
  //         authTag: seedData.authTag,
  //         iv: seedData.iv,
  //       },
  //     });

  //     // Encrypt and upload
  //     const uploadUrl = await encryptAndUpload(jsonString);
  //     console.log("Data uploaded to:", uploadUrl);
  //   };
  //   fetchAndUpload();
  // }, []);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#001F3F] via-[#1A1A2E] to-[#2D1B3D] flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-lg">Please sign in to view your portfolio</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#001F3F] via-[#1A1A2E] to-[#2D1B3D] relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MonaSwipe
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <button className="text-gray-300 hover:text-white transition">Profile</button>
            <button className="text-gray-300 hover:text-white transition">Settings</button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg md:hidden border-b border-white/10"
          >
            <div className="flex flex-col p-4 gap-4">
              <button className="text-gray-300 hover:text-white transition text-left">Profile</button>
              <button className="text-gray-300 hover:text-white transition text-left">Settings</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Your Portfolio
              </h1>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Default Amount:</span>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-24 p-2 text-sm rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 outline-none transition text-white"
                    step="0.01"
                  />
                  <button
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white hover:opacity-90 transition text-sm"
                    onClick={() => setDefaultAmount(inputValue)}
                  >
                    Set Default
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {portfolio.map((token: any, index: number) => (
                <motion.div
                  key={token.tokenAddress}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PortfolioCard
                    token={{
                      address: token.address,
                      name: token.name,
                      symbol: "",
                      price: 0,
                      priceChange: 0,
                      image: token.imageUrl,
                      amount: token.amount,
                      value: token.value,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {portfolio.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center"
              >
                <p className="text-gray-400 text-lg">No tokens in your portfolio yet. Start swiping to add some!</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
