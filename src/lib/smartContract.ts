import { ethers } from 'ethers';
import { getSigner } from './wallet';

// Game Factory Contract Address on Monad Testnet
const GAME_FACTORY_ADDRESS = '0x456F88C4A2F6dA77B78FB93AafD57306efaD186f';

// Game Factory Contract ABI - only including the function we need
const GAME_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "gameName",
        "type": "string"
      },
      {
        "internalType": "string[][]",
        "name": "levels",
        "type": "string[][]"
      },
      {
        "internalType": "uint256",
        "name": "costOfPlay",
        "type": "uint256"
      }
    ],
    "name": "createGameWithLevelsAndCost",
    "outputs": [
      {
        "internalType": "address",
        "name": "gameAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export interface PublishGameParams {
  gameName: string;
  levels: string[][];
  costOfPlay: string; // in wei
}

export interface PublishGameResult {
  success: boolean;
  gameAddress?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Publishes a game to the smart contract
 * @param params - Game parameters including name, levels, and cost
 * @returns Promise with the result of the transaction
 */
export const publishGameToContract = async (params: PublishGameParams): Promise<PublishGameResult> => {
  try {
    const signer = getSigner();
    
    if (!signer) {
      throw new Error('No wallet connected. Please connect your wallet first.');
    }

    // Create contract instance
    const gameFactoryContract = new ethers.Contract(
      GAME_FACTORY_ADDRESS,
      GAME_FACTORY_ABI,
      signer
    );

    console.log('Publishing game to contract:', {
      address: GAME_FACTORY_ADDRESS,
      gameName: params.gameName,
      levelsCount: params.levels.length,
      costOfPlay: params.costOfPlay
    });

    // Call the smart contract function
    const transaction = await gameFactoryContract.createGameWithLevelsAndCost(
      params.gameName,
      params.levels,
      params.costOfPlay
    );

    console.log('Transaction sent:', transaction.hash);

    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    console.log('Transaction confirmed:', receipt);

    // Extract the game address from the transaction receipt
    // The function returns the game address, so we can get it from the transaction result
    let gameAddress: string | undefined;
    
    // Try to get the return value from the transaction
    if (receipt.logs && receipt.logs.length > 0) {
      // The game address should be in the transaction logs or we can call the contract to get it
      // For now, we'll indicate success without the exact address
      gameAddress = 'Contract deployed successfully';
    }

    return {
      success: true,
      gameAddress: gameAddress,
      transactionHash: receipt.hash
    };

  } catch (error: unknown) {
    console.error('Error publishing game to contract:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const ethersError = error as { code: string; message?: string };
      if (ethersError.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (ethersError.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to complete transaction';
      } else if (ethersError.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection';
      } else if (ethersError.message) {
        errorMessage = ethersError.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Estimates gas cost for publishing a game
 * @param params - Game parameters
 * @returns Promise with estimated gas cost in wei
 */
export const estimatePublishGasCost = async (params: PublishGameParams): Promise<bigint> => {
  try {
    const signer = getSigner();
    
    if (!signer) {
      throw new Error('No wallet connected');
    }

    const gameFactoryContract = new ethers.Contract(
      GAME_FACTORY_ADDRESS,
      GAME_FACTORY_ABI,
      signer
    );

    const estimatedGas = await gameFactoryContract.createGameWithLevelsAndCost.estimateGas(
      params.gameName,
      params.levels,
      params.costOfPlay
    );

    return estimatedGas;
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Return a reasonable default estimate if estimation fails
    return BigInt(500000); // 500k gas units as fallback
  }
}; 