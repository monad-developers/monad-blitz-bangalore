"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  CameraIcon,
  ClockIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  PhotoIcon,
  EyeIcon
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
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Collection Confirmation</span>
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

// Hook to fetch collection event details
const useCollectionEventDetails = (eventId: bigint) => {
  const { data: eventDetails } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getCollectionEvent",
    args: [eventId],
  });

  return eventDetails;
};

// Collection Event Item Component
const CollectionEventItem = ({ 
  eventId, 
  onConfirm 
}: { 
  eventId: bigint, 
  onConfirm: (eventId: number, imageHash: string, imageURI: string) => void 
}) => {
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [imageHash, setImageHash] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Get event details
  const event = useCollectionEventDetails(eventId);

  const handleConfirm = async () => {
    if (!imageHash || !imageURI) return;
    
    setIsConfirming(true);
    try {
      await onConfirm(Number(eventId), imageHash, imageURI);
      setShowConfirmForm(false);
      setImageHash("");
      setImageURI("");
    } catch (error) {
      console.error("Confirmation failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Show loading state if event details aren't loaded yet
  if (!event) {
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
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${event.confirmedByHouse ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className={`text-sm font-medium ${event.confirmedByHouse ? 'text-green-300' : 'text-yellow-300'}`}>
              {event.confirmedByHouse ? 'Confirmed' : 'Pending Confirmation'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-emerald-100/70">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Cleaner:</span>
              <Address address={event.cleaner} />
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Date:</span>
              <span>{new Date(Number(event.timestamp) * 1000).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhotoIcon className="w-4 h-4" />
              <span>Event ID:</span>
              <span>#{eventId.toString()}</span>
            </div>
          </div>
        </div>
        
        {!event.confirmedByHouse && (
          <button
            onClick={() => setShowConfirmForm(!showConfirmForm)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
          >
            {showConfirmForm ? 'Cancel' : 'Confirm'}
          </button>
        )}
      </div>

      {/* Original cleaner's image */}
      <div className="mb-4">
        <h5 className="text-emerald-200 text-sm font-medium mb-2">Cleaner's Proof Image:</h5>
        <div className="bg-black/40 border border-green-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-emerald-100/60">
            <PhotoIcon className="w-4 h-4" />
            <span>Hash: {event.imageHash}</span>
          </div>
          {event.imageURI && (
            <div className="flex items-center gap-2 text-xs text-emerald-100/60 mt-1">
              <EyeIcon className="w-4 h-4" />
              <a 
                href={event.imageURI} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                View Image
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Form */}
      {showConfirmForm && !event.confirmedByHouse && (
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4 mt-4">
          <h5 className="text-emerald-300 font-medium mb-3 flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            Confirm Collection with Your Photo
          </h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-1">
                Image Hash (SHA-256) *
              </label>
              <input
                type="text"
                value={imageHash}
                onChange={(e) => setImageHash(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Enter the SHA-256 hash of your validation image"
              />
            </div>
            
            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-1">
                Image URI *
              </label>
              <input
                type="url"
                value={imageURI}
                onChange={(e) => setImageURI(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="https://example.com/your-validation-image.jpg"
              />
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={isConfirming || !imageHash || !imageURI}
              className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Confirm Collection
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Confirmation Card Component
const CollectionConfirmationCard = () => {
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 5;

  const { writeContractAsync: writeCleanChain } = useScaffoldWriteContract({
    contractName: "CleanChain",
  });

  // Check if user is registered as house
  const { data: isRegisteredHouse } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isRegisteredHouse",
    args: [address],
  });

  // Get house collection events with pagination
  const { data: eventsData } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getHouseCollectionEventsPaginated",
    args: [address, BigInt(currentPage * eventsPerPage), BigInt(eventsPerPage)],
    query: {
      enabled: isRegisteredHouse,
    },
  });

  // Get house collection stats
  const { data: stats } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getHouseCollectionStats",
    args: [address],
    query: {
      enabled: isRegisteredHouse,
    },
  });

  // Contract status
  const { data: isPaused } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "isPaused",
  });

  // Get individual collection events
  const eventIds = eventsData?.[0] || [];
  const totalEvents = Number(eventsData?.[1] || 0);
  
  const handleConfirmCollection = async (eventId: number, imageHash: string, imageURI: string) => {
    if (!address) return;

    try {
      await writeCleanChain({
        functionName: "confirmGarbageCollection",
        args: [BigInt(eventId), `0x${imageHash}`, imageURI],
      });
    } catch (error) {
      console.error("Confirmation failed:", error);
      throw error;
    }
  };

  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-green-900/30 p-6 sm:p-8 lg:p-10 text-center">
          <CheckCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Collection Confirmation
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Review and confirm garbage collection events at your household. Help cleaners earn reputation and bonus points.
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
                    The CleanChain contract is currently paused. Confirmations are temporarily unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not Registered Warning */}
          {!isRegisteredHouse && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 lg:p-6 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-medium mb-2">Household Not Registered</h4>
                  <p className="text-yellow-200/80 text-sm lg:text-base mb-4">
                    You need to register your household before you can confirm collection events.
                  </p>
                  <a 
                    href="/households/register" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    <HomeIcon className="w-4 h-4" />
                    Register Household
                  </a>
                </div>
              </div>
            </div>
          )}

          {isRegisteredHouse && (
            <>
              {/* Statistics */}
              {stats && (
                <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6 mb-6">
                  <h4 className="text-emerald-200 font-medium mb-4">Collection Statistics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-emerald-200">{stats[0]?.toString()}</div>
                      <div className="text-emerald-100/60 text-sm">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-green-400">{stats[1]?.toString()}</div>
                      <div className="text-emerald-100/60 text-sm">Confirmed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-yellow-400">{stats[2]?.toString()}</div>
                      <div className="text-emerald-100/60 text-sm">Pending</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collection Events */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-emerald-200 font-medium">Recent Collection Events</h4>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 text-sm rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-emerald-100/60 text-sm">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-1 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 text-sm rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {eventIds.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
                    <h5 className="text-emerald-200 font-medium mb-2">No Collection Events</h5>
                    <p className="text-emerald-100/60">
                      No garbage collection events have been logged for your household yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventIds.map((eventId: bigint, index: number) => (
                      <CollectionEventItem
                        key={eventId.toString()}
                        eventId={eventId}
                        onConfirm={handleConfirmCollection}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 lg:p-6 mt-6">
                <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                  <CameraIcon className="w-5 h-5" />
                  How to Confirm Collections
                </h4>
                <ol className="text-blue-200/80 text-sm lg:text-base space-y-2 list-decimal list-inside">
                  <li>Review the cleaner's proof image and collection details</li>
                  <li>Take your own photo as validation evidence</li>
                  <li>Generate a SHA-256 hash of your validation image</li>
                  <li>Upload your image to IPFS or other decentralized storage</li>
                  <li>Enter the image hash and URI to confirm the collection</li>
                  <li>Both you and the cleaner will earn bonus points for confirmed collections</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function CollectionConfirmationPage() {
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
              <CheckCircleIcon className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-emerald-100 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-emerald-100/70 mb-6 text-base lg:text-lg">
                Please connect your wallet to confirm collection events.
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <CollectionConfirmationCard />
        )}
      </main>
    </div>
  );
} 