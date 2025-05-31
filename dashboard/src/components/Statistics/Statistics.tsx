import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useBlockchainData } from '../../hooks/useBlockchainData';
import MetricsCard from './MetricsCard';
import PerformanceChart from './PerformanceChart';
import LiveFeed from './LiveFeed';

const StatisticsContainer = styled.section`
  position: relative;
  padding: 120px 0;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  z-index: 2;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 80px;
`;

const Title = styled.h2`
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff 0%, #ff6b6b 50%, #4ecdc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatusIndicator = styled.div<{ status: 'online' | 'offline' | 'loading' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  
  background: ${props => {
    switch (props.status) {
      case 'online': return 'rgba(76, 175, 80, 0.2)';
      case 'offline': return 'rgba(244, 67, 54, 0.2)';
      case 'loading': return 'rgba(255, 193, 7, 0.2)';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'online': return '#4caf50';
      case 'offline': return '#f44336';
      case 'loading': return '#ffc107';
    }
  }};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: ${props => props.status === 'loading' ? 'pulse 1.5s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Statistics: React.FC = () => {
  const { 
    functionCount, 
    triggerCount, 
    isConnected, 
    isLoading, 
    performanceData,
    recentActivity 
  } = useBlockchainData();

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  useEffect(() => {
    if (isLoading) {
      setConnectionStatus('loading');
    } else if (isConnected) {
      setConnectionStatus('online');
    } else {
      setConnectionStatus('offline');
    }
  }, [isConnected, isLoading]);

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'Connected to Monad Testnet';
      case 'offline': return 'Disconnected from Network';
      case 'loading': return 'Connecting to Blockchain...';
    }
  };

  return (
    <StatisticsContainer id="statistics">
      <Container>
        <Header>
          <StatusIndicator status={connectionStatus}>
            {getStatusText()}
          </StatusIndicator>
          <Title>Live Performance Dashboard</Title>
          <Subtitle>
            Real-time monitoring of MonadFaas function deployments, executions, and network performance metrics
          </Subtitle>
        </Header>

        <MetricsGrid>
          <MetricsCard
            title="Total Functions"
            value={functionCount}
            subtitle="Deployed on-chain"
            trend="+12% from last hour"
            icon="⚡"
            color="#00d4ff"
          />
          <MetricsCard
            title="Active Triggers"
            value={triggerCount}
            subtitle="Monitoring events"
            trend="+8% from last hour"
            icon="🎯"
            color="#ff6b6b"
          />
          <MetricsCard
            title="Network TPS"
            value={performanceData?.tps || 0}
            subtitle="Transactions per second"
            trend="Real-time"
            icon="🚀"
            color="#4ecdc4"
          />
          <MetricsCard
            title="Avg Gas Cost"
            value={performanceData?.avgGas || 0}
            subtitle="Wei per transaction"
            trend="-5% from yesterday"
            icon="⛽"
            color="#ffd93d"
          />
        </MetricsGrid>

        <ChartsSection>
          <PerformanceChart data={performanceData?.chartData || []} />
          <LiveFeed activities={recentActivity || []} />
        </ChartsSection>
      </Container>
    </StatisticsContainer>
  );
};

export default Statistics;
