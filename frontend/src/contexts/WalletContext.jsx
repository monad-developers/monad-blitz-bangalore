import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  connectWallet, 
  getCurrentAccount, 
  getBalance,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
  isMetaMaskInstalled 
} from '../utils/wallet';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();

    return () => {
      removeListeners();
    };
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (account) {
      updateBalance();
    }
  }, [account]);

  const checkConnection = async () => {
    try {
      console.log('Checking existing connection...');
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        console.log('Found existing connection:', currentAccount);
        setAccount(currentAccount);
        setIsConnected(true);
        const userBalance = await getBalance(currentAccount);
        setBalance(userBalance);
      } else {
        console.log('No existing connection found');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const setupEventListeners = () => {
    if (!isMetaMaskInstalled()) return;

    onAccountsChanged((accounts) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    });

    onChainChanged((chainId) => {
      console.log('Chain changed to:', chainId);
      window.location.reload();
    });
  };

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    if (isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    setIsConnecting(true);
    console.log('Starting wallet connection process...');
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
      });

      const connectionPromise = connectWallet();
      
      const connectedAccount = await Promise.race([connectionPromise, timeoutPromise]);
      
      console.log('Connection successful:', connectedAccount);
      setAccount(connectedAccount);
      setIsConnected(true);
      
      // Get balance
      try {
        const userBalance = await getBalance(connectedAccount);
        setBalance(userBalance);
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError);
        setBalance('0');
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      // More specific error messages
      if (error.message.includes('timeout')) {
        toast.error('Connection timed out. Please try again.');
      } else if (error.message.includes('User rejected')) {
        toast.error('Connection rejected by user');
      } else if (error.message.includes('already pending')) {
        toast.error('Please check MetaMask - connection request is pending');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
      console.log('Connection process completed');
    }
  };

  const disconnect = () => {
    console.log('Disconnecting wallet...');
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const updateBalance = async () => {
    if (account) {
      try {
        const userBalance = await getBalance(account);
        setBalance(userBalance);
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  const value = {
    account,
    balance,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    updateBalance,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 