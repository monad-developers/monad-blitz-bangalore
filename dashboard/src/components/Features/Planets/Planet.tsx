import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../../../styles/theme';

const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const orbitRotate = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

const secondaryOrbitRotate = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
`;

const featurePointFloat = keyframes`
  0% {
    transform: translateY(0px) scale(1);
    box-shadow: 0 0 15px currentColor;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 0 25px currentColor;
  }
  100% {
    transform: translateY(0px) scale(1);
    box-shadow: 0 0 15px currentColor;
  }
`;

const shine = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.3;
  }
`;

const orbitalShine = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
`;

const textGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  }
  50% {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.7), 0 0 40px currentColor;
  }
`;

interface PlanetImageProps {
  active?: boolean;
  color?: string;
  size?: string;
  delay?: string;
  planetType: 'build' | 'scale';
  zIndex?: number;
}

// Define pulse animation with proper typing
const getPulseAnimation = (color: string = 'rgba(92, 69, 255, 0.4)') => keyframes`
  0% {
    filter: drop-shadow(0 0 20px ${color});
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 60px ${color.replace('0.4', '0.6')});
    transform: scale(1.05);
  }
  100% {
    filter: drop-shadow(0 0 20px ${color});
    transform: scale(1);
  }
`;

const PlanetContainer = styled.div<PlanetImageProps>`
  position: relative;
  width: ${props => props.size || '300px'};
  height: ${props => props.size || '300px'};
  z-index: ${props => props.zIndex || 1};
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  transition: all 0.5s ease-in-out;
  
  &::after {
    content: '${props => props.planetType.toUpperCase()}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
    z-index: 3;
    letter-spacing: 2px;
    animation: ${textGlow} 3s infinite ease-in-out;
    color: ${props => props.planetType === 'build' ? '#FFFFFF' : '#FFFFFF'};
  }
  
  ${props => props.active && css`
    animation: ${float} 8s ease-in-out infinite, ${getPulseAnimation(props.color)} 3s ease-in-out infinite;
    transform: scale(1.05);
  `}
`;

const PlanetImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(92, 69, 255, 0.5));
  transition: all 0.3s ease-in-out;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%);
    mix-blend-mode: overlay;
    animation: ${shine} 5s infinite;
  }
`;

const PlanetRing = styled.div<{ color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110%;
  height: 110%;
  border-radius: 50%;
  border: 2px solid ${props => props.color};
  opacity: 0.3;
  box-shadow: 0 0 15px ${props => props.color};
  pointer-events: none;
  z-index: 4;
`;

const PlanetGlow = styled.div<{ color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130%;
  height: 130%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${props => props.color}40 0%,
    ${props => props.color}20 30%,
    ${props => props.color}10 60%,
    transparent 70%
  );
  filter: blur(20px);
  opacity: 0.7;
  z-index: 0;
  pointer-events: none;
`;

const OrbitPath = styled.div<{ size: string; color?: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => `calc(${props.size} * 1.5)`};
  height: ${props => `calc(${props.size} * 1.5)`};
  border: 1px solid ${props => props.color || 'rgba(92, 69, 255, 0.2)'};
  border-radius: 50%;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: -15px;
    right: -15px;
    bottom: -15px;
    border: 1px solid ${props => props.color ? props.color.replace('0.2', '0.1') : 'rgba(92, 69, 255, 0.1)'};
    border-radius: 50%;
    animation: ${orbitalShine} 8s infinite ease-in-out;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -30px;
    left: -30px;
    right: -30px;
    bottom: -30px;
    border: 0.5px solid ${props => props.color ? props.color.replace('0.2', '0.05') : 'rgba(92, 69, 255, 0.05)'};
    border-radius: 50%;
    animation: ${orbitalShine} 12s infinite ease-in-out reverse;
  }
`;

interface OrbitProps {
  size: string;
  duration?: string;
  color?: string;
  reverse?: boolean;
  delay?: string;
}

const Orbit = styled.div<OrbitProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.size};
  height: ${props => props.size};
  border: 1px solid ${props => props.color || 'rgba(92, 69, 255, 0.3)'};
  border-radius: 50%;
  z-index: 0;
  transform: translate(-50%, -50%);
  animation: ${props => props.reverse ? secondaryOrbitRotate : orbitRotate} ${props => props.duration || '30s'} linear infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

const FeaturePoint = styled.div<{ color?: string; index: number; active?: boolean }>`
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${props => props.color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px ${props => props.color || theme.colors.primary};
  animation: ${featurePointFloat} 4s ease-in-out infinite;
  animation-delay: ${props => `${props.index * 0.5}s`};
  z-index: 5;
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.active && css`
    transform: scale(1.2);
    box-shadow: 0 0 25px ${props.color || theme.colors.primary};
  `}
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 1px solid ${props => props.color || theme.colors.primary};
    opacity: 0.5;
    animation: ${orbitalShine} 3s infinite;
  }
`;

const ConnectionLine = styled.div<{ color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  height: 2px;
  background-color: ${props => props.color};
  transform-origin: left center;
  box-shadow: 0 0 8px ${props => props.color};
  opacity: 0.7;
  pointer-events: none;
`;

// Calculate position on orbit
const getPointPosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  return { x, y, angle };
};

interface OrbitFeaturePointProps {
  icon: React.ReactNode;
  index: number;
  totalPoints: number;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}

const OrbitFeaturePoint: React.FC<OrbitFeaturePointProps> = ({ 
  icon, 
  index, 
  totalPoints, 
  color,
  active,
  onClick
}) => {
  const position = getPointPosition(index, totalPoints, 45);
  
  return (
    <>
      <FeaturePoint 
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        color={color}
        index={index}
        active={active}
        onClick={onClick}
      >
        {icon}
      </FeaturePoint>
      {active && (
        <ConnectionLine 
          color={color || theme.colors.primary}
          style={{ 
            left: '50%',
            width: `${45}%`,
            transform: `rotate(${position.angle}rad)`
          }}
        />
      )}
    </>
  );
};

interface PlanetProps {
  type: 'build' | 'scale';
  size?: string;
  active?: boolean;
  showOrbit?: boolean;
  color?: string;
  delay?: string;
  zIndex?: number;
  orbitPoints?: React.ReactNode[];
  activeFeatureIndex?: number;
  onFeatureClick?: (index: number) => void;
}

const Planet: React.FC<PlanetProps> = ({ 
  type, 
  size = "300px", 
  active = false, 
  showOrbit = true,
  color = 'rgba(92, 69, 255, 0.4)',
  delay,
  zIndex,
  orbitPoints = [],
  activeFeatureIndex,
  onFeatureClick
}) => {
  const planetSrc = type === 'build' ? '/planet1.webp' : '/planet2.webp';
  const orbitColor = type === 'build' ? 'rgba(0, 210, 194, 0.2)' : 'rgba(138, 112, 255, 0.2)';
  const baseColor = type === 'build' ? '#00d2c2' : '#8a70ff';
  
  return (
    <>
      {showOrbit && <OrbitPath size={size} color={orbitColor} />}
      
      {orbitPoints.length > 0 && (
        <>
          <Orbit 
            size={`calc(${size} * 2.2)`} 
            duration="60s"
            color={orbitColor}
          >
            {orbitPoints.map((icon, index) => (
              <OrbitFeaturePoint
                key={index}
                icon={icon}
                index={index}
                totalPoints={orbitPoints.length}
                color={baseColor}
                active={activeFeatureIndex === index}
                onClick={() => onFeatureClick && onFeatureClick(index)}
              />
            ))}
          </Orbit>
          <Orbit 
            size={`calc(${size} * 1.8)`} 
            duration="40s"
            color={orbitColor}
            reverse
            delay="5s"
          />
        </>
      )}

      <PlanetContainer 
        size={size} 
        active={active} 
        color={color}
        delay={delay}
        planetType={type}
        zIndex={zIndex}
      >
        <PlanetGlow color={baseColor} />
        <PlanetImage src={planetSrc} alt={`${type} planet`} />
        <PlanetRing color={baseColor} />
      </PlanetContainer>
    </>
  );
};

export default Planet; 