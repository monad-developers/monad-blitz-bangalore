import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ethers } from 'ethers';

// Replace with your actual contract address and ABI
const GAME_CONTRACT_ADDRESS = "0x39c37135eede465dff370d6961fa00211e3c6020";
const GAME_CONTRACT_ABI =
	[
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "creator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stakeAmount",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "textToType",
					"type": "string"
				}
			],
			"name": "GameCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "winner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "prizeAmount",
					"type": "uint256"
				}
			],
			"name": "GameFinished",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "startTime",
					"type": "uint256"
				}
			],
			"name": "GameStarted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "PlayerJoined",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "wordsTyped",
					"type": "uint256"
				}
			],
			"name": "ScoreSubmitted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "StakeRefunded",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "cancelGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_textToType",
					"type": "string"
				}
			],
			"name": "createGame",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "finishGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "joinGame",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_wordsTyped",
					"type": "uint256"
				}
			],
			"name": "submitScore",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "GAME_DURATION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "gameCounter",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "games",
			"outputs": [
				{
					"internalType": "address",
					"name": "player1",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "player2",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "stakeAmount",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "textToType",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "endTime",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "gameActive",
					"type": "bool"
				},
				{
					"internalType": "bool",
					"name": "gameFinished",
					"type": "bool"
				},
				{
					"internalType": "address",
					"name": "winner",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "getGameInfo",
			"outputs": [
				{
					"internalType": "address",
					"name": "player1",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "player2",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "stakeAmount",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "textToType",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "endTime",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "gameActive",
					"type": "bool"
				},
				{
					"internalType": "bool",
					"name": "gameFinished",
					"type": "bool"
				},
				{
					"internalType": "address",
					"name": "winner",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "getPlayerScore",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "getTimeRemaining",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getTotalGames",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "hasPlayerSubmitted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];

interface WalletContextType {
	provider: ethers.BrowserProvider | null;
	signer: ethers.JsonRpcSigner | null;
	address: string | null;
	isConnected: boolean;
	connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
	const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
	const [address, setAddress] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (window.ethereum) {
			const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
			setProvider(ethProvider);

			window.ethereum.on('accountsChanged', handleAccountsChanged as any);
			window.ethereum.on('chainChanged', handleChainChanged as any);

			return () => {
				if (window.ethereum) {
					window.ethereum.removeListener('accountsChanged', handleAccountsChanged as any);
					window.ethereum.removeListener('chainChanged', handleChainChanged as any);
				}
			};
		}
	}, []);

	const handleAccountsChanged = (accounts: string[]) => {
		if (accounts.length === 0) {
			// MetaMask is locked or the user has disconnected
			setIsConnected(false);
			setAddress(null);
			setSigner(null);
		} else if (address !== accounts[0]) {
			// Account changed
			setAddress(accounts[0]);
			if (provider) {
				provider.getSigner().then(setSigner);
			}
			setIsConnected(true);
		}
	};

	const handleChainChanged = () => {
		// Recommended to reload the page on chain changes
		window.location.reload();
	};

	const connectWallet = async () => {
		if (!window.ethereum) {
			alert('Please install MetaMask!');
			return;
		}
		if (!provider) {
			const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
			setProvider(ethProvider);
		}
		try {
			const currentProvider = provider || new ethers.BrowserProvider(window.ethereum as any);
			await currentProvider.send("eth_requestAccounts", []);
			const signer = await currentProvider.getSigner();
			const address = await signer.getAddress();
			setSigner(signer);
			setAddress(address);
			setIsConnected(true);

			// Attempt to switch to Monad Testnet
			const monadChainId = 10143; // Monad Testnet Chain ID
			const currentChainId = await currentProvider.send('eth_chainId', []);

			if (parseInt(currentChainId, 16) !== monadChainId) {
				try {
					await currentProvider.send('wallet_switchEthereumChain', [{ chainId: `0x${monadChainId.toString(16)}` }]);
				} catch (error) {
					console.error('Failed to switch to Monad Testnet', error);
				}
			}

		} catch (error) {
			console.error('Failed to connect wallet', error);
		}
	};

	return (
		<WalletContext.Provider value={{ provider, signer, address, isConnected, connectWallet }}>
			{children}
		</WalletContext.Provider>
	);
};

export const useWallet = () => {
	const context = useContext(WalletContext);
	if (context === undefined) {
		throw new Error('useWallet must be used within a WalletProvider');
	}
	return context;
};

// Custom hook to get the game contract instance
export const useGameContract = () => {
	const { provider, signer } = useWallet();

	const gameContract = useMemo(() => {
		if (!provider) {
			return null;
		}
		// Use the signer if available (wallet connected), otherwise use the provider (read-only)
		const signerOrProvider = signer || provider;

		try {
			return new ethers.Contract(GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, signerOrProvider);
		} catch (error) {
			console.error("Error creating contract instance:", error);
			return null;
		}

	}, [provider, signer]);

	return gameContract;
};

