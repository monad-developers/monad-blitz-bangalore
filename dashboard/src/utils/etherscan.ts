import axios from 'axios';

export interface EtherscanTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  confirmations: string;
}

export interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  explorerUrl: string;
  apiUrl: string;
  apiKey?: string;
}

// Network configurations
const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
  },
  goerli: {
    name: 'Goerli',
    chainId: 5,
    explorerUrl: 'https://goerli.etherscan.io',
    apiUrl: 'https://api-goerli.etherscan.io/api',
  },
  sepolia: {
    name: 'Sepolia',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io',
    apiUrl: 'https://api-sepolia.etherscan.io/api',
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    apiUrl: 'https://api.polygonscan.com/api',
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    apiUrl: 'https://api.arbiscan.io/api',
  },
  // Monad testnet (custom configuration)
  monad: {
    name: 'Monad Testnet',
    chainId: 10143,
    explorerUrl: 'https://explorer.monad.xyz', // Placeholder
    apiUrl: 'https://api.explorer.monad.xyz/api', // Placeholder
  },
};

class EtherscanService {
  private defaultNetwork: NetworkConfig;
  private apiKey?: string;

  constructor(chainId: number = 10143, apiKey?: string) {
    this.defaultNetwork = this.getNetworkConfig(chainId);
    this.apiKey = apiKey;
  }

  private getNetworkConfig(chainId: number): NetworkConfig {
    const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
    return network || NETWORKS.monad; // Default to Monad for unknown networks
  }

  // Get transaction details
  async getTransaction(txHash: string, chainId?: number): Promise<EtherscanTransaction | null> {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      // For Monad or unsupported networks, return mock data
      if (network.chainId === 10143 || !network.apiUrl.includes('etherscan')) {
        return this.getMockTransaction(txHash);
      }

      const params = {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txHash,
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get(network.apiUrl, { params });
      
      if (response.data.status === '1' && response.data.result) {
        return this.formatTransaction(response.data.result);
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to fetch transaction from explorer:', error);
      return this.getMockTransaction(txHash);
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string, chainId?: number) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      if (network.chainId === 10143 || !network.apiUrl.includes('etherscan')) {
        return this.getMockReceipt(txHash);
      }

      const params = {
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        txhash: txHash,
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get(network.apiUrl, { params });
      return response.data.result;
    } catch (error) {
      console.warn('Failed to fetch transaction receipt:', error);
      return this.getMockReceipt(txHash);
    }
  }

  // Get account transactions
  async getAccountTransactions(
    address: string, 
    startBlock: number = 0, 
    endBlock: number = 99999999,
    chainId?: number
  ): Promise<EtherscanTransaction[]> {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      if (network.chainId === 10143 || !network.apiUrl.includes('etherscan')) {
        return this.getMockAccountTransactions(address);
      }

      const params = {
        module: 'account',
        action: 'txlist',
        address,
        startblock: startBlock,
        endblock: endBlock,
        page: 1,
        offset: 100,
        sort: 'desc',
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get<EtherscanResponse<EtherscanTransaction[]>>(network.apiUrl, { params });
      
      if (response.data.status === '1') {
        return response.data.result;
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to fetch account transactions:', error);
      return this.getMockAccountTransactions(address);
    }
  }

  // Generate explorer URL for transaction
  getTransactionUrl(txHash: string, chainId?: number): string {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    return `${network.explorerUrl}/tx/${txHash}`;
  }

  // Generate explorer URL for address
  getAddressUrl(address: string, chainId?: number): string {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    return `${network.explorerUrl}/address/${address}`;
  }

  // Generate explorer URL for contract
  getContractUrl(address: string, chainId?: number): string {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    return `${network.explorerUrl}/address/${address}#code`;
  }

  // Mock data for unsupported networks (like Monad)
  private getMockTransaction(txHash: string): EtherscanTransaction {
    return {
      hash: txHash,
      blockNumber: String(Math.floor(Math.random() * 1000000) + 19000000),
      timeStamp: String(Math.floor(Date.now() / 1000)),
      from: '0x83412990439483714A5ab3CBa7a03AFb7363508C',
      to: '0x4142d9Ad70f87c359260e6dC41340af5823BC888',
      value: '0',
      gas: String(Math.floor(Math.random() * 200000) + 100000),
      gasPrice: '50000000000', // 50 gwei
      gasUsed: String(Math.floor(Math.random() * 150000) + 50000),
      isError: '0',
      txreceipt_status: '1',
      input: '0x',
      contractAddress: '',
      cumulativeGasUsed: String(Math.floor(Math.random() * 500000) + 100000),
      confirmations: String(Math.floor(Math.random() * 100) + 1),
    };
  }

  private getMockReceipt(txHash: string) {
    return {
      transactionHash: txHash,
      blockNumber: `0x${(Math.floor(Math.random() * 1000000) + 19000000).toString(16)}`,
      gasUsed: `0x${(Math.floor(Math.random() * 150000) + 50000).toString(16)}`,
      status: '0x1',
      logs: [],
    };
  }

  private getMockAccountTransactions(address: string): EtherscanTransaction[] {
    return Array.from({ length: 5 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: String(Math.floor(Math.random() * 1000000) + 19000000 - i * 100),
      timeStamp: String(Math.floor(Date.now() / 1000) - i * 3600),
      from: i % 2 === 0 ? address : '0x4142d9Ad70f87c359260e6dC41340af5823BC888',
      to: i % 2 === 0 ? '0x4142d9Ad70f87c359260e6dC41340af5823BC888' : address,
      value: '0',
      gas: String(Math.floor(Math.random() * 200000) + 100000),
      gasPrice: '50000000000',
      gasUsed: String(Math.floor(Math.random() * 150000) + 50000),
      isError: '0',
      txreceipt_status: '1',
      input: '0x',
      contractAddress: '',
      cumulativeGasUsed: String(Math.floor(Math.random() * 500000) + 100000),
      confirmations: String(Math.floor(Math.random() * 100) + 1),
    }));
  }

  private formatTransaction(rawTx: any): EtherscanTransaction {
    return {
      hash: rawTx.hash,
      blockNumber: parseInt(rawTx.blockNumber, 16).toString(),
      timeStamp: Math.floor(Date.now() / 1000).toString(), // Approximate
      from: rawTx.from,
      to: rawTx.to,
      value: parseInt(rawTx.value, 16).toString(),
      gas: parseInt(rawTx.gas, 16).toString(),
      gasPrice: parseInt(rawTx.gasPrice, 16).toString(),
      gasUsed: '0', // Not available in transaction data
      isError: '0',
      txreceipt_status: '1',
      input: rawTx.input,
      contractAddress: '',
      cumulativeGasUsed: '0',
      confirmations: '1',
    };
  }

  // Utility methods
  static formatGasPrice(gasPrice: string): string {
    const gwei = parseInt(gasPrice) / 1e9;
    return `${gwei.toFixed(2)} gwei`;
  }

  static formatValue(value: string): string {
    const eth = parseInt(value) / 1e18;
    if (eth === 0) return '0 ETH';
    if (eth < 0.001) return `${(eth * 1e18).toFixed(0)} wei`;
    return `${eth.toFixed(6)} ETH`;
  }

  static getNetworkName(chainId: number): string {
    const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
    return network?.name || 'Unknown Network';
  }
}

export default EtherscanService;
