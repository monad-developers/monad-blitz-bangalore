import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
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

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const OrbitRing = styled.div<{ size: number; top: number; left: number; duration: number; delay: number }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  border: 1px solid rgba(138, 112, 255, 0.1);
  animation: ${rotate} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  transform-origin: center;
`;

const GlowingOrb = styled.div<{ size: number; top: number; left: number; color: string; duration: number }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: radial-gradient(circle at center, ${props => props.color} 0%, transparent 70%);
  filter: blur(20px);
  opacity: 0.3;
  animation: ${pulseGlow} ${props => props.duration}s ease-in-out infinite;
`;

const GridLine = styled.div<{ direction: 'horizontal' | 'vertical'; position: number; width: number; opacity: number }>`
  position: absolute;
  ${props => props.direction === 'horizontal' ? `
    top: ${props.position}%;
    left: 0;
    width: 100%;
    height: 1px;
  ` : `
    top: 0;
    left: ${props.position}%;
    width: 1px;
    height: 100%;
  `}
  background-color: rgba(138, 112, 255, ${props => props.opacity});
  opacity: 0.2;
`;

const BackgroundEffect: React.FC = () => {
  // Generate random orbit rings
  const renderOrbitRings = () => {
    const rings = [];
    for (let i = 0; i < 3; i++) {
      rings.push(
        <OrbitRing
          key={`ring-${i}`}
          size={300 + (i * 150)}
          top={Math.random() * 80}
          left={Math.random() * 80}
          duration={60 + (i * 20)}
          delay={i * 5}
        />
      );
    }
    return rings;
  };

  // Generate glowing orbs
  const renderGlowingOrbs = () => {
    const orbs = [];
    const colors = [
      theme.colors.secondary,
      theme.colors.primary,
      `${theme.colors.secondary}`,
      `${theme.colors.primary}`
    ];
    
    for (let i = 0; i < 6; i++) {
      orbs.push(
        <GlowingOrb
          key={`orb-${i}`}
          size={100 + (i * 40)}
          top={Math.random() * 80}
          left={Math.random() * 80}
          color={colors[i % colors.length]}
          duration={4 + (i * 2)}
        />
      );
    }
    return orbs;
  };

  // Generate grid lines
  const renderGridLines = () => {
    const lines = [];
    
    // Horizontal lines
    for (let i = 0; i < 5; i++) {
      lines.push(
        <GridLine
          key={`h-line-${i}`}
          direction="horizontal"
          position={10 + (i * 20)}
          width={100}
          opacity={0.05 + (Math.random() * 0.1)}
        />
      );
    }
    
    // Vertical lines
    for (let i = 0; i < 5; i++) {
      lines.push(
        <GridLine
          key={`v-line-${i}`}
          direction="vertical"
          position={10 + (i * 20)}
          width={100}
          opacity={0.05 + (Math.random() * 0.1)}
        />
      );
    }
    
    return lines;
  };

  return (
    <Container>
      {renderGlowingOrbs()}
      {renderOrbitRings()}
      {renderGridLines()}
    </Container>
  );
};

export default BackgroundEffect; 