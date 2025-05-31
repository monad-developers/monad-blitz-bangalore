"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header: string;
  description: string;
  links: {
    type: string;
    label: string;
    url: string;
  }[];
}

export interface TokenPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  priceChange: {
    h24: string;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    websites: { url: string }[];
    socials: {
      platform: string;
      handle: string;
    }[];
  };
  boosts: {
    active: number;
  };
  amount?: string; // Keeping this for saved tokens functionality
}

interface TokenContextType {
  savedTokens: TokenPair[];
  addToken: (token: TokenPair) => void;
  removeToken: (address: string) => void;
  defaultAmount: string;
  setDefaultAmount: (amount: string) => void;
  tokenProfiles: TokenProfile[];
  uniswapPairs: TokenPair[];
  loading: boolean;
  error: string | null;
  hasMoreTokens: boolean;
  fetchMoreTokens: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType>({
  savedTokens: [],
  addToken: () => {},
  removeToken: () => {},
  defaultAmount: "0.1",
  setDefaultAmount: () => {},
  tokenProfiles: [],
  uniswapPairs: [],
  loading: true,
  error: null,
  hasMoreTokens: true,
  fetchMoreTokens: async () => {},
});

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const tokenProfiless: TokenProfile[] = [
    {
      url: "https://dexscreener.com/base/0x2037c6882cc70f2e3ea2a4ad5c2deff9413a9afc",
      chainId: "base",
      tokenAddress: "0x163372Ef82CDd0BA5C632a9F075e8BD1aDdF240E",
      icon: "https://dd.dexscreener.com/ds-data/tokens/base/0x2037c6882cc70f2e3ea2a4ad5c2deff9413a9afc.png",
      header:
        "https://dd.dexscreener.com/ds-data/tokens/base/0x2037c6882cc70f2e3ea2a4ad5c2deff9413a9afc/header.png",
      description:
        "Alchemist AI is a no-code development platform where users can manifest any idea, dream, or thoughts into a living application.",
      links: [
        {
          type: "website",
          label: "Website",
          url: "https://www.alchemistai.app/",
        },
        { type: "twitter", label: "Twitter", url: "https://x.com/alch_ai" },
        { type: "telegram", label: "Telegram", url: "https://t.me/alch_ai" },
      ],
    },
    {
      url: "https://dexscreener.com/base/0x98e63940983fd5895a811d4cba7a406fe6277815",
      chainId: "base",
      tokenAddress: "0x7A0F5E2751ee243DEDF6A1FB600a316838CF1B05",
      icon: "UwaObKviAMp7s4Fu",
      header:
        "https://cdn.dexscreener.com/cms/images/4ARjzwSqig3r1jWN?width=900&height=300&fit=crop&quality=95&format=auto",
      description: "$CHILLTb - Make America Chill Again 🇺🇸",
      links: [
        { type: "website", label: "Website", url: "https://chilltrump.com/" },
      ],
    },
    {
      url: "https://dexscreener.com/solana/bd3ybmy11qczql2nqtdxwsy7h2tqfnq2zpae64cnpump",
      chainId: "base",
      tokenAddress: "0x5EdF9324539DaF9dFeff8E15c8A8ce813968C08e",
      icon: "https://dd.dexscreener.com/ds-data/tokens/solana/Bd3YbMY11QCZQL2nQTdXWSY7h2tqFnq2ZPAE64Cnpump.png",
      header:
        "https://dd.dexscreener.com/ds-data/tokens/solana/Bd3YbMY11QCZQL2nQTdXWSY7h2tqFnq2ZPAE64Cnpump/header.png",
      description: "HI IM BILL. $BDUCK",
      links: [
        {
          type: "twitter",
          label: "Twitter",
          url: "https://x.com/wvzfd73624117",
        },
      ],
    },
    {
      url: "https://dexscreener.com/solana/d154wzpvgurgxnes9ske55pvw7cyr9pggdgeetm4pump",
      chainId: "base",
      tokenAddress: "0x25F417c18D37052036e27aBCd3689cD722996E95",
      icon: "https://dd.dexscreener.com/ds-data/tokens/solana/D154wzpvGurGxnEs9sKE55PVw7CyR9pggDgEEtM4pump.png",
      header:
        "https://dd.dexscreener.com/ds-data/tokens/solana/D154wzpvGurGxnEs9sKE55PVw7CyR9pggDgEEtM4pump/header.png",
      description: "",
      links: [
        {
          type: "telegram",
          label: "Telegram",
          url: "https://t.me/destiny_community",
        },
      ],
    },
    {
      url: "https://dexscreener.com/solana/gndpjcwjtfawvl1s56bvexjckmpexsxqfrnvv9c5zrcq",
      chainId: "base",
      tokenAddress: "0x349cd84F799711a21510165229e65A07fb74E413",
      icon: "https://dd.dexscreener.com/ds-data/tokens/solana/GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq.png",
      header:
        "https://dd.dexscreener.com/ds-data/tokens/solana/GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq/header.png",
      description: "The OG wif deployed on pump fun 10 months ago",
      links: [
        { type: "twitter", label: "Twitter", url: "https://x.com/ogwifonpump" },
        {
          type: "telegram",
          label: "Telegram",
          url: "https://t.me/OGDogWifHat",
        },
      ],
    },
  ];

  const tokenPairss: TokenPair[] = [
    {
      chainId: "base",
      dexId: "moonshot",
      url: "https://dexscreener.com/base/0x98e63940983fd5895a811d4cba7a406fe6277815:moon",
      pairAddress: "0x98E63940983FD5895a811D4cBa7a406Fe6277815:moon",
      baseToken: {
        address: "0x98E63940983FD5895a811D4cBa7a406Fe6277815",
        name: "Chill Trump on Base",
        symbol: "CHILLTb",
      },
      quoteToken: {
        address: "0x4200000000000000000000000000000000000006",
        name: "Wrapped Ether",
        symbol: "WETH",
      },
      priceNative: "0.000000001555",
      priceUsd: "0.000006203",
      priceChange: {
        h24: "2.21",
      },
      liquidity: {
        usd: 0,
        base: 0,
        quote: 0,
      },
      fdv: 6203.38,
      marketCap: 6203.38,
      pairCreatedAt: 1733628127000,
      info: {
        imageUrl:
          "https://cdn.dexscreener.com/cms/images/UwaObKviAMp7s4Fu?width=64&height=64&quality=90",
        websites: [
          {
            url: "https://chilltrump.com/",
          },
        ],
        socials: [],
      },
      boosts: {
        active: 10,
      },
    },
    {
      chainId: "solana",
      dexId: "raydium",
      url: "https://dexscreener.com/solana/gaytfiuc1zabghddsztjqceqf47nh1wzjhajnjiuo4k9",
      pairAddress: "GAyTfiUC1ZAbGhDDSZTJqceQF47nH1wzjhAjNjiuo4K9",
      baseToken: {
        address: "Bd3YbMY11QCZQL2nQTdXWSY7h2tqFnq2ZPAE64Cnpump",
        name: "bill the duck",
        symbol: "BDUCK",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.00000002441",
      priceUsd: "0.000005838",
      priceChange: {
        h24: "-94.36",
      },
      liquidity: {
        usd: 9839.8,
        base: 833525080,
        quote: 20.7987,
      },
      fdv: 5838,
      marketCap: 5838,
      pairCreatedAt: 1733632302000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/Bd3YbMY11QCZQL2nQTdXWSY7h2tqFnq2ZPAE64Cnpump.png?key=f29ca9",
        websites: [],
        socials: [
          {
            platform: "twitter",
            handle: "https://x.com/wvzfd73624117",
          },
        ],
      },
      boosts: {
        active: 0,
      },
    },
    {
      chainId: "solana",
      dexId: "raydium",
      url: "https://dexscreener.com/solana/5aewf3d323idhsga8sbb1abw25nzr9s8yp49hd7gruqk",
      pairAddress: "5Aewf3D323iDhsGa8SbB1ABw25NzR9s8Yp49HD7GRuqK",
      baseToken: {
        address: "D154wzpvGurGxnEs9sKE55PVw7CyR9pggDgEEtM4pump",
        name: "Destiny Ai",
        symbol: "DESTINY",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.00000002474",
      priceUsd: "0.000005906",
      priceChange: {
        h24: "-94.15",
      },
      liquidity: {
        usd: 9911.37,
        base: 843461575,
        quote: 20.6529,
      },
      fdv: 5906,
      marketCap: 5906,
      pairCreatedAt: 1733620351000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/D154wzpvGurGxnEs9sKE55PVw7CyR9pggDgEEtM4pump.png?key=d16f7a",
        websites: [],
        socials: [
          {
            platform: "telegram",
            handle: "https://t.me/destiny_community",
          },
        ],
      },
      boosts: {
        active: 0,
      },
    },
    {
      chainId: "solana",
      dexId: "meteora",
      url: "https://dexscreener.com/solana/46suj2ebhhlqocmhkw77wnfx4rxisubsrxjwscrruqhj",
      pairAddress: "46Suj2ebHHLqoCmHKw77WNFX4RXisuBsRXjwsCRRuQHJ",
      baseToken: {
        address: "GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq",
        name: "dogwifhat",
        symbol: "PUMP",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.0000005870",
      priceUsd: "0.0001405",
      priceChange: {
        h24: "69.06",
      },
      liquidity: {
        usd: 101.68,
        base: 125175,
        quote: 0.3513,
      },
      fdv: 139644,
      marketCap: 139644,
      pairCreatedAt: 1733632227000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq.png?key=9da474",
        websites: [],
        socials: [
          {
            platform: "twitter",
            handle: "https://x.com/ogwifonpump",
          },
          {
            platform: "telegram",
            handle: "https://t.me/OGDogWifHat",
          },
        ],
      },
      boosts: {
        active: 0,
      },
    },
    {
      chainId: "solana",
      dexId: "meteora",
      url: "https://dexscreener.com/solana/5f79gnjcbrwdbgefsfjz3k6awsa5flf8t4x5urhpzwke",
      pairAddress: "5F79gnJcBrWDBGEfsfjz3K6AwSa5FLF8T4X5UrHPZwKE",
      baseToken: {
        address: "GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq",
        name: "dogwifhat",
        symbol: "PUMP",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.0000004562",
      priceUsd: "0.0001089",
      priceChange: {
        h24: "8.45",
      },
      liquidity: {
        usd: 108.8,
        base: 219079,
        quote: 0.3557,
      },
      fdv: 108257,
      marketCap: 108257,
      pairCreatedAt: 1733632819000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq.png?key=9da474",
        websites: [],
        socials: [
          {
            platform: "twitter",
            handle: "https://x.com/ogwifonpump",
          },
          {
            platform: "telegram",
            handle: "https://t.me/OGDogWifHat",
          },
        ],
      },
      boosts: {
        active: 0,
      },
    },
    {
      chainId: "solana",
      dexId: "meteora",
      url: "https://dexscreener.com/solana/ckgg3wpnmupjwaxpdywff4nbf3bva5hxsfk5khv2ctt9",
      pairAddress: "CKgG3wPnmUPjWAxPDywFF4NBF3BvA5HXsFk5khV2CTt9",
      baseToken: {
        address: "GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq",
        name: "dogwifhat",
        symbol: "PUMP",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.0000003011",
      priceUsd: "0.00007188",
      priceChange: {
        h24: "2.15",
      },
      liquidity: {
        usd: 61.26,
        base: 215116,
        quote: 0.3487,
      },
      fdv: 71885.9,
      marketCap: 71885.9,
      pairCreatedAt: 1733634716000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/GNDPJCwjtfAwvL1S56bVeXjCKmpeXsxqfRnvv9C5zRCq.png?key=9da474",
        websites: [],
        socials: [
          {
            platform: "twitter",
            handle: "https://x.com/ogwifonpump",
          },
          {
            platform: "telegram",
            handle: "https://t.me/OGDogWifHat",
          },
        ],
      },
      boosts: {
        active: 0,
      },
    },
  ];

  // Saved tokens state
  const [savedTokens, setSavedTokens] = useState<TokenPair[]>([]);
  const [defaultAmount, setDefaultAmount] = useState("0.1");

  // Application state
  const [tokenProfiles, setTokenProfiles] = useState<TokenProfile[]>([]);
  const [uniswapPairs, setUniswapPairs] = useState<TokenPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseTokenAddresses, setBaseTokenAddresses] = useState<string[]>([]);
  const [hasMoreTokens, setHasMoreTokens] = useState(true);
  const [page, setPage] = useState(1);
  const [fetchedAddresses] = useState(new Set<string>());

  const customAddresses = [
    "0x163372Ef82CDd0BA5C632a9F075e8BD1aDdF240E",
    "0x7A0F5E2751ee243DEDF6A1FB600a316838CF1B05",
    "0x5EdF9324539DaF9dFeff8E15c8A8ce813968C08e",
    "0x25F417c18D37052036e27aBCd3689cD722996E95",
    "0x349cd84F799711a21510165229e65A07fb74E413",
  ];

  // Fetch token profiles
  const fetchTokenProfiles = async () => {
    try {
      const response = await fetch(
        "https://api.dexscreener.com/token-profiles/latest/v1"
      );
      const data = await response.json();

      // Filter profiles for base chain
      const baseProfiles = data.filter(
        (profile: TokenProfile) => profile.chainId === "base"
      );

      // Extract and save the existing token addresses before updating profiles
      const existingAddresses = baseProfiles.map(
        (profile: TokenProfile) => profile.tokenAddress
      );

      setBaseTokenAddresses(customAddresses);

      // Now update the profiles with custom addresses
      let addressIndex = 0; // Start at the first address
      const updatedProfiles = baseProfiles.map((profile: TokenProfile) => {
        const updatedProfile = {
          ...profile,
          tokenAddress: customAddresses[addressIndex], // Update tokenAddress
        };
        addressIndex = (addressIndex + 1) % customAddresses.length; // Cycle through addresses
        return updatedProfile;
      });

      // Update state with the updated profiles
      // setTokenProfiles(updatedProfiles);
      setTokenProfiles(tokenProfiless);
    } catch (err) {
      console.error("Error fetching token profiles:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token profiles"
      );
    }
  };
  // const fetchTokenProfiles = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://api.dexscreener.com/token-profiles/latest/v1"
  //     );
  //     const data = await response.json();

  //     // Filter profiles for base chain
  //     const baseProfiles = data.filter(
  //       (profile: TokenProfile) => profile.chainId === "base"
  //     );
  //     setTokenProfiles(baseProfiles);

  //     // Extract and save token addresses
  //     const addresses = baseProfiles.map(
  //       (profile: TokenProfile) => profile.tokenAddress
  //     );
  //     setBaseTokenAddresses(addresses);
  //   } catch (err) {
  //     console.error("Error fetching token profiles:", err);
  //     setError(
  //       err instanceof Error ? err.message : "Failed to fetch token profiles"
  //     );
  //   }
  // };

  // Fetch token pairs data
  const fetchTokenPairs = async () => {
    // if (!baseTokenAddresses.length) return;

    try {
      // Join addresses with comma for the API call
      // const addressesString = baseTokenAddresses.join(",");
      // const response = await fetch(
      //   `https://api.dexscreener.com/latest/dex/tokens/${addressesString}`
      // );
      // const data = await response.json();

      // // Filter for Uniswap pairs
      // const uniswapPairsData = data.pairs.filter(
      //   (pair: TokenPair) => pair.dexId === "uniswap"
      // );
      // setUniswapPairs(uniswapPairsData);
      setUniswapPairs(tokenPairss);
    } catch (err) {
      console.error("Error fetching token pairs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token pairs"
      );
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTokenProfiles();
  }, []);

  // Fetch first batch of pairs when profiles are loaded
  useEffect(() => {
    if (baseTokenAddresses.length > 0) {
      fetchTokenPairs();
    }
  }, [baseTokenAddresses]);

  const fetchMoreTokens = async () => {
    if (!loading && hasMoreTokens) {
      await fetchTokenPairs();
    }
  };

  const addToken = (token: TokenPair) => {
    setSavedTokens((prev) => [...prev, token]);
  };

  const removeToken = (address: string) => {
    setSavedTokens((prev) =>
      prev.filter((token) => token.baseToken.address !== address)
    );
  };

  return (
    <TokenContext.Provider
      value={{
        savedTokens,
        addToken,
        removeToken,
        defaultAmount,
        setDefaultAmount,
        tokenProfiles,
        uniswapPairs,
        loading,
        error,
        hasMoreTokens,
        fetchMoreTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export const useTokens = () => useContext(TokenContext);
