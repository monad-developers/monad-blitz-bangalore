"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  MapPinIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
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
        <span className="hidden sm:block text-emerald-200/80 text-sm 2xl:text-base font-medium">Neighborhood Directory</span>
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

// Neighborhood Card Component
const NeighborhoodCard = ({ neighborhoodName }: { neighborhoodName: string }) => {
  // Get full neighborhood data
  const { data: neighborhood } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getNeighborhood",
    args: [neighborhoodName],
  });

  // Get cleaners in this neighborhood
  const { data: cleaners } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getCleanersInNeighborhood",
    args: [neighborhoodName],
  });

  // Get houses in this neighborhood
  const { data: houses } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getHousesInNeighborhood",
    args: [neighborhoodName],
  });

  if (!neighborhood) {
    return (
      <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6 animate-pulse">
        <div className="h-6 bg-emerald-400/20 rounded mb-2"></div>
        <div className="h-4 bg-emerald-400/10 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-12 bg-emerald-400/10 rounded"></div>
          <div className="h-12 bg-emerald-400/10 rounded"></div>
          <div className="h-12 bg-emerald-400/10 rounded"></div>
        </div>
        <div className="h-12 bg-emerald-400/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 lg:p-6 hover:bg-black/30 transition-colors">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-emerald-200">{neighborhood.name}</h3>
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
        <p className="text-emerald-100/70 text-sm mb-4">{neighborhood.description}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <HomeIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-200">{houses?.length || 0}</div>
          <div className="text-emerald-100/60 text-xs">Houses</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <UserGroupIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-200">{cleaners?.length || 0}</div>
          <div className="text-emerald-100/60 text-xs">Cleaners</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ChartBarIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-200">{neighborhood.totalCollections?.toString() || "0"}</div>
          <div className="text-emerald-100/60 text-xs">Collections</div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-emerald-100/70">
          <BuildingOfficeIcon className="w-4 h-4" />
          <span>Admin:</span>
          <Address address={neighborhood.admin} />
        </div>
      </div>
    </div>
  );
};

// Main View Card Component
const NeighborhoodViewCard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Get all neighborhoods
  const { data: neighborhoods } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getAllNeighborhoods",
  });

  // Get total system stats
  const { data: totalHouses } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getTotalHouses",
  });

  const { data: totalCleaners } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "getTotalCleaners",
  });

  const { data: totalCollectionEvents } = useScaffoldReadContract({
    contractName: "CleanChain",
    functionName: "totalCollectionEvents",
  });

  // Filter neighborhoods based on search and status
  const filteredNeighborhoods = neighborhoods?.filter((name: string) => {
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    // For now, we'll show all neighborhoods since we don't have individual status data
    return matchesSearch;
  }) || [];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-green-900/30 p-6 sm:p-8 lg:p-10 text-center">
          <MapPinIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400 mx-auto mb-4 lg:mb-6" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-100 mb-3 lg:mb-4">
            Neighborhood Directory
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Explore all neighborhoods in the GreenGrid network. View community statistics, active cleaners, and participation rates.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10">
          {/* System Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-200">{neighborhoods?.length || 0}</div>
              <div className="text-emerald-100/60 text-sm">Neighborhoods</div>
            </div>
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-200">{totalHouses?.toString() || "0"}</div>
              <div className="text-emerald-100/60 text-sm">Total Houses</div>
            </div>
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-200">{totalCleaners?.toString() || "0"}</div>
              <div className="text-emerald-100/60 text-sm">Total Cleaners</div>
            </div>
            <div className="bg-black/20 border border-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-200">{totalCollectionEvents?.toString() || "0"}</div>
              <div className="text-emerald-100/60 text-sm">Total Collections</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search neighborhoods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div className="sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="w-full sm:w-auto px-4 py-2 bg-black/40 border border-green-900/30 rounded-lg text-emerald-100 focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Neighborhoods Grid */}
          {filteredNeighborhoods.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-emerald-200 text-xl font-bold">
                  {searchTerm ? `Search Results (${filteredNeighborhoods.length})` : `All Neighborhoods (${filteredNeighborhoods.length})`}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNeighborhoods.map((neighborhoodName: string, index: number) => (
                  <NeighborhoodCard
                    key={index}
                    neighborhoodName={neighborhoodName}
                  />
                ))}
              </div>
            </div>
          ) : neighborhoods?.length === 0 ? (
            <div className="text-center py-12">
              <MapPinIcon className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-200 mb-2">No Neighborhoods Found</h3>
              <p className="text-emerald-100/60 mb-6">
                No neighborhoods have been registered in the GreenGrid network yet.
              </p>
              <a 
                href="/neighborhoods/register" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Register First Neighborhood
              </a>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPinIcon className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-200 mb-2">No Results Found</h3>
              <p className="text-emerald-100/60">
                No neighborhoods match your search criteria. Try adjusting your search or filters.
              </p>
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
              href="/neighborhoods/manage" 
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600/20 border border-emerald-400/30 text-emerald-200 font-semibold rounded-lg hover:bg-emerald-600/30 hover:scale-[1.02] transition-all duration-300 text-base lg:text-lg"
            >
              <UserGroupIcon className="w-5 h-5" />
              Manage Neighborhoods
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function NeighborhoodViewPage() {
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
        <NeighborhoodViewCard />
      </main>
    </div>
  );
} 