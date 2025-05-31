import React, { useState, useEffect } from "react";
import {
  Plus,
  Shield,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/WalletButton";
import { useWallet } from "@/hooks/useWallet";
import CreateEscrowModal from "@/components/CreateEscrowModal";
import EscrowCard from "@/components/EscrowCard";
import ClientDashboard from "@/components/ClientDashboard";
import FreelancerDashboard from "@/components/FreelancerDashboard";
import ArbitratorDashboard from "@/components/ArbitratorDashboard";
import { Link, useLocation, useNavigate } from "react-router-dom";

type UserRole = "client" | "freelancer" | "arbitrator" | null;

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { isConnected, address } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle role from Dashboard page
  useEffect(() => {
    if (location.state?.role) {
      setUserRole(location.state.role);
    }
  }, [location.state]);

  // Show appropriate dashboard based on selected role
  if (isConnected && userRole && address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    GriffinLock.mon
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-6">
                  <Link
                    to="/dashboard"
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
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Switch Role
                </Button>
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {userRole === "client" && <ClientDashboard userAddress={address} />}
          {userRole === "freelancer" && (
            <FreelancerDashboard userAddress={address} />
          )}
          {userRole === "arbitrator" && (
            <ArbitratorDashboard userAddress={address} />
          )}
        </div>
      </div>
    );
  }

  // Show landing page if no role selected or wallet not connected
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
                  to="/dashboard"
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
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trustless Escrow
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                On Monad
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Secure, time-bound payments with built-in dispute resolution.
              Create escrows with automatic timeouts and 2-of-3 multisig
              arbitration.
            </p>

            <div className="flex flex-col items-center gap-4">
              {isConnected ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">
                    Connect your wallet to get started
                  </p>
                  <WalletButton />
                </>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Clock className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle>Time-Locked Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Funds automatically unlock based on configurable deadlines
                  with built-in timeout protection.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle>Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Automated Telegram mediation with neutral arbitrators for fair
                  conflict resolution.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Shield className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle>Multisig Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  2-of-3 multisig logic ensures no single party can control the
                  escrow funds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
