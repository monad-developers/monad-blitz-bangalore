"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  StarIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address, AddressInput } from "~~/components/scaffold-eth";

// Navigation component
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full max-w-[1920px] mx-auto flex items-center justify-between py-4 lg:py-6 2xl:py-8 px-4 sm:px-6 lg:px-8 2xl:px-16 mt-2 sm:mt-4 2xl:mt-6 bg-white/5 backdrop-blur-md rounded-xl lg:rounded-2xl border border-green-900/30 shadow-lg">
      <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4">
        <a href="/" className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-emerald-300 tracking-tight hover:text-emerald-200 transition-colors">
          GreenGrid
        </a>
        <div className="hidden sm:block text-emerald-400/60 text-lg">•</div>
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Neighborhood Registration</span>
      </div>

      <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-12">
        <a href="/households/register" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Household
        </a>
        <a href="/clean/log" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Cleaner
        </a>
        <a href="/neighborhoods/register" className="text-emerald-200 text-base 2xl:text-lg font-medium">
          Neighborhoods
        </a>
        <a href="/validate" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Validator
        </a>
      </div>

      <div className="hidden lg:block">
        <ConnectButton />
      </div>

      <button 
        className="lg:hidden p-2 text-emerald-300 hover:text-emerald-200 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-black/90 backdrop-blur-md rounded-xl border border-green-900/30 shadow-lg lg:hidden z-50">
          <div className="flex flex-col p-4 space-y-4">
            <a href="/households/register" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Household
            </a>
            <a href="/clean/log" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Cleaner
            </a>
            <a href="/neighborhoods/register" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Neighborhoods
            </a>
            <a href="/validate" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Validator
            </a>
            <div className="mt-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Main Neighborhood Registration Card Component
const NeighborhoodRegistrationCard = () => {
  const { address } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [description, setDescription] = useState("");
  const [adminAddress, setAdminAddress] = useState("");

  const { writeContractAsync: writeCleanChain } = useScaffoldWriteContract({
    contractName: "CleanChain",
  });

  // Get all neighborhoods
  const { data: neighborhoods } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getAllNeighborhoods",
  });

  // Contract status
  const { data: isPaused } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isPaused",
  });

  const handleRegister = async () => {
    if (!address || !neighborhoodName || !description || !adminAddress) return;
    
    setIsRegistering(true);
    try {
      await writeCleanChain({
        functionName: "registerNeighborhood",
        args: [neighborhoodName, description, adminAddress],
      });
      // Reset form on success
      setNeighborhoodName("");
      setDescription("");
      setAdminAddress("");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-green-900/30 p-6 sm:p-8 lg:p-10 text-center">
          <BuildingOfficeIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Neighborhood Registration
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Register new neighborhoods in the GreenGrid network. Assign administrators to manage local garbage collection activities.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Contract Paused Warning */}
          {isPaused && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 lg:p-6 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-300 font-medium mb-2">Contract Paused</h4>
                  <p className="text-red-200/80 text-sm lg:text-base">
                    The CleanChain contract is currently paused. Registration is temporarily unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Neighborhoods */}
          {neighborhoods && neighborhoods.length > 0 && (
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6 mb-6">
              <h4 className="text-emerald-200 font-medium mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                Existing Neighborhoods ({neighborhoods.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {neighborhoods.map((neighborhood: string, index: number) => (
                  <div key={index} className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-3 py-2">
                    <span className="text-emerald-200 text-sm font-medium">{neighborhood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="space-y-6 lg:space-y-8">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
                <h4 className="text-emerald-200 font-medium mb-3 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  Neighborhood Benefits
                </h4>
                <ul className="text-emerald-100/70 text-sm lg:text-base space-y-2">
                  <li>• Organize local garbage collection</li>
                  <li>• Track community cleanliness metrics</li>
                  <li>• Assign and manage cleaners</li>
                  <li>• Build community engagement</li>
                </ul>
              </div>

              <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
                <h4 className="text-emerald-200 font-medium mb-3 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-green-400" />
                  Admin Responsibilities
                </h4>
                <ul className="text-emerald-100/70 text-sm lg:text-base space-y-2">
                  <li>• Authorize cleaners in neighborhood</li>
                  <li>• Monitor collection activities</li>
                  <li>• Manage neighborhood status</li>
                  <li>• Support community initiatives</li>
                </ul>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
              <h4 className="text-emerald-200 font-medium mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                Registration Details
              </h4>
              
              <div className="space-y-4">
                {/* Neighborhood Name */}
                <div>
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Neighborhood Name *
                  </label>
                  <input
                    type="text"
                    value={neighborhoodName}
                    onChange={(e) => setNeighborhoodName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 focus:border-emerald-400 focus:outline-none"
                    placeholder="Enter neighborhood name (e.g., Downtown District, Green Valley)"
                  />
                  <p className="text-emerald-100/60 text-xs mt-1">Choose a unique, descriptive name for the neighborhood</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 focus:border-emerald-400 focus:outline-none resize-none"
                    placeholder="Describe the neighborhood area, boundaries, and characteristics..."
                  />
                  <p className="text-emerald-100/60 text-xs mt-1">Provide details about the neighborhood's location and scope</p>
                </div>

                {/* Admin Address */}
                <div>
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Administrator Address *
                  </label>
                  <AddressInput
                    value={adminAddress}
                    onChange={setAdminAddress}
                    placeholder="0x... (Ethereum address of the neighborhood admin)"
                  />
                  <p className="text-emerald-100/60 text-xs mt-1">Address of the person who will manage this neighborhood</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 lg:p-6">
              <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Requirements
              </h4>
              <ul className="text-blue-200/80 text-sm lg:text-base space-y-2">
                <li>• Unique neighborhood name</li>
                <li>• Valid description of the area</li>
                <li>• Valid Ethereum address for admin</li>
                <li>• Contract must not be paused</li>
              </ul>
            </div>

            {/* Registration Button */}
            <div className="text-center">
              <button
                onClick={handleRegister}
                disabled={
                  isRegistering || 
                  isPaused || 
                  !address || 
                  !neighborhoodName || 
                  !description || 
                  !adminAddress
                }
                className="w-full max-w-md mx-auto px-8 py-4 lg:py-5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-base lg:text-lg"
              >
                {isRegistering ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <BuildingOfficeIcon className="w-6 h-6" />
                    Register Neighborhood
                  </>
                )}
              </button>
              
              {!isPaused && neighborhoodName && description && adminAddress && (
                <p className="text-emerald-100/60 text-sm mt-3">
                  This will create a new neighborhood and assign the specified admin with management permissions.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/neighborhoods/view" 
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
            >
              <MapPinIcon className="w-5 h-5" />
              View All Neighborhoods
            </a>
            <a 
              href="/neighborhoods/manage" 
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
            >
              <ShieldCheckIcon className="w-5 h-5" />
              Manage Neighborhoods
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function NeighborhoodRegistrationPage() {
  const { isConnected } = useAccount();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden" style={{ background: "#000" }}>
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-20%] top-[-10%] w-[60vw] h-[60vw] bg-green-700/20 rounded-full blur-[120px]" />
        <div className="absolute right-[-15%] top-[30%] w-[50vw] h-[40vw] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute left-[30%] bottom-[-20%] w-[40vw] h-[30vw] bg-green-400/10 rounded-full blur-[90px]" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 2xl:px-16 py-8 lg:py-12 flex-1 flex items-center justify-center">
        {!isConnected ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl p-8 lg:p-12 backdrop-blur-md">
              <BuildingOfficeIcon className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-emerald-100 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-emerald-100/70 mb-6 text-base lg:text-lg">
                Please connect your wallet to register neighborhoods.
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <NeighborhoodRegistrationCard />
        )}
      </main>
    </div>
  );
} 