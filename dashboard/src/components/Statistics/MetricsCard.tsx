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
  background: linear-gradient(135deg, rgba(30, 30, 45, 0.8) 0%, rgba(20, 20, 30, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15),
              0 5px 10px rgba(0, 0, 0, 0.12),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
    border-color: ${props => props.color}80;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                0 15px 20px rgba(0, 0, 0, 0.2),
                0 0 20px ${props => props.color}50,
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}40);
    border-radius: 4px 4px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, ${props => props.color}20 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(20px);
    transform: translate(20%, 20%);
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    transform: translate(10%, 10%) scale(1.2);
    opacity: 0.7;
  }
`;

const BorderGlow = styled.div<{ color: string }>`
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 26px;
  z-index: -1;
  opacity: 0;
  background: linear-gradient(135deg, 
    ${props => props.color}30 0%, 
    transparent 50%, 
    ${props => props.color}20 100%
  );
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const GlowEffect = styled.div<{ color: string }>`
  position: absolute;
  top: -80px;
  right: -80px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: ${props => props.color};
  opacity: 0.07;
  filter: blur(30px);
  pointer-events: none;
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    opacity: 0.12;
    width: 200px;
    height: 200px;
  }
`;

const IconGlow = styled.div<{ color: string }>`
  position: absolute;
  top: 28px;
  right: 28px;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: ${props => props.color};
  opacity: 0.15;
  filter: blur(10px);
  pointer-events: none;
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    opacity: 0.25;
    filter: blur(15px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  
  ${Card}:hover &::after {
    width: 50px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

const Icon = styled.div<{ color: string }>`
  font-size: 1.8rem;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}15;
  border: 1px solid ${props => props.color}40;
  box-shadow: 0 5px 15px ${props => props.color}20,
              inset 0 0 0 1px ${props => props.color}10;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  
  &:hover {
    background: ${props => props.color}25;
    transform: scale(1.1) rotate(5deg);
    border-color: ${props => props.color}60;
    box-shadow: 0 8px 20px ${props => props.color}30;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const ValueContainer = styled.div`
  margin-bottom: 10px;
  perspective: 500px;
`;

const Value = styled.div<{ color: string }>`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  text-shadow: 0 0 10px ${props => props.color}50;
  letter-spacing: -1px;
  transform: translateZ(20px);
  background: linear-gradient(135deg, white 10%, ${props => props.color}CC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    text-shadow: 0 0 15px ${props => props.color}70;
    transform: translateZ(25px);
  }
`;

const Subtitle = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
  
  ${Card}:hover & {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CardFooter = styled.div`
  margin-top: auto;
`;

const Trend = styled.div<{ isPositive: boolean }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.isPositive ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${props => props.isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  width: fit-content;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  border: 1px solid ${props => props.isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  box-shadow: 0 2px 8px ${props => props.isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  
  &::before {
    content: '${props => props.isPositive ? '↗' : '↘'}';
    font-size: 1.2rem;
  }
  
  &:hover {
    background: ${props => props.isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.isPositive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'};
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
      <BorderGlow color={color} />
      <GlowEffect color={color} />
      <IconGlow color={color} />
      
      <CardHeader>
        <Title>{title}</Title>
        <Icon color={color}>{icon}</Icon>
      </CardHeader>
      
      <CardContent>
        <ValueContainer>
          <Value color={color}>
            {formatValue(value)}
          </Value>
        </ValueContainer>
        
        <Subtitle>{subtitle}</Subtitle>
      </CardContent>
      
      <CardFooter>
        <Trend isPositive={isPositiveTrend}>
          {trend}
        </Trend>
      </CardFooter>
    </Card>
  );
};

export default MetricsCard;
