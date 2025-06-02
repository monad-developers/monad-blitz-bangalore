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
  background: linear-gradient(135deg, rgba(30, 30, 45, 0.8) 0%, rgba(20, 20, 30, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15),
              0 5px 10px rgba(0, 0, 0, 0.12),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &:hover {
    border-color: rgba(76, 175, 80, 0.4);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2),
                0 10px 15px rgba(0, 0, 0, 0.15),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #4ecdc4, #00d4ff);
    border-radius: 4px 4px 0 0;
  }
`;

const BorderGlow = styled.div`
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 26px;
  z-index: -1;
  opacity: 0;
  background: linear-gradient(135deg, 
    rgba(76, 175, 80, 0.3) 0%, 
    transparent 50%, 
    rgba(0, 212, 255, 0.2) 100%
  );
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  ${FeedContainer}:hover & {
    opacity: 1;
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -100px;
  left: 50%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%);
  opacity: 0.3;
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  transition: all 0.3s ease;
  
  ${FeedContainer}:hover & {
    opacity: 0.4;
    transform: scale(1.1);
  }
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.3), transparent);
  }
`;

const FeedTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 2px;
    background: rgba(76, 175, 80, 0.4);
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  
  ${FeedContainer}:hover &::after {
    width: 50px;
  }
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4caf50;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  position: relative;
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(76, 175, 80, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
    box-shadow: 0 0 10px #4caf50;
  }
`;

const ActivityList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 6px;
  position: relative;
  z-index: 1;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(76, 175, 80, 0.3);
    border-radius: 2px;
    
    &:hover {
      background: rgba(76, 175, 80, 0.5);
    }
  }
`;

const ActivityItem = styled.div<{ type: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  transform-origin: center left;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${props => getTypeColor(props.type)}60;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15),
                0 0 0 1px ${props => getTypeColor(props.type)}30;
    
    &::after {
      opacity: 0.7;
      transform: translateX(0);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => getTypeColor(props.type)};
    opacity: 0.4;
    transition: all 0.3s ease;
    transform: translateX(-4px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 80px;
    background: linear-gradient(90deg, transparent, ${props => getTypeColor(props.type)}10);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => getTypeColor(props.type)}15;
  border: 1px solid ${props => getTypeColor(props.type)}30;
  box-shadow: 0 4px 12px ${props => getTypeColor(props.type)}20,
              inset 0 0 0 1px ${props => getTypeColor(props.type)}10;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 16px;
    background: ${props => getTypeColor(props.type)}05;
    z-index: -1;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  ${ActivityItem}:hover & {
    transform: scale(1.1) rotate(5deg);
    background: ${props => getTypeColor(props.type)}25;
    border-color: ${props => getTypeColor(props.type)}50;
    box-shadow: 0 8px 20px ${props => getTypeColor(props.type)}30;
    
    &::after {
      opacity: 1;
    }
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityDetails = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-bottom: 6px;
  font-weight: 500;
  transition: color 0.3s ease;
  
  ${ActivityItem}:hover & {
    color: white;
  }
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
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  ${ActivityItem}:hover & {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const TxHash = styled.a`
  color: #00d4ff;
  text-decoration: none;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  padding: 3px 10px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 0 2px 5px rgba(0, 212, 255, 0.1);
  
  &:hover {
    background: rgba(0, 212, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 212, 255, 0.2);
    border-color: rgba(0, 212, 255, 0.3);
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
  gap: 20px;
  background: radial-gradient(circle at center, rgba(76, 175, 80, 0.05) 0%, transparent 70%);
  border-radius: 16px;
  padding: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    background: radial-gradient(circle at center, rgba(76, 175, 80, 0.08) 0%, transparent 70%);
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 10px;
  color: rgba(76, 175, 80, 0.7);
  text-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  
  ${EmptyState}:hover & {
    opacity: 0.6;
    transform: scale(1.05);
    text-shadow: 0 0 30px rgba(76, 175, 80, 0.4);
  }
`;

const EmptyText = styled.div`
  font-weight: 500;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
`;

const EmptySubtext = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  max-width: 80%;
  line-height: 1.5;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  ${EmptyState}:hover & {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
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
      <BorderGlow />
      <GlowEffect />
      
      <FeedHeader>
        <FeedTitle>Live Activity Feed</FeedTitle>
        <LiveIndicator>LIVE</LiveIndicator>
      </FeedHeader>
      
      <ActivityList>
        {activities.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📡</EmptyIcon>
            <EmptyText>Waiting for blockchain activity...</EmptyText>
            <EmptySubtext>
              Deploy functions or run demos to see live updates
            </EmptySubtext>
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
