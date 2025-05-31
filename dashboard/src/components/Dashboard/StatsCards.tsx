import React from 'react';
import styled from 'styled-components';
import { LiveMetrics } from '../../services/MetricsService';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const CardWrapper = styled.div`
  position: relative;
  background: rgba(26, 27, 38, 0.6);
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color || '#8A70FF'};
    opacity: 0.8;
  }
`;

const CardIcon = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => `rgba(${props.bgColor}, 0.15)`};
  color: ${props => `rgb(${props.bgColor})`};
  font-size: 22px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
`;

const CardValue = styled.div`
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const CardTrend = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${props => props.isPositive ? '#4ECDC4' : '#FF6B6B'};
  
  &::before {
    content: ${props => props.isPositive ? '"↑"' : '"↓"'};
    margin-right: 4px;
    font-size: 14px;
  }
`;

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  isPositive?: boolean;
  color?: string;
  bgColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  isPositive = true,
  color = '#8A70FF',
  bgColor = '138, 112, 255'
}) => {
  return (
    <CardWrapper style={{ '--card-color': color } as React.CSSProperties}>
      <CardIcon bgColor={bgColor}>{icon}</CardIcon>
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
      {trend && <CardTrend isPositive={isPositive}>{trend}</CardTrend>}
    </CardWrapper>
  );
};

interface StatsCardsProps {
  metrics: LiveMetrics;
}

const StatsCards: React.FC<StatsCardsProps> = ({ metrics }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const formatGas = (gas: bigint): string => {
    const num = Number(gas);
    return formatNumber(num);
  };
  
  return (
    <CardsContainer>
      <StatsCard
        title="Total Functions"
        value={metrics.execution.totalFunctions}
        icon="⚡"
        trend="+12% from last hour"
        isPositive={true}
        color="#00D4FF"
        bgColor="0, 212, 255"
      />
      <StatsCard
        title="Active Triggers"
        value={metrics.execution.totalTriggers}
        icon="🔄"
        trend="+8% from last hour"
        isPositive={true}
        color="#FF6B6B"
        bgColor="255, 107, 107"
      />
      <StatsCard
        title="Network TPS"
        value={formatNumber(metrics.execution.totalExecutions)}
        icon="📊"
        trend="Real-time"
        isPositive={true}
        color="#4ECDC4"
        bgColor="78, 205, 196"
      />
      <StatsCard
        title="Avg Gas Cost"
        value={formatGas(metrics.gas.totalGasUsed)}
        icon="⛽"
        trend="-5% from yesterday"
        isPositive={false}
        color="#FFD93D"
        bgColor="255, 217, 61"
      />
    </CardsContainer>
  );
};

export default StatsCards; 