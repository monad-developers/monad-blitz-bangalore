import { ethers } from 'ethers';

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

// Define Monad testnet network parameters
const monadTestnet = {
    chainId: '0x279F', // 10143 in hex
    chainName: 'Monad Testnet',
    nativeCurrency: {
        name: 'Monad',
        symbol: 'MONAD',
        decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: [
        'https://testnet.monadexplorer.com/',
        'https://monad-testnet.socialscan.io/'
    ]
};

// Format balance for display
const formatBalance = (balance: string) => {
    const balanceInEther = ethers.formatEther(balance);
    const numBalance = parseFloat(balanceInEther);
    
    if (numBalance === 0) return "0";
    if (numBalance < 0.001) return "< 0.001";
    if (numBalance < 1) return numBalance.toFixed(3);
    if (numBalance < 1000) return numBalance.toFixed(2);
    
    return numBalance.toFixed(1);
};

// Connect to MetaMask and configure Monad Testnet
export const connectToMetamask = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    provider = new ethers.BrowserProvider(window.ethereum);

    try {
        // Try to switch to Monad testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: monadTestnet.chainId }],
        });
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [monadTestnet],
                });
            } catch (addError) {
                throw new Error('Failed to add Monad testnet to MetaMask');
            }
        } else {
            throw new Error('Failed to switch to Monad testnet');
        }
    }

    const [accounts, chainId] = await Promise.all([
        provider.send('eth_requestAccounts', []),
        provider.send('eth_chainId', []),
    ]);
    
    // Verify we're on the correct network
    if (chainId.toString(16).toLowerCase() !== monadTestnet.chainId.toString(16).toLowerCase()) {
        throw new Error('Please switch to Monad testnet network');
    }

    signer = await provider.getSigner();
    console.log("accounts", accounts, "chainId", chainId);
    return { signer, chain: chainId, accounts: accounts };
};

// Get wallet balance
const getWalletBalance = async (address: string) => {
    if (!provider) return "0";
    
    try {
        const balance = await provider.getBalance(address);
        return formatBalance(balance.toString());
    } catch (error) {
        console.error("Error fetching balance:", error);
        return "0";
    }
};

// Get wallet information and connect
export const getWalletInformation = async () => {
    try {
        const { signer: newSigner, chain, accounts } = await connectToMetamask();

        if (!accounts || accounts.length === 0) {
            throw new Error('No account found');
        }
        if (!chain) {
            throw new Error('No chain found');
        }

        signer = newSigner;
        
        // Get wallet balance
        const balance = await getWalletBalance(accounts[0]);
        
        return {
            address: accounts[0],
            network: 'Monad Testnet',
            chainId: chain,
            balance: balance,
            signer: newSigner
        };
        
    } catch (error) {
        console.error("Wallet connection error:", error);
        throw error;
    }
};

// Check if wallet is already connected
export const checkWalletConnection = async () => {
    if (!window.ethereum) {
        return null;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            const chainId = await provider.send('eth_chainId', []);
            
            // Get wallet balance
            const balance = await getWalletBalance(accounts[0]);
            
            return {
                address: accounts[0],
                network: chainId === monadTestnet.chainId ? 'Monad Testnet' : 'Unknown Network',
                chainId: chainId,
                balance: balance,
                signer: signer
            };
        }
    } catch (error) {
        console.error("Error checking wallet connection:", error);
    }
    
    return null;
};

// Refresh wallet balance
export const refreshWalletBalance = async (address: string) => {
    return await getWalletBalance(address);
};

// Disconnect wallet
export const disconnectWallet = () => {
    provider = null;
    signer = null;
};

// Get current signer
export const getSigner = () => signer;

// Get current provider
export const getProvider = () => provider; 