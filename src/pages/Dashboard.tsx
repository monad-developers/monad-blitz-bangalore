import React from "react";
import { useNavigate } from "react-router-dom";
import RoleSelector from "@/components/RoleSelector";
import { useWallet } from "@/hooks/useWallet";
import { WalletButton } from "@/components/WalletButton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  const handleRoleSelect = (role: "client" | "freelancer" | "arbitrator") => {
    // Navigate to home with the selected role
    navigate("/", { state: { role } });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Please connect your wallet to access the dashboard
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

export default Dashboard;
