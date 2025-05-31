import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Shield, Star, Clock, DollarSign, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WalletButton } from "@/components/WalletButton";

// Add user data for the header
const headerUserData = {
  name: "Alex Thompson",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
};

// Common image sets for different categories
const IMAGES = {
  smartContract: [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
  ],
  frontend: [
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
  ],
  blockchain: [
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
  ],
  defi: [
    "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
  ],
  nft: [
    "https://images.unsplash.com/photo-1646153976497-607dc48bcfbc?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2940&auto=format&fit=crop",
  ],
};

// Reusable freelancer profiles
const FREELANCERS = {
  expert: {
    name: "Alex Thompson",
    rating: 4.9,
    completedJobs: 45,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    memberSince: "Jan 2022",
    responseTime: "~2 hours",
    lastDelivery: "1 day ago",
    description:
      "Blockchain developer with 5+ years of experience in smart contract development and DeFi protocols. Specialized in Solidity and Web3 development.",
  },
  intermediate: {
    name: "Sarah Chen",
    rating: 4.7,
    completedJobs: 28,
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    memberSince: "Mar 2022",
    responseTime: "~3 hours",
    lastDelivery: "2 days ago",
    description:
      "Frontend developer specializing in Web3 applications. Experienced in React, TypeScript, and blockchain integration.",
  },
  senior: {
    name: "Michael Rodriguez",
    rating: 4.8,
    completedJobs: 38,
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    memberSince: "Dec 2021",
    responseTime: "~1 hour",
    lastDelivery: "1 day ago",
    description:
      "Senior blockchain architect with expertise in DeFi protocols, cross-chain bridges, and smart contract security.",
  },
};

// Mock data for all gigs
const mockGigDetails = {
  1: {
    title: "Smart Contract Development",
    description:
      "Expert smart contract development for DeFi applications with a focus on security and efficiency. Our service includes:\n\n- Custom smart contract development\n- Security auditing and optimization\n- Integration with existing DeFi protocols\n- Comprehensive documentation\n- Post-deployment support\n\nWith years of experience in blockchain development, we ensure your smart contracts are secure, efficient, and meet your specific requirements.",
    price: 500,
    deliveryTime: "5-7 days",
    revisions: 2,
    images: IMAGES.smartContract,
    freelancer: FREELANCERS.expert,
    tags: ["Smart Contracts", "Solidity", "DeFi"],
  },
  2: {
    title: "Web3 Frontend Development",
    description:
      "Professional Web3 frontend development with modern UI/UX. Services include:\n\n- Responsive Web3 interface development\n- Wallet integration\n- DApp frontend architecture\n- Performance optimization\n- Cross-browser compatibility\n\nCreating intuitive and performant interfaces for blockchain applications.",
    price: 300,
    deliveryTime: "3-5 days",
    revisions: 3,
    images: IMAGES.frontend,
    freelancer: FREELANCERS.intermediate,
    tags: ["React", "Web3.js", "UI/UX"],
  },
  3: {
    title: "Blockchain Consulting",
    description:
      "Strategic blockchain consulting for your project. Our consultation covers:\n\n- Architecture planning\n- Technology stack selection\n- Security best practices\n- Scalability solutions\n- Regulatory compliance\n\nLeverage our expertise to make informed decisions for your blockchain project.",
    price: 800,
    deliveryTime: "7-10 days",
    revisions: 4,
    images: IMAGES.blockchain,
    freelancer: FREELANCERS.senior,
    tags: ["Consulting", "Strategy", "Blockchain"],
  },
  4: {
    title: "NFT Collection Development",
    description:
      "Complete NFT collection development service. Package includes:\n\n- Smart contract development\n- Metadata generation\n- IPFS integration\n- Minting website\n- Collection management tools\n\nCreate and launch your NFT collection with professional support.",
    price: 600,
    deliveryTime: "7-14 days",
    revisions: 3,
    images: IMAGES.nft,
    freelancer: FREELANCERS.expert,
    tags: ["NFT", "ERC721", "Digital Art"],
  },
  5: {
    title: "DeFi Protocol Development",
    description:
      "Custom DeFi protocol development with security focus. Service includes:\n\n- Protocol architecture design\n- Smart contract development\n- Security implementation\n- Testing and auditing\n- Documentation\n\nBuild secure and efficient DeFi protocols for your platform.",
    price: 1200,
    deliveryTime: "14-21 days",
    revisions: 4,
    images: IMAGES.defi,
    freelancer: FREELANCERS.senior,
    tags: ["DeFi", "Protocol", "Smart Contracts"],
  },
};

// Add Monad logo SVG component
const MonadLogo = () => (
  <svg
    width="24"
    height="24"
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

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const gig = mockGigDetails[Number(id)];
  const [selectedImage, setSelectedImage] = React.useState(0);

  const handleContinue = () => {
    navigate(`/payment/${id}`, { state: { gig } });
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-6">
          <CardContent>
            <h2 className="text-2xl font-bold text-white mb-4">
              Gig Not Found
            </h2>
            <p className="text-gray-300 mb-6">
              The gig you're looking for doesn't exist.
            </p>
            <Link to="/gigs">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Browse All Gigs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/gigs"
          className="inline-flex items-center text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gigs
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
                <img
                  src={gig.images[selectedImage]}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {gig.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? "ring-2 ring-purple-500"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${gig.title} preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  About This Gig
                </h2>
                <p className="text-gray-300 whitespace-pre-line">
                  {gig.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing and Freelancer Info */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="sticky top-6 z-20 space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Price</h3>
                    <span className="text-2xl font-bold text-white flex items-center">
                      <MonadLogo />
                      {gig.price} MON
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Delivery Time: {gig.deliveryTime}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <ArrowLeft className="w-5 h-5 mr-2 rotate-180" />
                      <span>Revisions: {gig.revisions}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>

              {/* Freelancer Card */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={gig.freelancer.avatar}
                      alt={gig.freelancer.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {gig.freelancer.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{gig.freelancer.rating}</span>
                        <span>•</span>
                        <span>{gig.freelancer.completedJobs} jobs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-gray-300">
                    <p>{gig.freelancer.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Member since</p>
                        <p>{gig.freelancer.memberSince}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Response time</p>
                        <p>{gig.freelancer.responseTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last delivery</p>
                        <p>{gig.freelancer.lastDelivery}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Contact Freelancer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
