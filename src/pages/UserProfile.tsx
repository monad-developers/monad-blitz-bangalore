import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Star,
  Clock,
  MapPin,
  Globe,
  Mail,
  Calendar,
  Briefcase,
  Award,
  Code,
  CheckCircle,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Mock user data
const userData = {
  name: "Alex Thompson",
  title: "Senior Blockchain Developer",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  location: "San Francisco, CA",
  website: "https://alexthompson.dev",
  email: "alex@griffinlock.mon",
  memberSince: "January 2022",
  completedJobs: 45,
  rating: 4.9,
  totalEarned: "25,000",
  skills: [
    "Smart Contracts",
    "Solidity",
    "Web3.js",
    "DeFi",
    "NFTs",
    "React",
    "TypeScript",
    "Hardhat",
  ],
  languages: ["English", "Spanish"],
  certifications: [
    "Certified Blockchain Developer",
    "Ethereum Smart Contract Security",
    "DeFi Protocol Architecture",
  ],
  recentWork: [
    {
      id: 1,
      title: "DeFi Lending Protocol",
      description:
        "Developed a decentralized lending protocol with automated interest rates and liquidation mechanisms.",
      client: "DeFi Labs",
      rating: 5.0,
      review:
        "Alex delivered exceptional work. The smart contracts were well-documented and passed all security audits.",
    },
    {
      id: 2,
      title: "NFT Marketplace",
      description:
        "Built a full-featured NFT marketplace with lazy minting and royalty support.",
      client: "CryptoArts Inc",
      rating: 4.8,
      review:
        "Great communication and technical expertise. Delivered the project ahead of schedule.",
    },
    {
      id: 3,
      title: "Cross-chain Bridge",
      description:
        "Implemented a secure cross-chain bridge for token transfers between multiple blockchains.",
      client: "Bridge Protocol",
      rating: 5.0,
      review:
        "Outstanding work on a complex project. Alex's expertise in blockchain security was invaluable.",
    },
  ],
};

const UserProfile = () => {
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
                to="/profile"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <img
                  src={userData.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-600"
                />
                <span className="hidden md:inline font-medium">
                  {userData.name}
                </span>
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full border-4 border-purple-600"
                  />
                  <h2 className="text-2xl font-bold text-white mt-4">
                    {userData.name}
                  </h2>
                  <p className="text-gray-400">{userData.title}</p>
                  <div className="flex items-center mt-2 text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-white">{userData.rating}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-4 text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {userData.location}
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <a
                        href={userData.website}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {userData.website}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {userData.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {userData.memberSince}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userData.completedJobs}
                    </div>
                    <div className="text-gray-400">Jobs Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white flex items-center justify-center">
                      <MonadLogo />
                      {userData.totalEarned} MON
                    </div>
                    <div className="text-gray-400">MON Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages & Certifications */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Languages & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {userData.languages.map((language) => (
                        <Badge
                          key={language}
                          variant="secondary"
                          className="bg-purple-600/20 text-purple-300"
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">
                      Certifications
                    </h4>
                    <ul className="space-y-2">
                      {userData.certifications.map((cert) => (
                        <li
                          key={cert}
                          className="flex items-center text-gray-300"
                        >
                          <Award className="w-4 h-4 mr-2 text-purple-400" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Work */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Work</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {userData.recentWork.map((work) => (
                    <div
                      key={work.id}
                      className="border-b border-white/10 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {work.title}
                          </h3>
                          <p className="text-gray-400">Client: {work.client}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="ml-1 text-white">{work.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{work.description}</p>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1 mr-2" />
                          <p className="text-gray-300 italic">
                            "{work.review}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Gig Button */}
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg">
              <Briefcase className="w-5 h-5 mr-2" />
              Create a New Gig
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
