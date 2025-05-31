import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
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

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

const shimmerAnim = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const PanelContainer = styled.div<{ isCollapsed: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => props.isCollapsed ? '60px' : '420px'};
  max-height: 85vh;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 112, 255, 0.3);
  border-radius: 16px;
  z-index: 1000;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  background: linear-gradient(90deg, rgba(26, 27, 38, 0.8) 0%, rgba(10, 10, 15, 0.8) 100%);
`;

const Title = styled.h3`
  background: linear-gradient(90deg, #8A70FF 0%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const CollapseButton = styled.button`
  background: rgba(138, 112, 255, 0.1);
  border: none;
  color: #8a70ff;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(138, 112, 255, 0.2);
    transform: scale(1.1);
  }
`;

const PanelContent = styled.div<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  padding: 16px;
  max-height: calc(85vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(138, 112, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 112, 255, 0.5);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const MetricLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 500;
`;

const MetricValue = styled.div<{ color?: string }>`
  color: ${props => props.color || '#ffffff'};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
`;

const Section = styled.div`
  margin-bottom: 24px;
  animation: ${slideIn} 0.3s ease-out;
`;

const SectionTitle = styled.h4`
  color: #8a70ff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #8A70FF 0%, transparent 100%);
    border-radius: 1px;
  }
`;

const ProgressBarContainer = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
`;

const ProgressBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const ProgressBarTitle = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`;

const ProgressBarValue = styled.span`
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const shimmerAnimation = css`
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%);
    animation: ${shimmerAnim} 2s infinite;
  }
`;

const ProgressBarInner = styled.div<{ 
  width: number; 
  color: string; 
  animated?: boolean;
}>`
  height: 100%;
  width: ${props => `${props.width}%`};
  background: ${props => props.color};
  border-radius: 3px;
  transition: width 1s ease-in-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.animated && shimmerAnimation}
`;

const ExecutionList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(138, 112, 255, 0.3);
    border-radius: 2px;
  }
`;

const ExecutionItem = styled.div<{ success: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border-left: 3px solid ${props => props.success ? '#4ecdc4' : '#ff6b6b'};
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(3px);
  }
`;

const ExecutionInfo = styled.div`
  flex: 1;
`;

const ExecutionId = styled.div`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
`;

const ExecutionDetails = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-top: 4px;
`;

const ExecutionLink = styled.a`
  color: #8a70ff;
  text-decoration: none;
  font-size: 12px;
  background: rgba(138, 112, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(138, 112, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  animation: ${props => props.status === 'live' ? css`${pulse} 2s infinite` : 'none'};
`;

const RefreshButton = styled.button`
  background: rgba(138, 112, 255, 0.1);
  border: 1px solid rgba(138, 112, 255, 0.3);
  color: #8a70ff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(138, 112, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
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
        {!isCollapsed && <Title>Live Performance Dashboard</Title>}
        <CollapseButton>
          {isCollapsed ? '📊' : '−'}
        </CollapseButton>
      </PanelHeader>

      <PanelContent isCollapsed={isCollapsed}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <StatusIndicator status={status}>
            <StatusDot status={status} />
            {status === 'live' && 'Live Data'}
            {status === 'updating' && 'Updating...'}
            {status === 'error' && 'Error'}
          </StatusIndicator>
          <RefreshButton onClick={handleRefresh}>
            <span>↻</span> Refresh
          </RefreshButton>
        </div>

        <Section>
          <SectionTitle>Overall Metrics</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Total Functions</MetricLabel>
              <MetricValue color="#00d4ff">{metrics.execution.totalFunctions}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Active Triggers</MetricLabel>
              <MetricValue color="#ff6b6b">{metrics.execution.totalTriggers}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Total Executions</MetricLabel>
              <MetricValue color="#4ecdc4">{metrics.execution.totalExecutions}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Success Rate</MetricLabel>
              <MetricValue color="#4ecdc4">
                {formatPercentage(metrics.execution.successRate)}
              </MetricValue>
            </MetricCard>
          </MetricsGrid>
          
          <ProgressBarContainer>
            <ProgressBarLabel>
              <ProgressBarTitle>Success Rate</ProgressBarTitle>
              <ProgressBarValue>{formatPercentage(metrics.execution.successRate)}</ProgressBarValue>
            </ProgressBarLabel>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={metrics.execution.successRate} 
                color="#4ecdc4" 
                animated
              />
            </ProgressBarOuter>
          </ProgressBarContainer>
          
          <ProgressBarContainer>
            <ProgressBarLabel>
              <ProgressBarTitle>Failure Rate</ProgressBarTitle>
              <ProgressBarValue>{formatPercentage(metrics.execution.failureRate)}</ProgressBarValue>
            </ProgressBarLabel>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={metrics.execution.failureRate} 
                color="#ff6b6b" 
                animated
              />
            </ProgressBarOuter>
          </ProgressBarContainer>
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
          <SectionTitle>Performance</SectionTitle>
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
          
          <ProgressBarContainer>
            <ProgressBarLabel>
              <ProgressBarTitle>Execution Time</ProgressBarTitle>
              <ProgressBarValue>{formatTime(metrics.timing.executionTime)}</ProgressBarValue>
            </ProgressBarLabel>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={100} 
                color="#8a70ff" 
                animated
              />
            </ProgressBarOuter>
          </ProgressBarContainer>
        </Section>

        <Section>
          <SectionTitle>Recent Executions</SectionTitle>
          {metrics.recentExecutions.length > 0 ? (
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
            </ExecutionList>
          ) : (
            <EmptyState>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px', opacity: 0.6 }}>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>No executions yet. Deploy functions or run demos to see live updates.</div>
            </EmptyState>
          )}
        </Section>
      </PanelContent>
    </PanelContainer>
  );
};

export default MetricsPanel;
