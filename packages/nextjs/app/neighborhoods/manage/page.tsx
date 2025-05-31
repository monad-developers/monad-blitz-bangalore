"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
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
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Neighborhood Management</span>
      </div>

      <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-12">
        <a href="/households/register" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Household
        </a>
        <a href="/clean/register" className="text-emerald-200 text-base 2xl:text-lg font-medium">
          Cleaner
        </a>
        <a href="/neighborhoods/register" className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors">
          Neighborhood
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

// Neighborhood Details Hook
const useNeighborhoodDetails = (neighborhoodName: string) => {
  const { data: neighborhoodDetails } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getNeighborhood",
    args: [neighborhoodName],
  });

  const { data: cleaners } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getCleanersInNeighborhood",
    args: [neighborhoodName],
  });

  const { data: houses } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getHousesInNeighborhood",
    args: [neighborhoodName],
  });

  return {
    details: neighborhoodDetails,
    cleaners,
    houses,
  };
};

// Neighborhood Management Component
const NeighborhoodItem = ({ 
  neighborhoodName, 
  isAdmin, 
  onAssignCleaner, 
  onRemoveCleaner, 
  onToggleStatus 
}: { 
  neighborhoodName: string,
  isAdmin: boolean,
  onAssignCleaner: (neighborhood: string, cleaner: string) => Promise<void>,
  onRemoveCleaner: (neighborhood: string, cleaner: string) => Promise<void>,
  onToggleStatus: (neighborhood: string, isActive: boolean) => Promise<void>
}) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newCleanerAddress, setNewCleanerAddress] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState("");
  const [isToggling, setIsToggling] = useState(false);

  // Get neighborhood details
  const { details: neighborhood, cleaners, houses } = useNeighborhoodDetails(neighborhoodName);

  const handleAssignCleaner = async () => {
    if (!newCleanerAddress) return;
    
    setIsAssigning(true);
    try {
      await onAssignCleaner(neighborhoodName, newCleanerAddress);
      setNewCleanerAddress("");
      setShowAssignForm(false);
    } catch (error) {
      console.error("Failed to assign cleaner:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveCleaner = async (cleanerAddress: string) => {
    setIsRemoving(cleanerAddress);
    try {
      await onRemoveCleaner(neighborhoodName, cleanerAddress);
    } catch (error) {
      console.error("Failed to remove cleaner:", error);
    } finally {
      setIsRemoving("");
    }
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(neighborhoodName, !neighborhood?.isActive);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Show loading state if neighborhood details aren't loaded yet
  if (!neighborhood) {
    return (
      <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-emerald-500/20 rounded mb-4"></div>
          <div className="h-4 bg-emerald-500/10 rounded mb-2"></div>
          <div className="h-4 bg-emerald-500/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-emerald-200">{neighborhoodName}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              neighborhood.isActive 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {neighborhood.isActive ? (
                <>
                  <CheckCircleIcon className="w-3 h-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircleIcon className="w-3 h-3" />
                  Inactive
                </>
              )}
            </div>
          </div>
          <p className="text-emerald-100/70 text-sm mb-3">{neighborhood.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-200">{houses?.length || 0}</div>
              <div className="text-emerald-100/60">Houses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-200">{cleaners?.length || 0}</div>
              <div className="text-emerald-100/60">Cleaners</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-200">{neighborhood.totalCollections || 0}</div>
              <div className="text-emerald-100/60">Collections</div>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                neighborhood.isActive
                  ? 'bg-red-600/20 border border-red-400/30 text-red-200 hover:bg-red-600/30'
                  : 'bg-green-600/20 border border-green-400/30 text-green-200 hover:bg-green-600/30'
              }`}
            >
              {isToggling ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                neighborhood.isActive ? 'Deactivate' : 'Activate'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Admin Info */}
      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-emerald-100/70">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Admin:</span>
          <Address address={neighborhood.admin} />
        </div>
      </div>

      {/* Cleaners Management */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-emerald-200 font-medium">Assigned Cleaners</h4>
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
            >
              <UserPlusIcon className="w-4 h-4" />
              Assign Cleaner
            </button>
          </div>

          {/* Assign Cleaner Form */}
          {showAssignForm && (
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4">
              <h5 className="text-emerald-300 font-medium mb-3">Assign New Cleaner</h5>
              <div className="space-y-3">
                <AddressInput
                  value={newCleanerAddress}
                  onChange={setNewCleanerAddress}
                  placeholder="0x... (Cleaner's address)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAssignCleaner}
                    disabled={isAssigning || !newCleanerAddress}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isAssigning ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="w-4 h-4" />
                        Assign
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAssignForm(false)}
                    className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cleaners List */}
          {cleaners && cleaners.length > 0 ? (
            <div className="space-y-2">
              {cleaners.map((cleanerAddress: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/40 border border-green-900/30 rounded-lg">
                  <Address address={cleanerAddress} />
                  <button
                    onClick={() => handleRemoveCleaner(cleanerAddress)}
                    disabled={isRemoving === cleanerAddress}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-400/30 text-red-200 text-sm font-medium rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-colors"
                  >
                    {isRemoving === cleanerAddress ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserMinusIcon className="w-4 h-4" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-emerald-100/60">
              <UserGroupIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cleaners assigned to this neighborhood yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Management Card Component
const NeighborhoodManagementCard = () => {
  const { address } = useAccount();

  const { writeContractAsync: writeCleanChain } = useScaffoldWriteContract({
    contractName: "CleanChain",
  });

  // Check if user is neighborhood admin
  const { data: isNeighborhoodAdmin } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isNeighborhoodAdmin",
    args: [address],
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

  const handleAssignCleaner = async (neighborhood: string, cleanerAddress: string) => {
    try {
      await writeCleanChain({
        functionName: "assignCleanerToNeighborhood",
        args: [cleanerAddress, neighborhood],
      });
    } catch (error) {
      console.error("Failed to assign cleaner:", error);
      throw error;
    }
  };

  const handleRemoveCleaner = async (neighborhood: string, cleanerAddress: string) => {
    try {
      await writeCleanChain({
        functionName: "removeCleanerFromNeighborhood",
        args: [cleanerAddress, neighborhood],
      });
    } catch (error) {
      console.error("Failed to remove cleaner:", error);
      throw error;
    }
  };

  const handleToggleStatus = async (neighborhood: string, isActive: boolean) => {
    try {
      await writeCleanChain({
        functionName: "setNeighborhoodStatus",
        args: [neighborhood, isActive],
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-green-900/30 p-6 sm:p-8 lg:p-10 text-center">
          <ShieldCheckIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Neighborhood Management
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Manage your assigned neighborhoods. Assign cleaners, monitor activities, and maintain community standards.
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
                    The CleanChain contract is currently paused. Management functions are temporarily unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not Admin Warning */}
          {!isNeighborhoodAdmin && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 lg:p-6 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-medium mb-2">Admin Access Required</h4>
                  <p className="text-yellow-200/80 text-sm lg:text-base">
                    You need to be assigned as a neighborhood administrator to access management functions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Neighborhoods List */}
          {neighborhoods && neighborhoods.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-emerald-200 text-xl font-bold">
                {isNeighborhoodAdmin ? 'Your Neighborhoods' : 'All Neighborhoods'} ({neighborhoods.length})
              </h3>
              
              <div className="space-y-4">
                {neighborhoods.map((neighborhoodName: string, index: number) => (
                  <NeighborhoodItem
                    key={index}
                    neighborhoodName={neighborhoodName}
                    isAdmin={!!isNeighborhoodAdmin}
                    onAssignCleaner={handleAssignCleaner}
                    onRemoveCleaner={handleRemoveCleaner}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-200 mb-2">No Neighborhoods Found</h3>
              <p className="text-emerald-100/60 mb-6">
                No neighborhoods have been registered yet.
              </p>
              <a 
                href="/neighborhoods/register" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Register First Neighborhood
              </a>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/neighborhoods/register" 
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Register Neighborhood
            </a>
            <a 
              href="/neighborhoods/view" 
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
            >
              <MapPinIcon className="w-5 h-5" />
              View All Neighborhoods
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function NeighborhoodManagementPage() {
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
              <ShieldCheckIcon className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-emerald-100 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-emerald-100/70 mb-6 text-base lg:text-lg">
                Please connect your wallet to manage neighborhoods.
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <NeighborhoodManagementCard />
        )}
      </main>
    </div>
  );
} 