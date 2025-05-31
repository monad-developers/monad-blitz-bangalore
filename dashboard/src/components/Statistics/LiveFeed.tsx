import React from 'react';
import styled from 'styled-components';

interface Activity {
  id: string;
  type: 'function_registered' | 'trigger_fired' | 'function_executed';
  timestamp: number;
  details: string;
  txHash?: string;
}

interface LiveFeedProps {
  activities: Activity[];
}

const FeedContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  height: 400px;
  display: flex;
  flex-direction: column;
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FeedTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #4caf50;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ActivityList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const ActivityItem = styled.div<{ type: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${props => getTypeColor(props.type)}40;
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => getTypeColor(props.type)}20;
  border: 1px solid ${props => getTypeColor(props.type)}40;
  font-size: 1rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityDetails = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const Timestamp = styled.span`
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
`;

const TxHash = styled.a`
  color: #00d4ff;
  text-decoration: none;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  gap: 12px;
`;

const EmptyIcon = styled.div`
  font-size: 2rem;
  opacity: 0.5;
`;

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'function_registered': return '#00d4ff';
    case 'trigger_fired': return '#ff6b6b';
    case 'function_executed': return '#4ecdc4';
    default: return '#ffffff';
  }
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'function_registered': return '⚡';
    case 'trigger_fired': return '🎯';
    case 'function_executed': return '🚀';
    default: return '📝';
  }
};

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
};

const LiveFeed: React.FC<LiveFeedProps> = ({ activities }) => {
  return (
    <FeedContainer>
      <FeedHeader>
        <FeedTitle>Live Activity Feed</FeedTitle>
        <LiveIndicator>LIVE</LiveIndicator>
      </FeedHeader>
      
      <ActivityList>
        {activities.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📡</EmptyIcon>
            <div>Waiting for blockchain activity...</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Deploy functions or run demos to see live updates
            </div>
          </EmptyState>
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} type={activity.type}>
              <ActivityIcon type={activity.type}>
                {getTypeIcon(activity.type)}
              </ActivityIcon>
              
              <ActivityContent>
                <ActivityDetails>{activity.details}</ActivityDetails>
                <ActivityMeta>
                  <Timestamp>{formatTimestamp(activity.timestamp)}</Timestamp>
                  {activity.txHash && (
                    <TxHash
                      href={`https://etherscan.io/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {activity.txHash.slice(0, 8)}...
                    </TxHash>
                  )}
                </ActivityMeta>
              </ActivityContent>
            </ActivityItem>
          ))
        )}
      </ActivityList>
    </FeedContainer>
  );
};

export default LiveFeed;
