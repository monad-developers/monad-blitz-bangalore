import { ethers } from 'ethers';

export interface ExecutionMetrics {
  totalFunctions: number;
  totalTriggers: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalGasUsed: bigint;
  totalCostETH: number;
  averageExecutionTime: number;
  successRate: number;
  failureRate: number;
}

export interface GasMetrics {
  totalGasUsed: bigint;
  totalCostETH: number;
  avgGasPerFunction: number;
  avgGasPerTrigger: number;
  avgGasPerExecution: number;
  gasPrice: bigint;
}

export interface TimingMetrics {
  totalTime: number;
  avgTimePerFunction: number;
  avgTimePerTrigger: number;
  avgTimePerExecution: number;
  registrationTime: number;
  triggerSetupTime: number;
  executionTime: number;
}

export interface ExecutionRecord {
  id: string;
  functionId: number;
  triggerId: number;
  txHash: string;
  timestamp: number;
  gasUsed: bigint;
  success: boolean;
  executionTime: number;
  errorMessage?: string;
}

export interface LiveMetrics {
  execution: ExecutionMetrics;
  gas: GasMetrics;
  timing: TimingMetrics;
  recentExecutions: ExecutionRecord[];
  lastUpdated: number;
}

class MetricsService {
  private metrics: LiveMetrics;
  private executionHistory: ExecutionRecord[] = [];
  private startTime: number = Date.now();
  private listeners: ((metrics: LiveMetrics) => void)[] = [];

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): LiveMetrics {
    return {
      execution: {
        totalFunctions: 0,
        totalTriggers: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalGasUsed: BigInt(0),
        totalCostETH: 0,
        averageExecutionTime: 0,
        successRate: 0,
        failureRate: 0,
      },
      gas: {
        totalGasUsed: BigInt(0),
        totalCostETH: 0,
        avgGasPerFunction: 0,
        avgGasPerTrigger: 0,
        avgGasPerExecution: 0,
        gasPrice: BigInt(0),
      },
      timing: {
        totalTime: 0,
        avgTimePerFunction: 0,
        avgTimePerTrigger: 0,
        avgTimePerExecution: 0,
        registrationTime: 0,
        triggerSetupTime: 0,
        executionTime: 0,
      },
      recentExecutions: [],
      lastUpdated: Date.now(),
    };
  }

  // Record a new execution
  recordExecution(execution: Omit<ExecutionRecord, 'id'>) {
    const record: ExecutionRecord = {
      ...execution,
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.executionHistory.push(record);
    this.updateMetrics();
    this.notifyListeners();
  }

  // Record function registration
  recordFunctionRegistration(gasUsed: bigint, executionTime: number) {
    this.metrics.execution.totalFunctions++;
    this.metrics.gas.totalGasUsed += gasUsed;
    this.metrics.timing.registrationTime += executionTime;
    this.updateMetrics();
    this.notifyListeners();
  }

  // Record trigger creation
  recordTriggerCreation(gasUsed: bigint, executionTime: number) {
    this.metrics.execution.totalTriggers++;
    this.metrics.gas.totalGasUsed += gasUsed;
    this.metrics.timing.triggerSetupTime += executionTime;
    this.updateMetrics();
    this.notifyListeners();
  }

  // Update gas price
  updateGasPrice(gasPrice: bigint) {
    this.metrics.gas.gasPrice = gasPrice;
    this.updateMetrics();
    this.notifyListeners();
  }

  // Calculate derived metrics
  private updateMetrics() {
    const { execution, gas, timing } = this.metrics;
    
    // Execution metrics
    execution.totalExecutions = this.executionHistory.length;
    execution.successfulExecutions = this.executionHistory.filter(e => e.success).length;
    execution.failedExecutions = execution.totalExecutions - execution.successfulExecutions;
    execution.successRate = execution.totalExecutions > 0 
      ? (execution.successfulExecutions / execution.totalExecutions) * 100 
      : 0;
    execution.failureRate = 100 - execution.successRate;

    // Gas metrics
    gas.totalGasUsed = this.executionHistory.reduce((sum, e) => sum + e.gasUsed, BigInt(0));
    gas.totalCostETH = Number(ethers.formatEther(gas.totalGasUsed * gas.gasPrice));
    gas.avgGasPerFunction = execution.totalFunctions > 0 
      ? Number(gas.totalGasUsed) / execution.totalFunctions 
      : 0;
    gas.avgGasPerTrigger = execution.totalTriggers > 0 
      ? Number(gas.totalGasUsed) / execution.totalTriggers 
      : 0;
    gas.avgGasPerExecution = execution.totalExecutions > 0 
      ? Number(gas.totalGasUsed) / execution.totalExecutions 
      : 0;

    // Timing metrics
    timing.totalTime = Date.now() - this.startTime;
    timing.avgTimePerFunction = execution.totalFunctions > 0 
      ? timing.registrationTime / execution.totalFunctions 
      : 0;
    timing.avgTimePerTrigger = execution.totalTriggers > 0 
      ? timing.triggerSetupTime / execution.totalTriggers 
      : 0;
    timing.avgTimePerExecution = execution.totalExecutions > 0 
      ? this.executionHistory.reduce((sum, e) => sum + e.executionTime, 0) / execution.totalExecutions 
      : 0;

    // Update recent executions (last 10)
    this.metrics.recentExecutions = this.executionHistory.slice(-10).reverse();
    this.metrics.lastUpdated = Date.now();
  }

  // Get current metrics
  getMetrics(): LiveMetrics {
    return { ...this.metrics };
  }

  // Subscribe to metrics updates
  subscribe(listener: (metrics: LiveMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getMetrics()));
  }

  // Reset metrics
  reset() {
    this.executionHistory = [];
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.notifyListeners();
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.getMetrics(),
      executionHistory: this.executionHistory,
      exportedAt: new Date().toISOString(),
    };
  }

  // Format values for display
  static formatGas(gas: bigint | number): string {
    const gasNum = typeof gas === 'bigint' ? Number(gas) : gas;
    if (gasNum >= 1e9) return `${(gasNum / 1e9).toFixed(2)}B`;
    if (gasNum >= 1e6) return `${(gasNum / 1e6).toFixed(2)}M`;
    if (gasNum >= 1e3) return `${(gasNum / 1e3).toFixed(2)}K`;
    return gasNum.toLocaleString();
  }

  static formatETH(eth: number): string {
    if (eth >= 1) return `${eth.toFixed(4)} ETH`;
    if (eth >= 0.001) return `${eth.toFixed(6)} ETH`;
    return `${(eth * 1e18).toFixed(0)} wei`;
  }

  static formatTime(ms: number): string {
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms.toFixed(0)}ms`;
  }

  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}

const metricsServiceInstance = new MetricsService();
export default metricsServiceInstance;
