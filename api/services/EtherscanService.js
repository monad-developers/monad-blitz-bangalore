/**
 * Enhanced Etherscan Integration Service
 * 
 * Provides transaction lookup, gas analysis, and blockchain data
 * with support for Monad testnet and fallback mock data
 */

const axios = require('axios');
const chalk = require('chalk');

class EtherscanService {
  constructor(chainId = 10143, apiKey = null) {
    this.chainId = chainId;
    this.apiKey = apiKey;
    this.networks = {
      1: {
        name: 'Ethereum Mainnet',
        apiUrl: 'https://api.etherscan.io/api',
        explorerUrl: 'https://etherscan.io',
        currency: 'ETH'
      },
      5: {
        name: 'Goerli Testnet',
        apiUrl: 'https://api-goerli.etherscan.io/api',
        explorerUrl: 'https://goerli.etherscan.io',
        currency: 'ETH'
      },
      137: {
        name: 'Polygon Mainnet',
        apiUrl: 'https://api.polygonscan.com/api',
        explorerUrl: 'https://polygonscan.com',
        currency: 'MATIC'
      },
      10143: {
        name: 'Monad Testnet',
        apiUrl: 'https://testnet-explorer.monad.xyz/api', // Mock URL
        explorerUrl: 'https://testnet-explorer.monad.xyz',
        currency: 'MON'
      }
    };
    
    this.defaultNetwork = this.networks[chainId] || this.networks[10143];
    console.log(chalk.green(`🔍 Etherscan service initialized for ${this.defaultNetwork.name}`));
  }

  // Get network configuration
  getNetworkConfig(chainId) {
    return this.networks[chainId] || this.defaultNetwork;
  }

  // Get transaction details with enhanced data
  async getTransaction(txHash, chainId = null) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      // For Monad or unsupported networks, return enhanced mock data
      if (network.chainId === 10143 || !network.apiUrl.includes('etherscan')) {
        return this.getEnhancedMockTransaction(txHash);
      }

      const params = {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txHash,
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get(network.apiUrl, { params });
      
      if (response.data.status === '1' && response.data.result) {
        return this.formatTransactionData(response.data.result, network);
      }
      
      return null;
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to fetch transaction from explorer:'), error.message);
      return this.getEnhancedMockTransaction(txHash);
    }
  }

  // Get transaction receipt with gas analysis
  async getTransactionReceipt(txHash, chainId = null) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      if (network.chainId === 10143 || !network.apiUrl.includes('etherscan')) {
        return this.getEnhancedMockReceipt(txHash);
      }

      const params = {
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        txhash: txHash,
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get(network.apiUrl, { params });
      
      if (response.data.status === '1' && response.data.result) {
        return this.formatReceiptData(response.data.result, network);
      }
      
      return null;
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to fetch transaction receipt:'), error.message);
      return this.getEnhancedMockReceipt(txHash);
    }
  }

  // Get account transactions
  async getAccountTransactions(address, startBlock = 0, endBlock = 'latest', chainId = null) {
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

      const response = await axios.get(network.apiUrl, { params });
      
      if (response.data.status === '1') {
        return response.data.result.map(tx => this.formatTransactionData(tx, network));
      }
      
      return [];
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to fetch account transactions:'), error.message);
      return this.getMockAccountTransactions(address);
    }
  }

  // Get gas price statistics
  async getGasStats(chainId = null) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    
    try {
      if (network.chainId === 10143) {
        return this.getMockGasStats();
      }

      const params = {
        module: 'gastracker',
        action: 'gasoracle',
        apikey: this.apiKey || 'YourApiKeyToken',
      };

      const response = await axios.get(network.apiUrl, { params });
      
      if (response.data.status === '1') {
        return {
          slow: response.data.result.SafeGasPrice,
          standard: response.data.result.ProposeGasPrice,
          fast: response.data.result.FastGasPrice,
          currency: network.currency,
          timestamp: Date.now()
        };
      }
      
      return this.getMockGasStats();
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to fetch gas stats:'), error.message);
      return this.getMockGasStats();
    }
  }

  // Format transaction data with enhanced information
  formatTransactionData(tx, network) {
    const gasUsed = parseInt(tx.gasUsed || tx.gas || '21000');
    const gasPrice = parseInt(tx.gasPrice || '75000000000'); // 75 gwei default
    const gasCost = gasUsed * gasPrice;
    
    return {
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber || '0'),
      from: tx.from,
      to: tx.to,
      value: tx.value || '0',
      gasUsed,
      gasPrice,
      gasCost,
      gasCostETH: gasCost / 1e18,
      status: tx.status === '0x1' || tx.status === '1' ? 'success' : 'failed',
      timestamp: parseInt(tx.timeStamp || Date.now() / 1000),
      explorerUrl: `${network.explorerUrl}/tx/${tx.hash}`,
      network: network.name,
      currency: network.currency
    };
  }

  // Format receipt data
  formatReceiptData(receipt, network) {
    return {
      ...this.formatTransactionData(receipt, network),
      contractAddress: receipt.contractAddress,
      logs: receipt.logs || [],
      logsBloom: receipt.logsBloom,
      cumulativeGasUsed: parseInt(receipt.cumulativeGasUsed || '0')
    };
  }

  // Enhanced mock transaction for Monad testnet
  getEnhancedMockTransaction(txHash) {
    const gasUsed = 150000 + Math.floor(Math.random() * 100000);
    const gasPrice = 75000000000; // 75 gwei
    const gasCost = gasUsed * gasPrice;
    
    return {
      hash: txHash,
      blockNumber: 1234567 + Math.floor(Math.random() * 1000),
      from: '0x83412990439483714A5ab3CBa7a03AFb7363508C',
      to: '0xA0008C89d0773C6bA854E05D72dC15Aa5E4012c8',
      value: '0',
      gasUsed,
      gasPrice,
      gasCost,
      gasCostETH: gasCost / 1e18,
      status: Math.random() > 0.05 ? 'success' : 'failed', // 95% success rate
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
      explorerUrl: `https://testnet-explorer.monad.xyz/tx/${txHash}`,
      network: 'Monad Testnet',
      currency: 'MON',
      isMock: true
    };
  }

  // Enhanced mock receipt
  getEnhancedMockReceipt(txHash) {
    const tx = this.getEnhancedMockTransaction(txHash);
    return {
      ...tx,
      contractAddress: null,
      logs: [
        {
          address: '0xA0008C89d0773C6bA854E05D72dC15Aa5E4012c8',
          topics: [
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            '0x000000000000000000000000' + Math.floor(Math.random() * 1000).toString(16).padStart(40, '0')
          ],
          data: '0x' + Math.random().toString(16).slice(2).padStart(64, '0')
        }
      ],
      logsBloom: '0x' + '0'.repeat(512),
      cumulativeGasUsed: tx.gasUsed + Math.floor(Math.random() * 50000)
    };
  }

  // Mock account transactions
  getMockAccountTransactions(address) {
    const transactions = [];
    for (let i = 0; i < 10; i++) {
      const txHash = '0x' + Math.random().toString(16).slice(2).padStart(64, '0');
      transactions.push(this.getEnhancedMockTransaction(txHash));
    }
    return transactions;
  }

  // Mock gas statistics
  getMockGasStats() {
    return {
      slow: '50',
      standard: '75',
      fast: '100',
      currency: 'MON',
      timestamp: Date.now(),
      isMock: true
    };
  }

  // Get explorer URL for transaction
  getExplorerUrl(txHash, chainId = null) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    return `${network.explorerUrl}/tx/${txHash}`;
  }

  // Get explorer URL for address
  getAddressUrl(address, chainId = null) {
    const network = chainId ? this.getNetworkConfig(chainId) : this.defaultNetwork;
    return `${network.explorerUrl}/address/${address}`;
  }

  // Analyze gas efficiency
  analyzeGasEfficiency(transactions) {
    if (!transactions.length) return null;

    const gasUsages = transactions.map(tx => tx.gasUsed);
    const gasPrices = transactions.map(tx => tx.gasPrice);
    
    return {
      totalTransactions: transactions.length,
      totalGasUsed: gasUsages.reduce((sum, gas) => sum + gas, 0),
      averageGasUsed: gasUsages.reduce((sum, gas) => sum + gas, 0) / gasUsages.length,
      minGasUsed: Math.min(...gasUsages),
      maxGasUsed: Math.max(...gasUsages),
      averageGasPrice: gasPrices.reduce((sum, price) => sum + price, 0) / gasPrices.length,
      totalCostETH: transactions.reduce((sum, tx) => sum + tx.gasCostETH, 0),
      successRate: transactions.filter(tx => tx.status === 'success').length / transactions.length * 100
    };
  }
}

module.exports = EtherscanService;
