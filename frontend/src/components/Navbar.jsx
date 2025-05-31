import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, Plus, Home, User, Loader2 } from 'lucide-react';
import { formatETH } from '../utils/formatETH';

const Navbar = () => {
  const { account, balance, isConnected, isConnecting, connect, disconnect } = useWallet();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span>NFT Marketplace</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              to="/mint"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/mint') 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Plus size={18} />
              <span>Mint NFT</span>
            </Link>

            {isConnected && (
              <Link
                to="/my-nfts"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/my-nfts') 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <User size={18} />
                <span>My NFTs</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm">
                  <div className="text-gray-600">Balance</div>
                  <div className="font-semibold text-gray-900">
                    {formatETH(balance, 4)} MON
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Wallet size={16} className="text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {truncateAddress(account)}
                    </div>
                    <div className="text-xs text-gray-500">Connected</div>
                  </div>
                </div>

                <button
                  onClick={disconnect}
                  className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Wallet size={18} />
                )}
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 