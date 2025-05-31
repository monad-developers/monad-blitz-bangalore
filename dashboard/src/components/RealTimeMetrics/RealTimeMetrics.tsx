import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface MetricsData {
  execution: {
    totalFunctions: number;
    totalTriggers: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalGasUsed: string;
    totalCostETH: number;
    averageExecutionTime: number;
    successRate: number;
    failureRate: number;
  };
  gas: {
    totalGasUsed: string;
    totalCostETH: number;
    avgGasPerFunction: number;
    avgGasPerTrigger: number;
    avgGasPerExecution: number;
    gasPrice: string;
  };
  timing: {
    totalTime: number;
    avgTimePerFunction: number;
    avgTimePerTrigger: number;
    avgTimePerExecution: number;
    registrationTime: number;
    triggerSetupTime: number;
    executionTime: number;
  };
  recentExecutions: Array<{
    id: string;
    functionId: number;
    triggerId: number;
    txHash: string;
    gasUsed: number;
    success: boolean;
    executionTime: number;
    timestamp: number;
  }>;
  lastUpdated: number;
}

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #a0a0a0;
  margin-bottom: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #667eea;
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #667eea;
`;

const StatusIndicator = styled.div<{ status: 'connected' | 'disconnected' | 'connecting' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'connected':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      case 'disconnected':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        `;
      case 'connecting':
        return `
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        `;
    }
  }}
`;

const StatusDot = styled.div<{ status: 'connected' | 'disconnected' | 'connecting' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${props => {
    switch (props.status) {
      case 'connected':
        return `background: #22c55e; animation: pulse 2s infinite;`;
      case 'disconnected':
        return `background: #ef4444;`;
      case 'connecting':
        return `background: #fbbf24; animation: pulse 1s infinite;`;
    }
  }}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [historicalData, setHistoricalData] = useState<Array<any>>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
  };

  // Format gas values
  const formatGas = (gasString: string): string => {
    const gas = parseInt(gasString || '0');
    return formatNumber(gas);
  };

  // Format ETH values
  const formatETH = (eth: number): string => {
    return eth.toFixed(6);
  };

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws');
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('🔌 Connected to metrics WebSocket');
        setConnectionStatus('connected');
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'metrics_update') {
            setMetrics(data.data);
            
            // Add to historical data for charts
            setHistoricalData(prev => {
              const newData = [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                executions: data.data.execution.totalExecutions,
                gasUsed: parseInt(data.data.gas.totalGasUsed) / 1e6, // Convert to millions
                successRate: data.data.execution.successRate
              }];
              
              // Keep only last 20 data points
              return newData.slice(-20);
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      websocket.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          setConnectionStatus('connecting');
          connectWebSocket();
        }, 3000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
      
      setWs(websocket);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  // Fetch initial metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Reset metrics
  const resetMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics/reset`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setHistoricalData([]);
        console.log('Metrics reset successfully');
      }
    } catch (error) {
      console.error('Failed to reset metrics:', error);
    }
  };

  // Start demo
  const startDemo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numFunctions: 20, enableMetrics: true })
      });
      const data = await response.json();
      if (data.success) {
        console.log('Demo started successfully');
      }
    } catch (error) {
      console.error('Failed to start demo:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  if (!metrics) {
    return (
      <Container>
        <Header>
          <Title>Loading Metrics...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🚀 Monad FaaS Real-Time Metrics</Title>
        <Subtitle>Live serverless function analytics, parallel execution monitoring, and blockchain performance dashboard</Subtitle>
        <StatusIndicator status={connectionStatus}>
          <StatusDot status={connectionStatus} />
          {connectionStatus === 'connected' && 'Live Connected'}
          {connectionStatus === 'disconnected' && 'Disconnected'}
          {connectionStatus === 'connecting' && 'Connecting...'}
        </StatusIndicator>
      </Header>

      <ControlPanel>
        <Button className="primary" onClick={startDemo}>
          🚀 Start Demo
        </Button>
        <Button className="secondary" onClick={resetMetrics}>
          🔄 Reset Metrics
        </Button>
        <Button className="secondary" onClick={fetchMetrics}>
          📊 Refresh Data
        </Button>
      </ControlPanel>

      <MetricsGrid>
        {/* Execution Metrics */}
        <MetricCard>
          <CardTitle>📊 Execution Stats</CardTitle>
          <MetricValue>{metrics.execution.totalFunctions}</MetricValue>
          <MetricLabel>Total Functions Deployed</MetricLabel>
          <div style={{ marginTop: '1rem' }}>
            <div>Triggers: {metrics.execution.totalTriggers}</div>
            <div>Executions: {metrics.execution.totalExecutions}</div>
            <div>Success Rate: {metrics.execution.successRate.toFixed(1)}%</div>
          </div>
        </MetricCard>

        {/* Gas Metrics */}
        <MetricCard>
          <CardTitle>⛽ Gas & Cost Stats</CardTitle>
          <MetricValue>{formatGas(metrics.gas.totalGasUsed)}</MetricValue>
          <MetricLabel>Total Gas Used</MetricLabel>
          <div style={{ marginTop: '1rem' }}>
            <div>Total Cost: {formatETH(metrics.gas.totalCostETH)} ETH</div>
            <div>Avg Gas/Function: {formatNumber(metrics.gas.avgGasPerFunction)}</div>
            <div>Avg Gas/Execution: {formatNumber(metrics.gas.avgGasPerExecution)}</div>
          </div>
        </MetricCard>

        {/* Timing Metrics */}
        <MetricCard>
          <CardTitle>⏱️ Performance Timing</CardTitle>
          <MetricValue>{metrics.timing.avgTimePerExecution.toFixed(0)}ms</MetricValue>
          <MetricLabel>Avg Execution Time</MetricLabel>
          <div style={{ marginTop: '1rem' }}>
            <div>Avg Function Deploy: {metrics.timing.avgTimePerFunction.toFixed(0)}ms</div>
            <div>Avg Trigger Setup: {metrics.timing.avgTimePerTrigger.toFixed(0)}ms</div>
            <div>Total Runtime: {(metrics.timing.totalTime / 1000).toFixed(1)}s</div>
          </div>
        </MetricCard>

        {/* Success Metrics */}
        <MetricCard>
          <CardTitle>✅ Success Metrics</CardTitle>
          <MetricValue>{metrics.execution.successRate.toFixed(1)}%</MetricValue>
          <MetricLabel>Success Rate</MetricLabel>
          <div style={{ marginTop: '1rem' }}>
            <div>Successful: {metrics.execution.successfulExecutions}</div>
            <div>Failed: {metrics.execution.failedExecutions}</div>
            <div>Failure Rate: {metrics.execution.failureRate.toFixed(1)}%</div>
          </div>
        </MetricCard>
      </MetricsGrid>

      {/* Charts */}
      {historicalData.length > 0 && (
        <>
          <ChartContainer>
            <ChartTitle>📈 Execution Trends</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="executions" stroke="#667eea" strokeWidth={3} />
                <Line type="monotone" dataKey="successRate" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer>
            <ChartTitle>⛽ Gas Usage Over Time</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="gasUsed" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}
    </Container>
  );
};

export default RealTimeMetrics;
