import React from "react";
import { Search, Filter, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { WalletButton } from "@/components/WalletButton";

// Add Monad logo SVG component
const MonadLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-1"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M200 400C310.457 400 400 310.457 400 200C400 89.5431 310.457 0 200 0C89.5431 0 0 89.5431 0 200C0 310.457 89.5431 400 200 400ZM200 360C288.366 360 360 288.366 360 200C360 111.634 288.366 40 200 40C111.634 40 40 111.634 40 200C40 288.366 111.634 360 200 360Z"
      fill="currentColor"
    />
  </svg>
);

// Mock data for gigs
const mockGigs = [
  {
    id: 1,
    title: "Smart Contract Development",
    description: "Expert smart contract development for DeFi applications",
    price: 500,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Alex Thompson",
      rating: 4.8,
      completedJobs: 32,
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    tags: ["Smart Contracts", "Solidity", "DeFi"],
  },
  {
    id: 2,
    title: "Web3 Frontend Development",
    description: "Building responsive and modern Web3 frontends",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Sarah Chen",
      rating: 4.9,
      completedJobs: 45,
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    tags: ["React", "Web3.js", "UI/UX"],
  },
  {
    id: 3,
    title: "Blockchain Consulting",
    description: "Strategic consulting for blockchain projects",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Michael Rodriguez",
      rating: 5.0,
      completedJobs: 28,
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    tags: ["Consulting", "Strategy", "Blockchain"],
  },
  {
    id: 4,
    title: "NFT Collection Development",
    description: "Create unique NFT collections with custom smart contracts",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Emily Parker",
      rating: 4.7,
      completedJobs: 23,
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    tags: ["NFT", "ERC721", "Digital Art"],
  },
  {
    id: 5,
    title: "Smart Contract Auditing",
    description: "Comprehensive security audits for smart contracts",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "David Kim",
      rating: 4.9,
      completedJobs: 56,
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    tags: ["Security", "Auditing", "Solidity"],
  },
  {
    id: 6,
    title: "DeFi Protocol Design",
    description: "Design and implement custom DeFi protocols",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Lisa Wang",
      rating: 4.8,
      completedJobs: 34,
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    tags: ["DeFi", "Protocol", "Tokenomics"],
  },
  {
    id: 7,
    title: "Blockchain Game Development",
    description: "Create engaging blockchain-based games",
    price: 750,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "James Wilson",
      rating: 4.6,
      completedJobs: 19,
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    tags: ["Gaming", "Unity", "Web3"],
  },
  {
    id: 8,
    title: "Token Smart Contract",
    description: "Custom token development with advanced features",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Anna Kowalski",
      rating: 4.7,
      completedJobs: 27,
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    tags: ["ERC20", "Tokens", "Solidity"],
  },
  {
    id: 9,
    title: "DAO Development",
    description: "Build decentralized autonomous organizations",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Tom Martinez",
      rating: 4.9,
      completedJobs: 41,
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    tags: ["DAO", "Governance", "Web3"],
  },
  {
    id: 10,
    title: "Web3 Backend Integration",
    description: "Integrate blockchain functionality into existing backends",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Sophie Anderson",
      rating: 4.8,
      completedJobs: 31,
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    tags: ["Backend", "API", "Integration"],
  },
  {
    id: 11,
    title: "Cross-chain Bridge Development",
    description: "Build secure cross-chain bridge solutions",
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Ryan Cooper",
      rating: 4.9,
      completedJobs: 38,
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    tags: ["Cross-chain", "Bridges", "Security"],
  },
  {
    id: 12,
    title: "Staking Platform Development",
    description: "Create custom staking and reward systems",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Nina Patel",
      rating: 4.7,
      completedJobs: 25,
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    tags: ["Staking", "DeFi", "Rewards"],
  },
  {
    id: 13,
    title: "DEX Development",
    description: "Build decentralized exchange platforms",
    price: 950,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Chris Lee",
      rating: 4.8,
      completedJobs: 33,
      avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    },
    tags: ["DEX", "AMM", "Liquidity"],
  },
  {
    id: 14,
    title: "Blockchain Analytics",
    description: "Develop blockchain data analytics solutions",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Maria Garcia",
      rating: 4.6,
      completedJobs: 22,
      avatar: "https://randomuser.me/api/portraits/women/14.jpg",
    },
    tags: ["Analytics", "Data", "Visualization"],
  },
  {
    id: 15,
    title: "Layer 2 Development",
    description: "Build scalable Layer 2 solutions",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Daniel Brown",
      rating: 4.9,
      completedJobs: 47,
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    },
    tags: ["Layer 2", "Scaling", "Optimization"],
  },
  {
    id: 16,
    title: "Wallet Integration",
    description: "Integrate wallet connectivity in dApps",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Emma Wilson",
      rating: 4.7,
      completedJobs: 29,
      avatar: "https://randomuser.me/api/portraits/women/16.jpg",
    },
    tags: ["Wallet", "Web3", "Integration"],
  },
  {
    id: 17,
    title: "NFT Marketplace Development",
    description: "Create custom NFT marketplace platforms",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Jack Thompson",
      rating: 4.8,
      completedJobs: 36,
      avatar: "https://randomuser.me/api/portraits/men/17.jpg",
    },
    tags: ["NFT", "Marketplace", "Web3"],
  },
  {
    id: 18,
    title: "Smart Contract Testing",
    description: "Comprehensive testing for smart contracts",
    price: 500,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Linda Chen",
      rating: 4.6,
      completedJobs: 24,
      avatar: "https://randomuser.me/api/portraits/women/18.jpg",
    },
    tags: ["Testing", "Security", "Quality"],
  },
  {
    id: 19,
    title: "DeFi Yield Farming",
    description: "Develop yield farming and liquidity mining protocols",
    price: 750,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Mark Davis",
      rating: 4.8,
      completedJobs: 32,
      avatar: "https://randomuser.me/api/portraits/men/19.jpg",
    },
    tags: ["DeFi", "Yield Farming", "Liquidity"],
  },
  {
    id: 20,
    title: "Blockchain Identity Solutions",
    description: "Implement decentralized identity systems",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Rachel Kim",
      rating: 4.7,
      completedJobs: 28,
      avatar: "https://randomuser.me/api/portraits/women/20.jpg",
    },
    tags: ["Identity", "DID", "Privacy"],
  },
  {
    id: 21,
    title: "Gas Optimization",
    description: "Optimize smart contracts for gas efficiency",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Steve Johnson",
      rating: 4.9,
      completedJobs: 42,
      avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    },
    tags: ["Gas", "Optimization", "Solidity"],
  },
  {
    id: 22,
    title: "Blockchain Data Storage",
    description: "Implement decentralized storage solutions",
    price: 550,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Alice Wong",
      rating: 4.6,
      completedJobs: 21,
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    tags: ["Storage", "IPFS", "Decentralized"],
  },
  {
    id: 23,
    title: "Token Vesting",
    description: "Develop token vesting and distribution systems",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Peter Smith",
      rating: 4.7,
      completedJobs: 26,
      avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    },
    tags: ["Vesting", "Tokens", "Distribution"],
  },
  {
    id: 24,
    title: "Blockchain Oracles",
    description: "Implement oracle solutions for smart contracts",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Julia Martinez",
      rating: 4.8,
      completedJobs: 35,
      avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    },
    tags: ["Oracles", "ChainLink", "Integration"],
  },
  {
    id: 25,
    title: "Metaverse Development",
    description: "Create immersive metaverse experiences",
    price: 950,
    image:
      "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Mike Anderson",
      rating: 4.7,
      completedJobs: 23,
      avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    },
    tags: ["Metaverse", "3D", "VR"],
  },
  {
    id: 26,
    title: "Crypto Payment Integration",
    description: "Integrate cryptocurrency payment solutions",
    price: 500,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Sophie Lee",
      rating: 4.6,
      completedJobs: 20,
      avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    },
    tags: ["Payments", "Integration", "Crypto"],
  },
  {
    id: 27,
    title: "Zero Knowledge Proofs",
    description: "Implement ZK-proof systems and applications",
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "David Clark",
      rating: 4.9,
      completedJobs: 44,
      avatar: "https://randomuser.me/api/portraits/men/27.jpg",
    },
    tags: ["ZK-Proofs", "Privacy", "Cryptography"],
  },
  {
    id: 28,
    title: "Blockchain UI/UX Design",
    description: "Design user interfaces for blockchain applications",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Elena Rodriguez",
      rating: 4.8,
      completedJobs: 37,
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    tags: ["UI/UX", "Design", "Web3"],
  },
  {
    id: 29,
    title: "Blockchain Security",
    description: "Implement security measures for blockchain systems",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    freelancer: {
      name: "Thomas Wilson",
      rating: 4.9,
      completedJobs: 49,
      avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    },
    tags: ["Security", "Audit", "Blockchain"],
  },
  {
    id: 30,
    title: "Smart Contract Upgrades",
    description: "Implement upgradeable smart contract systems",
    price: 650,
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    freelancer: {
      name: "Hannah Park",
      rating: 4.7,
      completedJobs: 30,
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
    tags: ["Upgrades", "Proxy", "Solidity"],
  },
];

// Add user data for the header
const headerUserData = {
  name: "Alex Thompson",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
};

const Gigs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  GriffinLock.mon
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className="text-white/80 hover:text-white transition-colors uppercase font-medium"
                >
                  DASHBOARD
                </Link>
                <Link
                  to="/gigs"
                  className="text-white/80 hover:text-white transition-colors uppercase font-medium"
                >
                  GIGS
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/settings"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <img
                  src={headerUserData.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-600"
                />
                <span className="hidden md:inline font-medium">
                  {headerUserData.name}
                </span>
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search gigs..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGigs.map((gig) => (
            <Card
              key={gig.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors overflow-hidden group"
            >
              {/* Gig Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={gig.freelancer.avatar}
                    alt={gig.freelancer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-white">{gig.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{gig.freelancer.name}</span>
                      <span>•</span>
                      <span>⭐ {gig.freelancer.rating}</span>
                      <span>•</span>
                      <span>{gig.freelancer.completedJobs} jobs</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{gig.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {gig.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white flex items-center">
                    <MonadLogo />
                    {gig.price} MON
                  </span>
                  <Link to={`/gigs/${gig.id}`}>
                    <Button
                      variant="default"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gigs;
