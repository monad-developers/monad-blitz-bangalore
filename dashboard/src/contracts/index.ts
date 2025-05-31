import FunctionRegistryABI from './FunctionRegistry.abi.json';

export const CONTRACT_CONFIG = {
  address: process.env.REACT_APP_CONTRACT_ADDRESS || '0xA0008C89d0773C6bA854E05D72dC15Aa5E4012c8',
  abi: FunctionRegistryABI,
  rpcUrl: process.env.REACT_APP_RPC_URL || 'https://testnet-rpc.monad.xyz',
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '10143'),
  networkName: process.env.REACT_APP_NETWORK_NAME || 'Monad Testnet',
  explorerUrl: process.env.REACT_APP_EXPLORER_URL || 'https://explorer.monad.xyz'
};

export { FunctionRegistryABI };
