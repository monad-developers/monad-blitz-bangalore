import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const rotateReverse = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(138, 112, 255, 0.4)) drop-shadow(0 0 30px rgba(138, 112, 255, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(138, 112, 255, 0.7)) drop-shadow(0 0 50px rgba(138, 112, 255, 0.5));
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const data = keyframes`
  0%, 100% {
    height: 30%;
  }
  25% {
    height: 60%;
  }
  50% {
    height: 40%;
  }
  75% {
    height: 70%;
  }
`;

const ModelContainer = styled.div`
  position: relative;
  width: 550px;
  height: 550px;
  animation: ${float} 6s ease-in-out infinite;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 350px;
    height: 350px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

const RotatingElement = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: ${rotate} 25s linear infinite;
`;

const FloatingCircle = styled.div<{ size: number; delay: number; duration: number; top: number; left: number; color: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.color};
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  opacity: 0.7;
  filter: blur(10px);
  animation: ${float} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  z-index: -1;
`;

const OrbitalRing = styled.div<{ size: number; borderWidth: number; rotationSpeed: number; delay: number }>`
  position: absolute;
  width: ${props => props.size}%;
  height: ${props => props.size}%;
  border-radius: 50%;
  border: ${props => props.borderWidth}px solid rgba(138, 112, 255, 0.15);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${rotate} ${props => props.rotationSpeed}s linear infinite;
  animation-delay: ${props => props.delay}s;
`;

const OrbitalObject = styled.div<{ size: number; color: string; position: number; delay: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.color};
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(${props => props.position}deg) translateY(-150%) rotate(-${props => props.position}deg);
  box-shadow: 0 0 15px ${props => props.color};
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const DashboardFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 1200px;
  transform-style: preserve-3d;
  transform: rotateX(15deg) rotateY(-20deg);
`;

const GlowingScreen = styled.div`
  position: absolute;
  width: 85%;
  height: 65%;
  top: 15%;
  left: 8%;
  background: linear-gradient(135deg, #2d1b69 0%, #1e123d 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(138, 112, 255, 0.5), 
              inset 0 0 30px rgba(0, 0, 0, 0.5);
  animation: ${glow} 4s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, transparent, ${theme.colors.secondary}, transparent);
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 40%, rgba(138, 112, 255, 0.2) 0%, transparent 70%);
  }
`;

const ScreenBorder = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 18px;
  border: 2px solid rgba(138, 112, 255, 0.2);
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 22px;
    border: 1px solid rgba(138, 112, 255, 0.1);
  }
`;

const Scanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(to bottom, 
    rgba(138, 112, 255, 0.1) 0%, 
    rgba(138, 112, 255, 0.5) 50%, 
    rgba(138, 112, 255, 0.1) 100%);
  opacity: 0.3;
  animation: ${scanline} 4s linear infinite;
  pointer-events: none;
  z-index: 5;
`;

const GridLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(to right, rgba(138, 112, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(138, 112, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.4;
`;

const Chart = styled.div`
  position: absolute;
  bottom: 10%;
  left: 5%;
  right: 5%;
  height: 35%;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ChartLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to right, 
    ${theme.colors.primary}00 0%, 
    ${theme.colors.primary}40 20%, 
    ${theme.colors.secondary}80 50%, 
    ${theme.colors.primary}40 80%, 
    ${theme.colors.primary}00 100%
  );
  clip-path: polygon(
    0% 100%, 
    5% 80%, 
    15% 60%, 
    25% 80%, 
    35% 40%, 
    45% 60%, 
    55% 20%, 
    65% 40%, 
    75% 10%, 
    85% 30%, 
    95% 20%, 
    100% 40%, 
    100% 100%
  );
  opacity: 0.8;
`;

const DataColumns = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 5%;
`;

const DataColumn = styled.div<{ height: number; delay: number; color: string }>`
  width: 4px;
  height: ${props => props.height}%;
  background: linear-gradient(to top, ${props => props.color} 0%, transparent 100%);
  border-radius: 4px;
  animation: ${data} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const DataPoints = styled.div`
  position: absolute;
  top: 5%;
  left: 5%;
  right: 5%;
  height: 45%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const DataPoint = styled.div<{ delay: number; color: string; size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 0 8px ${props => props.color}aa;
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const CodeBlock = styled.div`
  position: absolute;
  top: 15%;
  left: 5%;
  width: 50%;
  height: 30%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CodeLine = styled.div<{ width: number; delay: number; color: string }>`
  height: 4px;
  width: ${props => `${props.width}%`};
  background-color: ${props => props.color};
  border-radius: 2px;
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: ${props => `${props.delay}s`};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${props => props.color};
  }
`;

const NetworkNodes = styled.div`
  position: absolute;
  top: 15%;
  right: 5%;
  width: 35%;
  height: 30%;
`;

const NodeConnection = styled.div<{ x1: number; y1: number; x2: number; y2: number; delay: number }>`
  position: absolute;
  top: ${props => props.y1}%;
  left: ${props => props.x1}%;
  width: ${props => Math.sqrt(Math.pow(props.x2 - props.x1, 2) + Math.pow(props.y2 - props.y1, 2))}%;
  height: 1px;
  background-color: rgba(138, 112, 255, 0.4);
  transform-origin: 0 0;
  transform: rotate(${props => Math.atan2(props.y2 - props.y1, props.x2 - props.x1) * (180 / Math.PI)}deg);
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const StatusBar = styled.div`
  position: absolute;
  bottom: 5%;
  left: 5%;
  right: 5%;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 70%;
    height: 100%;
    background: linear-gradient(to right, ${theme.colors.secondary}aa, ${theme.colors.secondary}55);
    border-radius: 3px;
  }
`;

const DashboardModel: React.FC = () => {
  const generateDataPoints = () => {
    const points = [];
    const colors = ['#8a70ff', '#00d2c2', '#a170ff', '#00c2c2'];
    const sizes = [6, 8, 10, 12];
    
    for (let i = 0; i < 25; i++) {
      points.push(
        <DataPoint 
          key={i} 
          delay={i * 0.1} 
          color={colors[i % colors.length]} 
          size={sizes[i % sizes.length]}
        />
      );
    }
    
    return points;
  };
  
  const generateCodeLines = () => {
    const lines = [];
    const widths = [70, 50, 80, 60, 40, 90, 45, 75];
    const colors = ['rgba(138, 112, 255, 0.5)', 'rgba(0, 210, 194, 0.5)'];
    
    for (let i = 0; i < 8; i++) {
      lines.push(
        <CodeLine 
          key={i} 
          width={widths[i]} 
          delay={i * 0.15} 
          color={colors[i % colors.length]}
        />
      );
    }
    
    return lines;
  };
  
  const generateDataColumns = () => {
    const columns = [];
    const heights = [40, 60, 30, 70, 50, 80, 45, 55, 65, 35];
    const colors = ['#8a70ff', '#00d2c2'];
    
    for (let i = 0; i < 10; i++) {
      columns.push(
        <DataColumn
          key={i}
          height={heights[i]}
          delay={i * 0.2}
          color={colors[i % colors.length]}
        />
      );
    }
    
    return columns;
  };
  
  const generateNodeConnections = () => {
    const connections = [];
    const nodes = [
      { x: 10, y: 20 },
      { x: 80, y: 30 },
      { x: 50, y: 70 },
      { x: 20, y: 80 },
      { x: 90, y: 60 }
    ];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        connections.push(
          <NodeConnection
            key={`${i}-${j}`}
            x1={nodes[i].x}
            y1={nodes[i].y}
            x2={nodes[j].x}
            y2={nodes[j].y}
            delay={(i + j) * 0.2}
          />
        );
      }
    }
    
    return connections;
  };
  
  const generateFloatingCircles = () => {
    const circles = [
      { size: 150, delay: 0, duration: 7, top: 5, left: 5, color: 'rgba(0, 210, 194, 0.2)' },
      { size: 100, delay: 1, duration: 5, top: 70, left: 10, color: 'rgba(138, 112, 255, 0.2)' },
      { size: 120, delay: 2, duration: 8, top: 20, left: 80, color: 'rgba(138, 112, 255, 0.15)' },
      { size: 80, delay: 3, duration: 6, top: 60, left: 75, color: 'rgba(0, 210, 194, 0.15)' }
    ];
    
    return circles.map((circle, index) => (
      <FloatingCircle
        key={index}
        size={circle.size}
        delay={circle.delay}
        duration={circle.duration}
        top={circle.top}
        left={circle.left}
        color={circle.color}
      />
    ));
  };
  
  const generateOrbitalRings = () => {
    const rings = [
      { size: 90, borderWidth: 1, rotationSpeed: 30, delay: 0 },
      { size: 70, borderWidth: 2, rotationSpeed: 20, delay: 1 },
      { size: 50, borderWidth: 1, rotationSpeed: 15, delay: 2 }
    ];
    
    return rings.map((ring, index) => (
      <OrbitalRing
        key={index}
        size={ring.size}
        borderWidth={ring.borderWidth}
        rotationSpeed={ring.rotationSpeed}
        delay={ring.delay}
      />
    ));
  };
  
  const generateOrbitalObjects = () => {
    const objects = [
      { size: 8, color: '#8a70ff', position: 45, delay: 0 },
      { size: 6, color: '#00d2c2', position: 135, delay: 0.5 },
      { size: 10, color: '#8a70ff', position: 225, delay: 1 },
      { size: 5, color: '#00d2c2', position: 315, delay: 1.5 }
    ];
    
    return objects.map((object, index) => (
      <OrbitalObject
        key={index}
        size={object.size}
        color={object.color}
        position={object.position}
        delay={object.delay}
      />
    ));
  };
  
  return (
    <ModelContainer>
      {generateFloatingCircles()}
      <RotatingElement>
        {generateOrbitalRings()}
        {generateOrbitalObjects()}
        <DashboardFrame>
          <GlowingScreen>
            <ScreenBorder />
            <GridLines />
            <Scanline />
            <CodeBlock>
              {generateCodeLines()}
            </CodeBlock>
            <NetworkNodes>
              {generateNodeConnections()}
            </NetworkNodes>
            <DataPoints>
              {generateDataPoints()}
            </DataPoints>
            <Chart>
              <ChartLine />
              <DataColumns>
                {generateDataColumns()}
              </DataColumns>
            </Chart>
            <StatusBar />
          </GlowingScreen>
        </DashboardFrame>
      </RotatingElement>
    </ModelContainer>
  );
};

export default DashboardModel; 