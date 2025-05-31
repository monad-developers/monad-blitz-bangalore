"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  UserGroupIcon,
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
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Log Collection</span>
      </div>

      <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-12">
        <a href="/house" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Household
        </a>
        <a href="/clean" className="text-emerald-200 text-base 2xl:text-lg font-medium">
          Cleaner
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
            <a href="/house" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Household
            </a>
            <a href="/clean" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
              Cleaner
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

// Main Log Collection Card Component
const LogCollectionCard = () => {
  const { address } = useAccount();
  const [houseAddress, setHouseAddress] = useState("");
  const [imageHash, setImageHash] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const { writeContractAsync: writeCleanChain } = useScaffoldWriteContract({
    contractName: "CleanChain",
  });

  // Check if user is registered as cleaner
  const { data: isRegisteredCleaner } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isRegisteredCleaner",
    args: [address],
  });

  // Check if house is registered
  const { data: isHouseRegistered } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isRegisteredHouse",
    args: [houseAddress as `0x${string}`],
    query: {
      enabled: !!houseAddress && houseAddress.length === 42,
    },
  });

  // Get house data for additional info
  const { data: houseData } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getHouse",
    args: [houseAddress as `0x${string}`],
    query: {
      enabled: !!houseAddress && houseAddress.length === 42 && isHouseRegistered,
    },
  });

  // Check if cleaner is authorized in house neighborhood
  const { data: isAuthorized } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isCleanerAuthorized",
    args: [address, houseData?.neighborhood || ""],
    query: {
      enabled: !!houseData?.neighborhood && isRegisteredCleaner,
    },
  });

  const handleLogCollection = async () => {
    if (!address || !houseAddress || !imageHash || !imageURI) return;

    setIsLogging(true);
    try {
      // Convert string to bytes32 for imageHash
      const hashBytes32 = imageHash.startsWith('0x') ? imageHash : `0x${imageHash}`;
      
      await writeCleanChain({
        functionName: "logGarbageCollection",
        args: [houseAddress as `0x${string}`, hashBytes32 as `0x${string}`, imageURI],
      });
      
      // Reset form
      setHouseAddress("");
      setImageHash("");
      setImageURI("");
    } catch (error) {
      console.error("Failed to log collection:", error);
    } finally {
      setIsLogging(false);
    }
  };

  const isFormValid = houseAddress && imageHash && imageURI && isHouseRegistered && isAuthorized;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-green-900/30 p-6 sm:p-8 lg:p-10 text-center">
          <CameraIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Log Garbage Collection
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Record your garbage collection with cryptographic proof. Ensure the house is registered and you have authorization for the neighborhood.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10">
          {!isRegisteredCleaner ? (
            <div className="text-center py-8 lg:py-12">
              <UserGroupIcon className="w-16 h-16 lg:w-20 lg:h-20 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold text-red-300 mb-4">
                Not Registered as Cleaner
              </h3>
              <p className="text-red-200/80 mb-6 text-base lg:text-lg">
                You must be registered as a cleaner to log garbage collection events.
              </p>
              <a 
                href="/clean/register" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 hover:scale-105 transition-all duration-300"
              >
                <UserGroupIcon className="w-5 h-5" />
                Go to Cleaner Registration
              </a>
            </div>
          ) : (
            <div className="space-y-6 lg:space-y-8">
              {/* House Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <HomeIcon className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg lg:text-xl font-semibold text-emerald-100">House Information</h3>
                </div>
                
                <div>
                  <label className="block text-emerald-100/80 text-sm lg:text-base font-medium mb-3">
                    House Wallet Address
                  </label>
                  <AddressInput
                    value={houseAddress}
                    onChange={setHouseAddress}
                    placeholder="Enter the house wallet address"
                  />
                </div>

                {/* House Status Display */}
                {houseAddress && houseAddress.length === 42 && (
                  <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6 space-y-4">
                    {/* Registration Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100/70 text-sm lg:text-base">Registration Status:</span>
                      {isHouseRegistered ? (
                        <div className="flex items-center gap-2 text-green-300">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium">Registered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-300">
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          <span className="font-medium">Not Registered</span>
                        </div>
                      )}
                    </div>

                    {/* House Details */}
                    {houseData && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-100/70 text-sm lg:text-base">Neighborhood:</span>
                          <span className="text-emerald-200 font-medium">{houseData.neighborhood}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-100/70 text-sm lg:text-base">Residents:</span>
                          <span className="text-emerald-200 font-medium">{houseData.residents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-100/70 text-sm lg:text-base">House Points:</span>
                          <span className="text-emerald-200 font-medium">{houseData.points?.toString()}</span>
                        </div>

                        {/* Authorization Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-green-900/30">
                          <span className="text-emerald-100/70 text-sm lg:text-base">Your Authorization:</span>
                          {isAuthorized ? (
                            <div className="flex items-center gap-2 text-green-300">
                              <ShieldCheckIcon className="w-5 h-5" />
                              <span className="font-medium">Authorized</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-300">
                              <ExclamationTriangleIcon className="w-5 h-5" />
                              <span className="font-medium">Not Authorized</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Image Proof Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <CameraIcon className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg lg:text-xl font-semibold text-emerald-100">Proof of Collection</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-emerald-100/80 text-sm lg:text-base font-medium mb-3">
                      Image Hash
                    </label>
                    <input
                      type="text"
                      value={imageHash}
                      onChange={(e) => setImageHash(e.target.value)}
                      placeholder="Enter cryptographic hash of the image"
                      className="w-full px-4 py-3 lg:py-4 bg-black/20 border border-green-900/30 rounded-lg text-emerald-100 placeholder-emerald-100/50 focus:border-emerald-400 focus:outline-none transition-colors text-sm lg:text-base"
                    />
                    <p className="text-emerald-100/50 text-xs lg:text-sm mt-2">
                      SHA-256, IPFS hash, or other cryptographic proof
                    </p>
                  </div>

                  <div>
                    <label className="block text-emerald-100/80 text-sm lg:text-base font-medium mb-3">
                      Image URI
                    </label>
                    <input
                      type="text"
                      value={imageURI}
                      onChange={(e) => setImageURI(e.target.value)}
                      placeholder="Enter IPFS URI or image URL"
                      className="w-full px-4 py-3 lg:py-4 bg-black/20 border border-green-900/30 rounded-lg text-emerald-100 placeholder-emerald-100/50 focus:border-emerald-400 focus:outline-none transition-colors text-sm lg:text-base"
                    />
                    <p className="text-emerald-100/50 text-xs lg:text-sm mt-2">
                      IPFS, Arweave, or other decentralized storage link
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {houseAddress && houseAddress.length === 42 && !isFormValid && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 lg:p-6">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-medium mb-2">Requirements Not Met</h4>
                      <ul className="text-yellow-200/80 text-sm lg:text-base space-y-1">
                        {!isHouseRegistered && <li>• House must be registered in the system</li>}
                        {!isAuthorized && <li>• You must be authorized in this neighborhood</li>}
                        {!imageHash && <li>• Image hash is required for proof</li>}
                        {!imageURI && <li>• Image URI is required for storage link</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 lg:pt-6">
                <button
                  onClick={handleLogCollection}
                  disabled={isLogging || !isFormValid}
                  className="w-full px-6 py-4 lg:py-5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-base lg:text-lg"
                >
                  {isLogging ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Logging Collection...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="w-6 h-6" />
                      Log Collection Event
                    </>
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4 lg:p-6">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-emerald-300 font-medium mb-2">Best Practices</h4>
                    <ul className="text-emerald-200/80 text-sm lg:text-base space-y-1">
                      <li>• Take clear photos showing the collected garbage</li>
                      <li>• Use IPFS or Arweave for decentralized image storage</li>
                      <li>• Ensure you have proper authorization before collecting</li>
                      <li>• Wait for house confirmation to earn full points</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function LogCollectionPage() {
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
              <UserGroupIcon className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-emerald-100 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-emerald-100/70 mb-6 text-base lg:text-lg">
                Please connect your wallet to log garbage collection events.
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <LogCollectionCard />
        )}
      </main>
    </div>
  );
} 