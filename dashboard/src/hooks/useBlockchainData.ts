import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Smart Contract Configuration
const CONFIG = {
  rpcUrl: 'https://rpc.monad.xyz', // Monad mainnet RPC
  registryAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Will need to deploy on Monad
  pollInterval: 2000, // 2 seconds
};

// Smart Contract ABI
const FUNCTION_REGISTRY_ABI = [
  'function nextFunctionId() external view returns (uint256)',
  'function nextTriggerId() external view returns (uint256)',
  'function functions(uint256) external view returns (bytes32 wasmHash, string name, string description, address owner, uint256 gasLimit, bool active, uint256 createdAt, uint256 executionCount, string runtime)',
  'function triggers(uint256) external view returns (uint256 functionId, uint8 triggerType, bytes triggerData, bool active, uint256 lastTriggered, uint256 triggerCount)',
  'event FunctionRegistered(uint256 indexed functionId, address indexed owner, string name, bytes32 wasmHash)',
  'event TriggerFired(uint256 indexed triggerId, uint256 indexed functionId, bytes contextData)',
  'event FunctionExecuted(uint256 indexed functionId, uint256 indexed triggerId, bool success, uint256 gasUsed)'
];

interface PerformanceData {
  tps: number;
  avgGas: number;
  chartData: Array<{
    timestamp: number;
    functions: number;
    triggers: number;
    gasUsed: number;
  }>;
}

interface Activity {
  id: string;
  type: 'function_registered' | 'trigger_fired' | 'function_executed';
  timestamp: number;
  details: string;
  txHash?: string;
}

export const useBlockchainData = () => {
  const [functionCount, setFunctionCount] = useState<number>(0);
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize provider and contract
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const newProvider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
        const newContract = new ethers.Contract(CONFIG.registryAddress, FUNCTION_REGISTRY_ABI, newProvider);
        
        // Test connection
        await newProvider.getNetwork();
        
        setProvider(newProvider);
        setContract(newContract);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to blockchain:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProvider();
  }, []);

  // Fetch current counts
  const fetchCounts = useCallback(async () => {
    if (!contract) return;

    try {
      const [nextFunctionId, nextTriggerId] = await Promise.all([
        contract.nextFunctionId(),
        contract.nextTriggerId()
      ]);

      const functions = Number(nextFunctionId) - 1;
      const triggers = Number(nextTriggerId) - 1;

      setFunctionCount(Math.max(0, functions));
      setTriggerCount(Math.max(0, triggers));

      // Update performance data
      setPerformanceData(prev => {
        const now = Date.now();
        const newDataPoint = {
          timestamp: now,
          functions,
          triggers,
          gasUsed: Math.floor(Math.random() * 100000) + 50000 // Simulated for demo
        };

        const chartData = prev?.chartData || [];
        const updatedChartData = [...chartData, newDataPoint].slice(-20); // Keep last 20 points

        return {
          tps: Math.floor(Math.random() * 1000) + 500, // Simulated TPS
          avgGas: Math.floor(Math.random() * 50000) + 25000, // Simulated avg gas
          chartData: updatedChartData
        };
      });

    } catch (error) {
      console.error('Error fetching counts:', error);
      setIsConnected(false);
    }
  }, [contract]);

  // Listen for events and update activity feed
  useEffect(() => {
    if (!contract) return;

    const handleFunctionRegistered = (functionId: bigint, owner: string, name: string, wasmHash: string, event: any) => {
      const activity: Activity = {
        id: `func-${functionId.toString()}-${Date.now()}`,
        type: 'function_registered',
        timestamp: Date.now(),
        details: `Function "${name}" registered by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
        txHash: event.transactionHash
      };

      setRecentActivity(prev => [activity, ...prev].slice(0, 10)); // Keep last 10 activities
    };

    const handleTriggerFired = (triggerId: bigint, functionId: bigint, contextData: string, event: any) => {
      const activity: Activity = {
        id: `trigger-${triggerId.toString()}-${Date.now()}`,
        type: 'trigger_fired',
        timestamp: Date.now(),
        details: `Trigger ${triggerId.toString()} fired for function ${functionId.toString()}`,
        txHash: event.transactionHash
      };

      setRecentActivity(prev => [activity, ...prev].slice(0, 10));
    };

    const handleFunctionExecuted = (functionId: bigint, triggerId: bigint, success: boolean, gasUsed: bigint, event: any) => {
      const activity: Activity = {
        id: `exec-${functionId.toString()}-${Date.now()}`,
        type: 'function_executed',
        timestamp: Date.now(),
        details: `Function ${functionId.toString()} ${success ? 'executed successfully' : 'failed'} (${gasUsed.toString()} gas)`,
        txHash: event.transactionHash
      };

      setRecentActivity(prev => [activity, ...prev].slice(0, 10));
    };

    // Set up event listeners
    contract.on('FunctionRegistered', handleFunctionRegistered);
    contract.on('TriggerFired', handleTriggerFired);
    contract.on('FunctionExecuted', handleFunctionExecuted);

    return () => {
      contract.removeAllListeners();
    };
  }, [contract]);

  // Polling for updates
  useEffect(() => {
    if (!isConnected) return;

    fetchCounts(); // Initial fetch

    const interval = setInterval(fetchCounts, CONFIG.pollInterval);

    return () => clearInterval(interval);
  }, [isConnected, fetchCounts]);

  return {
    functionCount,
    triggerCount,
    isConnected,
    isLoading,
    performanceData,
    recentActivity,
    refetch: fetchCounts
  };
};
