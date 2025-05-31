"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
  CameraIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

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
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Cleaner Registration</span>
      </div>

      <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-12">
        <a href="/house" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Household
        </a>
        <a href="/clean/log" className="text-emerald-200 text-base 2xl:text-lg font-medium">
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
            <a href="/clean/log" className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2">
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

// Main Cleaner Registration Card Component
const CleanerRegistrationCard = () => {
  const { address } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);

  const { writeContractAsync: writeCleanChain } = useScaffoldWriteContract({
    contractName: "CleanChain",
  });

  // Check if user is already registered as cleaner
  const { data: isRegisteredCleaner } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isRegisteredCleaner",
    args: [address],
  });

  // Check if user is registered as house (can't be both)
  const { data: isRegisteredHouse } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isRegisteredHouse",
    args: [address],
  });

  // Get cleaner data if already registered
  const { data: cleanerData } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getCleaner",
    args: [address],
    query: {
      enabled: isRegisteredCleaner,
    },
  });

  // Contract status
  const { data: isPaused } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isPaused",
  });

  const handleRegister = async () => {
    if (!address) return;
    
    setIsRegistering(true);
    try {
      await writeCleanChain({
        functionName: "registerCleaner",
      });
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
          <UserGroupIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Cleaner Registration
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Join the GreenGrid network as a cleaner and start earning points for your garbage collection services. Help keep neighborhoods clean and earn rewards.
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

          {/* Already Registered as House Warning */}
          {isRegisteredHouse && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 lg:p-6 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-medium mb-2">Already Registered as House</h4>
                  <p className="text-yellow-200/80 text-sm lg:text-base">
                    This address is already registered as a house. You cannot register as both a house and a cleaner with the same address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Already Registered Success */}
          {isRegisteredCleaner && cleanerData ? (
            <div className="space-y-6 lg:space-y-8">
              <div className="text-center py-8 lg:py-12">
                <CheckCircleIcon className="w-16 h-16 lg:w-20 lg:h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl lg:text-2xl font-bold text-green-300 mb-4">
                  Registration Complete!
                </h3>
                <p className="text-green-200/80 mb-6 text-base lg:text-lg">
                  You are successfully registered as a cleaner in the GreenGrid network.
                </p>
              </div>

              {/* Cleaner Stats */}
              <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
                <h4 className="text-emerald-200 font-medium mb-4 flex items-center gap-2">
                  <StarIcon className="w-5 h-5" />
                  Your Cleaner Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-emerald-200">{cleanerData.points?.toString()}</div>
                    <div className="text-emerald-100/60 text-sm">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-emerald-200">{cleanerData.reputation?.toString()}</div>
                    <div className="text-emerald-100/60 text-sm">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-emerald-200">{cleanerData.assignedNeighborhoods?.length || 0}</div>
                    <div className="text-emerald-100/60 text-sm">Neighborhoods</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-900/30">
                  <div className="flex items-center gap-2 text-emerald-100/70 text-sm">
                    <span>Wallet Address:</span>
                    <Address address={cleanerData.wallet} />
                  </div>
                  <div className="flex items-center gap-2 text-emerald-100/70 text-sm mt-2">
                    <span>Registration Date:</span>
                    <span>{new Date(Number(cleanerData.registrationTimestamp) * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4 lg:p-6">
                <h4 className="text-emerald-300 font-medium mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  What's Next?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div>
                      <h5 className="text-emerald-200 font-medium">Get Neighborhood Authorization</h5>
                      <p className="text-emerald-100/70 text-sm">Contact neighborhood admins to get assigned to areas where you can collect garbage.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div>
                      <h5 className="text-emerald-200 font-medium">Start Logging Collections</h5>
                      <p className="text-emerald-100/70 text-sm">Begin recording your garbage collection activities with photo proof to earn points.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div>
                      <h5 className="text-emerald-200 font-medium">Build Your Reputation</h5>
                      <p className="text-emerald-100/70 text-sm">Maintain high confirmation rates to increase your reputation and unlock new opportunities.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href="/clean" 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  Go to Dashboard
                </a>
                <a 
                  href="/clean/log" 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
                >
                  <CameraIcon className="w-5 h-5" />
                  Log Collection
                </a>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="space-y-6 lg:space-y-8">
              {/* Benefits Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
                  <h4 className="text-emerald-200 font-medium mb-3 flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    Earn Points & Reputation
                  </h4>
                  <ul className="text-emerald-100/70 text-sm lg:text-base space-y-2">
                    <li>• 10 points for registration</li>
                    <li>• 20 points per garbage collection</li>
                    <li>• 10 bonus points for confirmations</li>
                    <li>• Build reputation for more opportunities</li>
                  </ul>
                </div>

                <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
                  <h4 className="text-emerald-200 font-medium mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    Network Benefits
                  </h4>
                  <ul className="text-emerald-100/70 text-sm lg:text-base space-y-2">
                    <li>• Access to multiple neighborhoods</li>
                    <li>• Transparent tracking system</li>
                    <li>• Decentralized verification</li>
                    <li>• Community recognition</li>
                  </ul>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 lg:p-6">
                <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Requirements
                </h4>
                <ul className="text-blue-200/80 text-sm lg:text-base space-y-2">
                  <li>• Connected wallet with valid address</li>
                  <li>• Not registered as a house on the same address</li>
                  <li>• Contract must not be paused</li>
                  <li>• Commitment to follow collection protocols</li>
                </ul>
              </div>

              {/* Registration Button */}
              <div className="text-center">
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || isPaused || isRegisteredHouse || !address}
                  className="w-full max-w-md mx-auto px-8 py-4 lg:py-5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-base lg:text-lg"
                >
                  {isRegistering ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserGroupIcon className="w-6 h-6" />
                      Register as Cleaner
                    </>
                  )}
                </button>
                
                {address && !isPaused && !isRegisteredHouse && (
                  <p className="text-emerald-100/60 text-sm mt-3">
                    By registering, you agree to follow GreenGrid collection protocols and maintain honest reporting.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function CleanerRegistrationPage() {
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
                Please connect your wallet to register as a cleaner.
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <CleanerRegistrationCard />
        )}
      </main>
    </div>
  );
} 