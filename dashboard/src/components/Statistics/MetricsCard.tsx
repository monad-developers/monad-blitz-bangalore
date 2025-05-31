import React from 'react';
import styled from 'styled-components';

interface MetricsCardProps {
  title: string;
  value: number;
  subtitle: string;
  trend: string;
  icon: string;
  color: string;
}

const Card = styled.div<{ color: string }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.color}40;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}80);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const Icon = styled.div<{ color: string }>`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  border: 1px solid ${props => props.color}40;
`;

const Value = styled.div<{ color: string }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color};
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
`;

const Subtitle = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
`;

const Trend = styled.div<{ isPositive: boolean }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.isPositive ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '${props => props.isPositive ? '↗' : '↘'}';
    font-size: 1rem;
  }
`;

const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color
}) => {
  const isPositiveTrend = trend.includes('+') || trend.includes('Real-time');
  
  return (
    <Card color={color}>
      <Header>
        <Title>{title}</Title>
        <Icon color={color}>{icon}</Icon>
      </Header>
      
      <Value color={color}>
        {formatValue(value)}
      </Value>
      
      <Subtitle>{subtitle}</Subtitle>
      
      <Trend isPositive={isPositiveTrend}>
        {trend}
      </Trend>
    </Card>
  );
};

export default MetricsCard;
