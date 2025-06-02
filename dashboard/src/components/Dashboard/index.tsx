import React from 'react';
import styled from 'styled-components';
import { LiveMetrics } from '../../services/MetricsService';
import StatsCards from './StatsCards';
import PerformanceMetrics from './PerformanceMetrics';
import LiveActivityFeed from './LiveActivityFeed';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const DashboardHeader = styled.div`
  grid-column: span 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DashboardTitle = styled.h1`
  background: linear-gradient(90deg, #8A70FF 0%, #5C55DF 50%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`;

const DashboardSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0.5rem 0 0;
  max-width: 600px;
`;

const ConnectionStatus = styled.div<{ isConnected: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ isConnected }) => 
    isConnected ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
  border: 1px solid ${({ isConnected }) => 
    isConnected ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 107, 107, 0.3)'};
  border-radius: 30px;
  padding: 6px 16px;
  font-size: 0.875rem;
  color: ${({ isConnected }) => 
    isConnected ? '#4ECDC4' : '#FF6B6B'};
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 50%;
    background: ${({ isConnected }) => 
      isConnected ? '#4ECDC4' : '#FF6B6B'};
    animation: ${({ isConnected }) => 
      isConnected ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

const MainContent = styled.div`
  grid-column: span 8;
  display: grid;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const Sidebar = styled.div`
  grid-column: span 4;
  
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

interface DashboardProps {
  metrics: LiveMetrics;
  isConnected?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  metrics, 
  isConnected = true 
}) => {
  return (
    <DashboardContainer>
      <DashboardHeader>
        <div>
          <DashboardTitle>Live Performance Dashboard</DashboardTitle>
          <DashboardSubtitle>
            Real-time monitoring of MonadFaas function deployments, executions,
            and network performance metrics
          </DashboardSubtitle>
        </div>
        <ConnectionStatus isConnected={isConnected}>
          {isConnected ? 'Connected to Network' : 'Disconnected from Network'}
        </ConnectionStatus>
      </DashboardHeader>
      
      <MainContent>
        <StatsCards metrics={metrics} />
        <PerformanceMetrics metrics={metrics} />
      </MainContent>
      
      <Sidebar>
        <LiveActivityFeed executions={metrics.recentExecutions} />
      </Sidebar>
    </DashboardContainer>
  );
};

export default Dashboard; 