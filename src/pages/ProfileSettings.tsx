import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Camera,
  Mail,
  Globe,
  MapPin,
  Save,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/WalletButton";

const ProfileSettings = () => {
  const [skills, setSkills] = React.useState([
    "Smart Contracts",
    "Solidity",
    "Web3.js",
    "DeFi",
    "NFTs",
    "React",
    "TypeScript",
    "Hardhat",
  ]);
  const [newSkill, setNewSkill] = React.useState("");

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

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
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-600"
                />
                <span className="hidden md:inline font-medium">
                  Alex Thompson
                </span>
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {/* Profile Picture Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-purple-600"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-700"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-2">
                    Recommended: Square image, at least 400x400 pixels
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <Input
                    defaultValue="Alex Thompson"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <Input
                    defaultValue="alexdev"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      defaultValue="alex@griffinlock.mon"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30">
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Location
                  </label>
                  <Input
                    defaultValue="San Francisco, CA"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Website
                </label>
                <Input
                  defaultValue="https://alexthompson.dev"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bio</label>
                <Textarea
                  defaultValue="Senior blockchain developer with 5+ years of experience in smart contract development and DeFi protocols. Specialized in Solidity and Web3 development."
                  className="bg-white/5 border-white/10 text-white h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 pl-3 flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addSkill();
                    }
                  }}
                />
                <Button
                  onClick={addSkill}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    GitHub
                  </label>
                  <Input
                    defaultValue="github.com/alexthompson"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Twitter
                  </label>
                  <Input
                    defaultValue="twitter.com/alexdev"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    LinkedIn
                  </label>
                  <Input
                    defaultValue="linkedin.com/in/alexthompson"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Discord
                  </label>
                  <Input
                    defaultValue="alexdev#1234"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
