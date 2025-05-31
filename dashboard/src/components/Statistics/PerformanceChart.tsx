import React from 'react';
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
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  height: 400px;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  
  &::before {
    content: '';
    width: 12px;
    height: 3px;
    background: ${props => props.color};
    border-radius: 2px;
  }
`;

const ChartArea = styled.div`
  position: relative;
  height: 300px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
`;

const GridLine = styled.line`
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1;
`;

const ChartPath = styled.path<{ color: string }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const ChartArea2 = styled.path<{ color: string }>`
  fill: url(#gradient-${props => props.color.replace('#', '')});
  opacity: 0.3;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
`;

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Performance Metrics</ChartTitle>
        </ChartHeader>
        <ChartArea>
          <NoDataMessage>
            📊 Waiting for performance data...
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

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Performance Metrics</ChartTitle>
        <Legend>
          <LegendItem color="#00d4ff">Functions</LegendItem>
          <LegendItem color="#ff6b6b">Triggers</LegendItem>
          <LegendItem color="#4ecdc4">Gas Usage</LegendItem>
        </Legend>
      </ChartHeader>
      
      <ChartArea>
        <SVGChart viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="gradient-00d4ff" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-ff6b6b" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <GridLine
              key={y}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
            />
          ))}
          
          {/* Area fills */}
          <ChartArea2 d={functionsArea} color="#00d4ff" />
          <ChartArea2 d={triggersArea} color="#ff6b6b" />
          
          {/* Lines */}
          <ChartPath d={functionsPath} color="#00d4ff" />
          <ChartPath d={triggersPath} color="#ff6b6b" />
          <ChartPath d={gasPath} color="#4ecdc4" />
        </SVGChart>
      </ChartArea>
    </ChartContainer>
  );
};

export default PerformanceChart;
