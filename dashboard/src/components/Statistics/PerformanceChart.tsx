import React, { useState } from 'react';
import styled from 'styled-components';

interface ChartDataPoint {
  timestamp: number;
  functions: number;
  triggers: number;
  gasUsed: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

const ChartContainer = styled.div`
  background: linear-gradient(135deg, rgba(30, 30, 45, 0.8) 0%, rgba(20, 20, 30, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  height: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15),
              0 5px 10px rgba(0, 0, 0, 0.12),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  opacity: 1;
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
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
    background: linear-gradient(90deg, #00d4ff, #4ecdc4);
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
    rgba(0, 212, 255, 0.3) 0%, 
    transparent 50%, 
    rgba(78, 205, 196, 0.2) 100%
  );
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  ${ChartContainer}:hover & {
    opacity: 1;
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -100px;
  right: 0;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  opacity: 0.3;
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  transition: all 0.3s ease;
  
  ${ChartContainer}:hover & {
    opacity: 0.4;
    transform: scale(1.1);
  }
`;

const SecondaryGlow = styled.div`
  position: absolute;
  bottom: -80px;
  left: 50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(78, 205, 196, 0.2) 0%, transparent 70%);
  opacity: 0.2;
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  transition: all 0.3s ease;
  
  ${ChartContainer}:hover & {
    opacity: 0.3;
    transform: scale(1.05) translateY(-10px);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ffffff, #00d4ff);
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
    background: rgba(0, 212, 255, 0.4);
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  
  ${ChartContainer}:hover &::after {
    width: 50px;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  ${ChartContainer}:hover & {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
`;

const TimeOption = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.2)' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.6)'};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-shadow: ${props => props.active ? '0 0 8px rgba(0, 212, 255, 0.5)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.8)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    opacity: ${props => props.active ? 0.4 : 0};
    transition: opacity 0.2s ease;
  }
  
  &:hover::after {
    opacity: ${props => props.active ? 0.5 : 0.2};
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2),
                0 0 0 1px ${props => props.color}30;
    border-color: ${props => props.color}40;
  }
  
  &::before {
    content: '';
    width: 16px;
    height: 4px;
    background: ${props => props.color};
    border-radius: 2px;
    box-shadow: 0 0 10px ${props => props.color}80;
    transition: all 0.2s ease;
  }
  
  &:hover::before {
    transform: scaleX(1.2);
    box-shadow: 0 0 15px ${props => props.color}A0;
  }
`;

const ChartArea = styled.div`
  position: relative;
  height: 300px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1;
  transition: all 0.3s ease;
  
  ${ChartContainer}:hover & {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 2px 15px rgba(0, 0, 0, 0.3);
  }
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const GridLine = styled.line`
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 1;
  transition: stroke 0.3s ease;
  
  ${ChartContainer}:hover & {
    stroke: rgba(255, 255, 255, 0.08);
  }
`;

const GridLabel = styled.text`
  fill: rgba(255, 255, 255, 0.4);
  font-size: 8px;
  text-anchor: end;
  dominant-baseline: middle;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  transition: fill 0.3s ease;
  
  ${ChartContainer}:hover & {
    fill: rgba(255, 255, 255, 0.6);
  }
`;

const ChartPath = styled.path<{ color: string }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px ${props => props.color}80);
  transition: all 0.3s ease;
  
  ${ChartContainer}:hover & {
    stroke-width: 3;
    filter: drop-shadow(0 0 6px ${props => props.color}A0);
  }
`;

const ChartArea2 = styled.path<{ color: string }>`
  fill: url(#gradient-${props => props.color.replace('#', '')});
  opacity: 0.3;
  transition: opacity 0.3s ease;
  
  ${ChartContainer}:hover & {
    opacity: 0.4;
  }
`;

const DataPoint = styled.circle<{ color: string }>`
  fill: ${props => props.color};
  stroke: #111;
  stroke-width: 1;
  r: 3;
  filter: drop-shadow(0 0 3px ${props => props.color});
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    r: 5;
    filter: drop-shadow(0 0 8px ${props => props.color});
    stroke-width: 1.5;
  }
  
  ${ChartContainer}:hover & {
    r: 4;
    filter: drop-shadow(0 0 5px ${props => props.color});
  }
  
  ${ChartContainer}:hover &:hover {
    r: 6;
    filter: drop-shadow(0 0 10px ${props => props.color});
  }
`;

const Tooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
  pointer-events: none;
  z-index: 10;
  font-size: 0.8rem;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateY(10px);
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: rgba(0, 0, 0, 0.8);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    transform-origin: center;
    transform: translateX(-50%) rotate(45deg);
  }
`;

const TooltipRow = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(2px);
  }
  
  &::before {
    content: '';
    width: 8px;
    height: 3px;
    background: ${props => props.color};
    border-radius: 2px;
    box-shadow: 0 0 5px ${props => props.color}80;
  }
`;

const TooltipHeader = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  gap: 16px;
  background: radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
  border-radius: 16px;
  padding: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    background: radial-gradient(circle at center, rgba(0, 212, 255, 0.08) 0%, transparent 70%);
  }
`;

const LoadingIcon = styled.div`
  font-size: 4rem;
  opacity: 0.5;
  color: rgba(0, 212, 255, 0.7);
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
  
  ${NoDataMessage}:hover & {
    opacity: 0.6;
    transform: scale(1.05);
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
  }
`;

const LoadingText = styled.div`
  font-weight: 500;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    width: 40px;
    height: 2px;
    background: rgba(0, 212, 255, 0.3);
    transform: translateX(-50%);
    border-radius: 1px;
  }
`;

const LoadingBar = styled.div`
  width: 50%;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 30%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.3), rgba(78, 205, 196, 0.5));
    border-radius: 3px;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
    transform: translateX(-100%);
    animation: loading 1.5s infinite ease-in-out;
  }
  
  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: ChartDataPoint | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <BorderGlow />
        <GlowEffect />
        <SecondaryGlow />
        <ChartHeader>
          <ChartTitle>Performance Metrics</ChartTitle>
          <TimeRangeSelector>
            <TimeOption active={timeRange === '1h'} onClick={() => setTimeRange('1h')}>1H</TimeOption>
            <TimeOption active={timeRange === '24h'} onClick={() => setTimeRange('24h')}>24H</TimeOption>
            <TimeOption active={timeRange === '7d'} onClick={() => setTimeRange('7d')}>7D</TimeOption>
          </TimeRangeSelector>
        </ChartHeader>
        <ChartArea>
          <NoDataMessage>
            <LoadingIcon>
              📊
            </LoadingIcon>
            <LoadingText>Waiting for performance data...</LoadingText>
            <LoadingBar />
          </NoDataMessage>
        </ChartArea>
      </ChartContainer>
    );
  }

  const width = 100;
  const height = 100;
  const padding = 10;

  // Calculate scales
  const maxFunctions = Math.max(...data.map(d => d.functions), 1);
  const maxTriggers = Math.max(...data.map(d => d.triggers), 1);
  const maxGas = Math.max(...data.map(d => d.gasUsed), 1);

  // Create path data
  const createPath = (values: number[], max: number) => {
    if (values.length < 2) return '';
    
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value / max) * (height - 2 * padding));
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const createAreaPath = (values: number[], max: number) => {
    if (values.length < 2) return '';
    
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value / max) * (height - 2 * padding));
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = padding + (width - 2 * padding);
    const bottomY = height - padding;

    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  };

  const functionsPath = createPath(data.map(d => d.functions), maxFunctions);
  const triggersPath = createPath(data.map(d => d.triggers), maxTriggers);
  const gasPath = createPath(data.map(d => d.gasUsed), maxGas);

  const functionsArea = createAreaPath(data.map(d => d.functions), maxFunctions);
  const triggersArea = createAreaPath(data.map(d => d.triggers), maxTriggers);
  
  const handleDataPointHover = (
    e: React.MouseEvent<SVGCircleElement>,
    dataPoint: ChartDataPoint
  ) => {
    const rect = (e.target as SVGCircleElement).getBoundingClientRect();
    const chartRect = (e.currentTarget.parentElement?.parentElement as HTMLElement).getBoundingClientRect();
    
    setTooltip({
      visible: true,
      x: rect.left - chartRect.left + rect.width / 2,
      y: rect.top - chartRect.top,
      data: dataPoint
    });
  };
  
  const handleDataPointLeave = () => {
    setTooltip({
      ...tooltip,
      visible: false
    });
  };
  
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChartContainer>
      <BorderGlow />
      <GlowEffect />
      <SecondaryGlow />
      <ChartHeader>
        <ChartTitle>Performance Metrics</ChartTitle>
        <TimeRangeSelector>
          <TimeOption active={timeRange === '1h'} onClick={() => setTimeRange('1h')}>1H</TimeOption>
          <TimeOption active={timeRange === '24h'} onClick={() => setTimeRange('24h')}>24H</TimeOption>
          <TimeOption active={timeRange === '7d'} onClick={() => setTimeRange('7d')}>7D</TimeOption>
        </TimeRangeSelector>
      </ChartHeader>
      
      <Legend>
        <LegendItem color="#00d4ff">Functions</LegendItem>
        <LegendItem color="#ff6b6b">Triggers</LegendItem>
        <LegendItem color="#4ecdc4">Gas Usage</LegendItem>
      </Legend>
      
      <ChartArea>
        <SVGChart viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="gradient-00d4ff" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-ff6b6b" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines and labels */}
          {[0, 25, 50, 75, 100].map(y => (
            <React.Fragment key={y}>
              <GridLine
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
              />
              <GridLabel
                x={padding - 2}
                y={y}
              >
                {Math.round((100 - y) / 100 * maxFunctions)}
              </GridLabel>
            </React.Fragment>
          ))}
          
          {/* Area fills */}
          <ChartArea2 d={functionsArea} color="#00d4ff" />
          <ChartArea2 d={triggersArea} color="#ff6b6b" />
          
          {/* Lines */}
          <ChartPath d={functionsPath} color="#00d4ff" />
          <ChartPath d={triggersPath} color="#ff6b6b" />
          <ChartPath d={gasPath} color="#4ecdc4" />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            
            const yFunctions = height - padding - ((point.functions / maxFunctions) * (height - 2 * padding));
            const yTriggers = height - padding - ((point.triggers / maxTriggers) * (height - 2 * padding));
            const yGas = height - padding - ((point.gasUsed / maxGas) * (height - 2 * padding));
            
            return (
              <React.Fragment key={point.timestamp}>
                <DataPoint 
                  cx={x} 
                  cy={yFunctions} 
                  color="#00d4ff"
                  onMouseEnter={(e) => handleDataPointHover(e, point)}
                  onMouseLeave={handleDataPointLeave}
                />
                <DataPoint 
                  cx={x} 
                  cy={yTriggers} 
                  color="#ff6b6b"
                  onMouseEnter={(e) => handleDataPointHover(e, point)}
                  onMouseLeave={handleDataPointLeave}
                />
                <DataPoint 
                  cx={x} 
                  cy={yGas} 
                  color="#4ecdc4"
                  onMouseEnter={(e) => handleDataPointHover(e, point)}
                  onMouseLeave={handleDataPointLeave}
                />
              </React.Fragment>
            );
          })}
        </SVGChart>
        
        {tooltip.data && (
          <Tooltip
            className={tooltip.visible ? 'visible' : ''}
            style={{
              left: tooltip.x,
              top: tooltip.y - 80,
            }}
          >
            <TooltipHeader>
              {formatTimestamp(tooltip.data.timestamp)}
            </TooltipHeader>
            <TooltipRow color="#00d4ff">Functions: {tooltip.data.functions}</TooltipRow>
            <TooltipRow color="#ff6b6b">Triggers: {tooltip.data.triggers}</TooltipRow>
            <TooltipRow color="#4ecdc4">Gas: {tooltip.data.gasUsed}</TooltipRow>
          </Tooltip>
        )}
      </ChartArea>
    </ChartContainer>
  );
};

export default PerformanceChart;
