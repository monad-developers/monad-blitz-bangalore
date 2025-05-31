import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ExecutionRecord } from '../../services/MetricsService';

const FeedContainer = styled.div`
  background: rgba(26, 27, 38, 0.6);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const FeedTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 50px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #4ECDC4;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #4ECDC4;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  margin-right: -8px;
  padding-right: 8px;
  
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ActivityItem = styled.div<{ success: boolean; isNew?: boolean }>`
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid ${props => props.success ? '#4ECDC4' : '#FF6B6B'};
  position: relative;
  overflow: hidden;
  animation: ${props => props.isNew ? fadeIn : 'none'} 0.5s ease forwards;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.success 
      ? 'radial-gradient(circle at top right, rgba(78, 205, 196, 0.1) 0%, rgba(26, 27, 38, 0) 70%)' 
      : 'radial-gradient(circle at top right, rgba(255, 107, 107, 0.1) 0%, rgba(26, 27, 38, 0) 70%)'
    };
    pointer-events: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ActivityTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const ActivityStatus = styled.span<{ success: boolean }>`
  font-size: 12px;
  color: ${props => props.success ? '#4ECDC4' : '#FF6B6B'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityDetail = styled.div`
  display: flex;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  
  strong {
    margin-right: 5px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
`;

const ActivityActions = styled.div`
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ViewButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(138, 112, 255, 0.1);
  border-radius: 8px;
  color: #8A70FF;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(138, 112, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  padding: 40px 0;
  text-align: center;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.6;
  }
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  max-width: 240px;
  line-height: 1.5;
`;

interface LiveActivityFeedProps {
  executions: ExecutionRecord[];
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ executions }) => {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  // Calculate first view hash for demo purposes
  const getEtherscanUrl = (txHash: string) => {
    return `https://etherscan.io/tx/${txHash}`;
  };
  
  const formatGas = (gas: bigint): string => {
    const num = Number(gas);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  return (
    <FeedContainer>
      <FeedHeader>
        <FeedTitle>
          Live Activity Feed
          <LiveBadge>LIVE</LiveBadge>
        </FeedTitle>
      </FeedHeader>
      
      {executions.length > 0 ? (
        <ActivityList>
          {executions.map((execution, index) => (
            <ActivityItem 
              key={execution.id} 
              success={execution.success}
              isNew={index === 0}
            >
              <ActivityContent>
                <ActivityHeader>
                  <ActivityTitle>
                    Function {execution.functionId}
                  </ActivityTitle>
                  <ActivityStatus success={execution.success}>
                    {execution.success ? 'Success' : 'Failed'}
                  </ActivityStatus>
                </ActivityHeader>
                
                <ActivityDetails>
                  <ActivityDetail>
                    <strong>Trigger:</strong> {execution.triggerId}
                  </ActivityDetail>
                  <ActivityDetail>
                    <strong>Gas:</strong> {formatGas(execution.gasUsed)}
                  </ActivityDetail>
                  {!execution.success && execution.errorMessage && (
                    <ActivityDetail>
                      <strong>Error:</strong> {execution.errorMessage.slice(0, 40)}...
                    </ActivityDetail>
                  )}
                </ActivityDetails>
                
                <ActivityTime>
                  {formatTimeAgo(execution.timestamp)}
                </ActivityTime>
              </ActivityContent>
              
              <ActivityActions>
                <ViewButton 
                  href={getEtherscanUrl(execution.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Etherscan"
                >
                  <span>↗</span>
                </ViewButton>
              </ActivityActions>
            </ActivityItem>
          ))}
        </ActivityList>
      ) : (
        <EmptyState>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <EmptyStateText>
            No blockchain activity yet. Deploy functions or run demos to see live updates.
          </EmptyStateText>
        </EmptyState>
      )}
    </FeedContainer>
  );
};

export default LiveActivityFeed; 