import React, { useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import "./allstyles.css";

const LandingPage: React.FC = () => {
  const { isConnected, address, connectWallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/lobby");
    }
  }, [isConnected, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">Type Race Monad</h1>
      {!isConnected ? (
        <button onClick={connectWallet} className="main-button">
          Connect Wallet
        </button>
      ) : (
        <p className="text-xl">Connected with address: {address}</p>
      )}
    </div>
  );
};

export default LandingPage;
