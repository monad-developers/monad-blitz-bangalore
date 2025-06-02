import React, { useState } from 'react';
import styled from 'styled-components';
import { LiveMetrics } from '../../services/MetricsService';

const MetricsContainer = styled.div`
  background: rgba(26, 27, 38, 0.6);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const MetricsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MetricsTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) => isActive ? 'rgba(138, 112, 255, 0.15)' : 'transparent'};
  border: 1px solid ${({ isActive }) => isActive ? 'rgba(138, 112, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ isActive }) => isActive ? '#8A70FF' : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ isActive }) => isActive ? 'rgba(138, 112, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
    color: ${({ isActive }) => isActive ? '#8A70FF' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

const MetricsContent = styled.div`
  margin-top: 12px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 16px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const ProgressValue = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarInner = styled.div<{ 
  width: number; 
  color: string;
  animated?: boolean;
}>`
  height: 100%;
  width: ${props => `${props.width}%`};
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 1s ease-in-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.animated && `
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
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `}
`;

const MetricGroup = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
`;

const MetricGroupTitle = styled.h3`
  color: #8A70FF;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
`;

const PlaceholderChart = styled.div`
  width: 100%;
  height: 180px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  margin: 12px 0;
  border: 1px dashed rgba(255, 255, 255, 0.1);
`;

const WaitingMessage = styled.div`
  width: 100%;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(138, 112, 255, 0.1);
  border-top: 3px solid #8A70FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface PerformanceMetricsProps {
  metrics: LiveMetrics;
}

type TabType = 'overview' | 'gas' | 'timing';

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Helper function to format values
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };
  
  const formatTime = (ms: number): string => {
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms.toFixed(0)}ms`;
  };
  
  const renderOverviewTab = () => (
    <>
      <ProgressContainer>
        <ProgressHeader>
          <ProgressLabel>Success Rate</ProgressLabel>
          <ProgressValue>{metrics.execution.successRate.toFixed(1)}%</ProgressValue>
        </ProgressHeader>
        <ProgressBarOuter>
          <ProgressBarInner 
            width={metrics.execution.successRate} 
            color="#4ECDC4"
            animated
          />
        </ProgressBarOuter>
      </ProgressContainer>
      
      <ProgressContainer>
        <ProgressHeader>
          <ProgressLabel>Failure Rate</ProgressLabel>
          <ProgressValue>{metrics.execution.failureRate.toFixed(1)}%</ProgressValue>
        </ProgressHeader>
        <ProgressBarOuter>
          <ProgressBarInner 
            width={metrics.execution.failureRate} 
            color="#FF6B6B"
            animated
          />
        </ProgressBarOuter>
      </ProgressContainer>
      
      <PlaceholderChart>
        Success/Failure Trend Chart
      </PlaceholderChart>
      
      <MetricsGrid>
        <MetricGroup>
          <MetricGroupTitle>Function Performance</MetricGroupTitle>
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Total Executions</ProgressLabel>
              <ProgressValue>{metrics.execution.totalExecutions}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.execution.totalExecutions / 10)} 
                color="#8A70FF"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Successful Executions</ProgressLabel>
              <ProgressValue>{metrics.execution.successfulExecutions}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.execution.successfulExecutions / 10)} 
                color="#4ECDC4"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Failed Executions</ProgressLabel>
              <ProgressValue>{metrics.execution.failedExecutions}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.execution.failedExecutions / 10)} 
                color="#FF6B6B"
              />
            </ProgressBarOuter>
          </ProgressContainer>
        </MetricGroup>
        
        <MetricGroup>
          <MetricGroupTitle>System Health</MetricGroupTitle>
          <PlaceholderChart>
            System Health Indicators
          </PlaceholderChart>
        </MetricGroup>
      </MetricsGrid>
    </>
  );
  
  const renderGasTab = () => (
    <>
      <PlaceholderChart>
        Gas Usage Trend Chart
      </PlaceholderChart>
      
      <MetricsGrid>
        <MetricGroup>
          <MetricGroupTitle>Gas Metrics</MetricGroupTitle>
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Total Gas Used</ProgressLabel>
              <ProgressValue>{formatNumber(Number(metrics.gas.totalGasUsed))}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={100} 
                color="#FFD93D"
                animated
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Avg Gas Per Function</ProgressLabel>
              <ProgressValue>{formatNumber(metrics.gas.avgGasPerFunction)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.gas.avgGasPerFunction / 1000000 * 100)} 
                color="#FFD93D"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Avg Gas Per Execution</ProgressLabel>
              <ProgressValue>{formatNumber(metrics.gas.avgGasPerExecution)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.gas.avgGasPerExecution / 1000000 * 100)} 
                color="#FFD93D"
              />
            </ProgressBarOuter>
          </ProgressContainer>
        </MetricGroup>
        
        <MetricGroup>
          <MetricGroupTitle>Cost Analysis</MetricGroupTitle>
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Total Cost (ETH)</ProgressLabel>
              <ProgressValue>{metrics.gas.totalCostETH.toFixed(6)} ETH</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.gas.totalCostETH * 1000)} 
                color="#00D4FF"
                animated
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Gas Price</ProgressLabel>
              <ProgressValue>{Number(metrics.gas.gasPrice).toString()} wei</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, Number(metrics.gas.gasPrice) / 100000000000 * 100)} 
                color="#00D4FF"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <PlaceholderChart>
            Cost Projection Chart
          </PlaceholderChart>
        </MetricGroup>
      </MetricsGrid>
    </>
  );
  
  const renderTimingTab = () => (
    <>
      <PlaceholderChart>
        Execution Time Trend Chart
      </PlaceholderChart>
      
      <MetricsGrid>
        <MetricGroup>
          <MetricGroupTitle>Execution Timing</MetricGroupTitle>
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Total Time</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.totalTime)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={100} 
                color="#8A70FF"
                animated
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Avg Time Per Function</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.avgTimePerFunction)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.timing.avgTimePerFunction / 1000 * 100)} 
                color="#8A70FF"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Avg Time Per Trigger</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.avgTimePerTrigger)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.timing.avgTimePerTrigger / 1000 * 100)} 
                color="#8A70FF"
              />
            </ProgressBarOuter>
          </ProgressContainer>
        </MetricGroup>
        
        <MetricGroup>
          <MetricGroupTitle>Performance Breakdown</MetricGroupTitle>
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Registration Time</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.registrationTime)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.timing.registrationTime / metrics.timing.totalTime * 100)} 
                color="#4ECDC4"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Trigger Setup Time</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.triggerSetupTime)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.timing.triggerSetupTime / metrics.timing.totalTime * 100)} 
                color="#4ECDC4"
              />
            </ProgressBarOuter>
          </ProgressContainer>
          
          <ProgressContainer>
            <ProgressHeader>
              <ProgressLabel>Execution Time</ProgressLabel>
              <ProgressValue>{formatTime(metrics.timing.executionTime)}</ProgressValue>
            </ProgressHeader>
            <ProgressBarOuter>
              <ProgressBarInner 
                width={Math.min(100, metrics.timing.executionTime / metrics.timing.totalTime * 100)} 
                color="#4ECDC4"
                animated
              />
            </ProgressBarOuter>
          </ProgressContainer>
        </MetricGroup>
      </MetricsGrid>
    </>
  );
  
  const renderActiveTab = () => {
    if (metrics.execution.totalExecutions === 0) {
      return (
        <WaitingMessage>
          <Spinner />
          <div>Waiting for performance data...</div>
        </WaitingMessage>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'gas':
        return renderGasTab();
      case 'timing':
        return renderTimingTab();
      default:
        return renderOverviewTab();
    }
  };
  
  return (
    <MetricsContainer>
      <MetricsHeader>
        <MetricsTitle>Performance Metrics</MetricsTitle>
        <TabsContainer>
          <Tab 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Tab>
          <Tab 
            isActive={activeTab === 'gas'} 
            onClick={() => setActiveTab('gas')}
          >
            Gas & Cost
          </Tab>
          <Tab 
            isActive={activeTab === 'timing'} 
            onClick={() => setActiveTab('timing')}
          >
            Timing
          </Tab>
        </TabsContainer>
      </MetricsHeader>
      
      <MetricsContent>
        {renderActiveTab()}
      </MetricsContent>
    </MetricsContainer>
  );
};

export default PerformanceMetrics; 