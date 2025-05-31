import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MetricsService, { LiveMetrics } from '../../services/MetricsService';
import EtherscanService from '../../utils/etherscan';

// Helper functions for formatting
const formatGas = (gas: bigint | number): string => {
  const gasNum = typeof gas === 'bigint' ? Number(gas) : gas;
  if (gasNum >= 1e9) return `${(gasNum / 1e9).toFixed(2)}B`;
  if (gasNum >= 1e6) return `${(gasNum / 1e6).toFixed(2)}M`;
  if (gasNum >= 1e3) return `${(gasNum / 1e3).toFixed(2)}K`;
  return gasNum.toLocaleString();
};

const formatETH = (eth: number): string => {
  if (eth >= 1) return `${eth.toFixed(4)} ETH`;
  if (eth >= 0.001) return `${eth.toFixed(6)} ETH`;
  return `${(eth * 1e18).toFixed(0)} wei`;
};

const formatTime = (ms: number): string => {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms.toFixed(0)}ms`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const PanelContainer = styled.div<{ isCollapsed: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => props.isCollapsed ? '60px' : '400px'};
  max-height: 80vh;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 112, 255, 0.3);
  border-radius: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
`;

const Title = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #8a70ff;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(138, 112, 255, 0.1);
  }
`;

const PanelContent = styled.div<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
`;

const MetricValue = styled.div<{ color?: string }>`
  color: ${props => props.color || '#ffffff'};
  font-size: 16px;
  font-weight: 600;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  color: #8a70ff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ExecutionList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const ExecutionItem = styled.div<{ success: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border-left: 3px solid ${props => props.success ? '#4ecdc4' : '#ff6b6b'};
`;

const ExecutionInfo = styled.div`
  flex: 1;
`;

const ExecutionId = styled.div`
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
`;

const ExecutionDetails = styled.div`
  color: #888;
  font-size: 10px;
  margin-top: 2px;
`;

const ExecutionLink = styled.a`
  color: #8a70ff;
  text-decoration: none;
  font-size: 12px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusIndicator = styled.div<{ status: 'live' | 'updating' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => {
    switch (props.status) {
      case 'live': return '#4ecdc4';
      case 'updating': return '#ffd93d';
      case 'error': return '#ff6b6b';
      default: return '#888';
    }
  }};
`;

const StatusDot = styled.div<{ status: 'live' | 'updating' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'live': return '#4ecdc4';
      case 'updating': return '#ffd93d';
      case 'error': return '#ff6b6b';
      default: return '#888';
    }
  }};
  animation: ${props => props.status === 'live' ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const RefreshButton = styled.button`
  background: rgba(138, 112, 255, 0.1);
  border: 1px solid rgba(138, 112, 255, 0.3);
  color: #8a70ff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(138, 112, 255, 0.2);
  }
`;

interface MetricsPanelProps {
  chainId?: number;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ chainId = 10143 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>(MetricsService.getMetrics());
  const [status, setStatus] = useState<'live' | 'updating' | 'error'>('live');
  const etherscanService = new EtherscanService(chainId);

  useEffect(() => {
    const unsubscribe = MetricsService.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setStatus('live');
    });

    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    setStatus('updating');
    // Simulate refresh delay
    setTimeout(() => setStatus('live'), 1000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <PanelContainer isCollapsed={isCollapsed}>
      <PanelHeader onClick={() => setIsCollapsed(!isCollapsed)}>
        {!isCollapsed && <Title>Live Metrics</Title>}
        <CollapseButton>
          {isCollapsed ? '📊' : '−'}
        </CollapseButton>
      </PanelHeader>

      <PanelContent isCollapsed={isCollapsed}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <StatusIndicator status={status}>
            <StatusDot status={status} />
            {status === 'live' && 'Live'}
            {status === 'updating' && 'Updating...'}
            {status === 'error' && 'Error'}
          </StatusIndicator>
          <RefreshButton onClick={handleRefresh}>
            Refresh
          </RefreshButton>
        </div>

        <Section>
          <SectionTitle>Overall Metrics</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Functions</MetricLabel>
              <MetricValue color="#00d4ff">{metrics.execution.totalFunctions}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Triggers</MetricLabel>
              <MetricValue color="#ff6b6b">{metrics.execution.totalTriggers}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Executions</MetricLabel>
              <MetricValue color="#4ecdc4">{metrics.execution.totalExecutions}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Success Rate</MetricLabel>
              <MetricValue color="#4ecdc4">
                {formatPercentage(metrics.execution.successRate)}
              </MetricValue>
            </MetricCard>
          </MetricsGrid>
        </Section>

        <Section>
          <SectionTitle>Gas & Cost</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Total Gas</MetricLabel>
              <MetricValue color="#ffd93d">
                {formatGas(metrics.gas.totalGasUsed)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Total Cost</MetricLabel>
              <MetricValue color="#ffd93d">
                {formatETH(metrics.gas.totalCostETH)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg Gas/Exec</MetricLabel>
              <MetricValue>
                {formatGas(metrics.gas.avgGasPerExecution)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Gas Price</MetricLabel>
              <MetricValue>
                {EtherscanService.formatGasPrice(metrics.gas.gasPrice.toString())}
              </MetricValue>
            </MetricCard>
          </MetricsGrid>
        </Section>

        <Section>
          <SectionTitle>Timing</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Total Time</MetricLabel>
              <MetricValue color="#8a70ff">
                {formatTime(metrics.timing.totalTime)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg/Function</MetricLabel>
              <MetricValue>
                {formatTime(metrics.timing.avgTimePerFunction)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg/Trigger</MetricLabel>
              <MetricValue>
                {formatTime(metrics.timing.avgTimePerTrigger)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg/Execution</MetricLabel>
              <MetricValue>
                {formatTime(metrics.timing.avgTimePerExecution)}
              </MetricValue>
            </MetricCard>
          </MetricsGrid>
        </Section>

        <Section>
          <SectionTitle>Recent Executions</SectionTitle>
          <ExecutionList>
            {metrics.recentExecutions.map((execution) => (
              <ExecutionItem key={execution.id} success={execution.success}>
                <ExecutionInfo>
                  <ExecutionId>
                    Function {execution.functionId} → Trigger {execution.triggerId}
                  </ExecutionId>
                  <ExecutionDetails>
                    {formatGas(execution.gasUsed)} gas • {formatTimeAgo(execution.timestamp)}
                  </ExecutionDetails>
                </ExecutionInfo>
                <ExecutionLink
                  href={etherscanService.getTransactionUrl(execution.txHash, chainId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </ExecutionLink>
              </ExecutionItem>
            ))}
            {metrics.recentExecutions.length === 0 && (
              <div style={{ color: '#888', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                No executions yet
              </div>
            )}
          </ExecutionList>
        </Section>
      </PanelContent>
    </PanelContainer>
  );
};

export default MetricsPanel;
