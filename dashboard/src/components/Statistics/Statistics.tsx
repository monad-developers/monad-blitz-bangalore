import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useBlockchainData } from '../../hooks/useBlockchainData';
import MetricsCard from './MetricsCard';
import PerformanceChart from './PerformanceChart';
import LiveFeed from './LiveFeed';

const StatisticsContainer = styled.section`
  position: relative;
  padding: 120px 0;
  background: linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%);
  z-index: 2;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 10%, rgba(138, 112, 255, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 90%, rgba(0, 212, 255, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(30, 30, 50, 0.8) 0%, rgba(15, 15, 25, 1) 100%);
    z-index: -1;
  }
`;

const BackgroundGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(138, 112, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 112, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: -1;
  opacity: 0.6;
`;

const BackgroundDots = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(138, 112, 255, 0.2) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: -1;
  opacity: 0.1;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 80px;
  opacity: 1;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 50%;
    width: 150px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(138, 112, 255, 0.5), transparent);
    transform: translateX(-50%);
  }
`;

const TitleContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
`;

const TitleGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  filter: blur(40px);
  opacity: 0.5;
  z-index: -1;
`;

const TitleWord = styled.span`
  display: inline-block;
  margin-right: 15px;
  position: relative;
  
  &:first-child {
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #00d4ff 0%, #4ecdc4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 5px 30px rgba(0, 212, 255, 0.5);
  }
`;

const Title = styled.h2`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  position: relative;
  display: inline-block;
  text-shadow: 0 5px 30px rgba(0, 212, 255, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #00d4ff, #4ecdc4);
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2px;
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const DashboardText = styled.span`
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  margin-top: 30px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 3px;
    border-radius: 3px;
    background: rgba(138, 112, 255, 0.3);
    top: 50%;
  }
  
  &::before {
    left: -60px;
  }
  
  &::after {
    right: -60px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  perspective: 1000px;
  position: relative;
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (min-width: 768px) and (max-width: 991px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const StatusBadge = styled.div<{ status: 'online' | 'offline' | 'loading' }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  background: ${props => {
    switch (props.status) {
      case 'online': return 'rgba(76, 175, 80, 0.15)';
      case 'offline': return 'rgba(244, 67, 54, 0.15)';
      case 'loading': return 'rgba(255, 193, 7, 0.15)';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'online': return '#4caf50';
      case 'offline': return '#f44336';
      case 'loading': return '#ffc107';
    }
  }};
  
  backdrop-filter: blur(10px);
  border: 1px solid ${props => {
    switch (props.status) {
      case 'online': return 'rgba(76, 175, 80, 0.3)';
      case 'offline': return 'rgba(244, 67, 54, 0.3)';
      case 'loading': return 'rgba(255, 193, 7, 0.3)';
    }
  }};
  
  &:hover {
    transform: translateX(-50%) translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 10px currentColor;
  }
`;

const FloatingIcon = styled.div`
  position: absolute;
  opacity: 0.1;
  font-size: 200px;
  z-index: -1;
  
  &.icon-1 {
    top: 50px;
    left: -100px;
    transform: rotate(-15deg);
    color: rgba(0, 212, 255, 0.5);
    filter: blur(3px);
  }
  
  &.icon-2 {
    bottom: 100px;
    right: -50px;
    transform: rotate(15deg);
    color: rgba(138, 112, 255, 0.5);
    filter: blur(2px);
  }
  
  &.icon-3 {
    top: 40%;
    left: 10%;
    font-size: 120px;
    color: rgba(255, 107, 107, 0.4);
    transform: rotate(10deg);
    filter: blur(1px);
  }
`;

const DashboardHighlight = styled.span`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, #ff6b6b20, #4ecdc420);
    z-index: -1;
    border-radius: 5px;
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
      <BackgroundGrid />
      <BackgroundDots />
      <FloatingIcon className="icon-1">⚡</FloatingIcon>
      <FloatingIcon className="icon-2">🚀</FloatingIcon>
      <FloatingIcon className="icon-3">⛓️</FloatingIcon>
      
      <StatusBadge status={connectionStatus}>
        {getStatusText()}
      </StatusBadge>
      
      <Container>
        <Header>
          <TitleContainer>
            <TitleGlow />
            <Title>
              <TitleWord>Live</TitleWord>
              <DashboardText>Performance Dashboard</DashboardText>
            </Title>
          </TitleContainer>
          <Subtitle>
            Real-time monitoring of Monad FaaS serverless functions, parallel executions, and blockchain performance metrics
          </Subtitle>
        </Header>

        <MetricsGrid>
          <MetricsCard
            title="Serverless Functions"
            value={functionCount}
            subtitle="WASM/JS functions deployed"
            trend="+12% from last hour"
            icon="⚡"
            color="#00d4ff"
          />
          <MetricsCard
            title="Active Triggers"
            value={triggerCount}
            subtitle="Price alerts & webhooks"
            trend="+8% from last hour"
            icon="🎯"
            color="#ff6b6b"
          />
          <MetricsCard
            title="Parallel Executions"
            value={performanceData?.tps || 0}
            subtitle="Functions per block"
            trend="Real-time"
            icon="🚀"
            color="#4ecdc4"
          />
          <MetricsCard
            title="Gas Efficiency"
            value={performanceData?.avgGas || 0}
            subtitle="Average cost per function"
            trend="-5% optimized"
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
