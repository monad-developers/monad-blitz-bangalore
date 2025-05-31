import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Planet from './Planets/Planet';
import FeatureCard from './Cards/FeatureCard';
import { theme } from '../../styles/theme';
import {
  TestnetIcon,
  IntegrationIcon,
  DevelopmentIcon,
  RPCIcon,
  CollaborationIcon,
  MonitoringIcon,
  FrameworkIcon,
  GlobalIcon
} from './Icons';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(138, 112, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(138, 112, 255, 0.6);
  }
`;

const borderGlow = keyframes`
  0%, 100% {
    border-color: rgba(138, 112, 255, 0.3);
  }
  50% {
    border-color: rgba(138, 112, 255, 0.6);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const lineGrow = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const FeaturesSectionContainer = styled.section`
  width: 100%;
  min-height: 100vh;
  padding: 2rem 0 5rem;
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(14, 14, 28, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14, 14, 28, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
  pointer-events: none;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  opacity: 0;
  animation: ${slideIn} 0.8s forwards ease-out;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 1rem;
  line-height: 1.2;
  
  span {
    color: ${theme.colors.secondary};
    display: inline-block;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.textSecondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PlanetsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 800px;
  perspective: 1000px;
  margin-bottom: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 600px;
  }
`;

const PlanetsWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`;

const FeatureBoxesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 1.5rem;
  position: relative;
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureBox = styled.div<{ color: string; position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' }>`
  position: relative;
  padding: 1.5rem;
  background: rgba(14, 14, 28, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.color || 'rgba(138, 112, 255, 0.2)'};
  border-radius: 8px;
  animation: ${borderGlow} 4s infinite ease-in-out;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(to bottom right, 
      ${props => props.color}05 0%, 
      transparent 40%, 
      transparent 60%, 
      ${props => props.color}05 100%
    );
    opacity: 0.3;
    z-index: -1;
  }
  
  // Define different corner styles
  ${props => {
    switch(props.position) {
      case 'topleft':
        return `
          grid-column: 1;
          grid-row: 1;
        `;
      case 'topright':
        return `
          grid-column: 2;
          grid-row: 1;
        `;
      case 'bottomleft':
        return `
          grid-column: 1;
          grid-row: 2;
        `;
      case 'bottomright':
        return `
          grid-column: 2;
          grid-row: 2;
        `;
      default:
        return '';
    }
  }}
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-column: 1;
  }
`;

const FeatureBoxTitle = styled.h3<{ color: string }>`
  font-size: 1.5rem;
  color: ${props => props.color};
  margin-bottom: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
`;

const FeatureItemsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const BuildPlanetPosition = styled.div`
  position: absolute;
  left: 38%;
  top: 45%;
  transform: translate(-50%, -50%);
  
  @media (max-width: ${theme.breakpoints.md}) {
    left: 40%;
  }
`;

const ScalePlanetPosition = styled.div`
  position: absolute;
  right: 18%;
  top: 45%;
  transform: translate(-50%, -50%);
  
  @media (max-width: ${theme.breakpoints.md}) {
    right: 0;
  }
`;

const ConnectorLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, 
    rgba(0, 210, 194, 0.7), 
    rgba(138, 112, 255, 0.7)
  );
  z-index: 0;
  opacity: 0;
  animation: ${slideIn} 1s forwards ease-out;
  animation-delay: 0.5s;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: -5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  &::before {
    left: 25%;
    background-color: rgba(0, 210, 194, 1);
    box-shadow: 0 0 10px rgba(0, 210, 194, 1);
  }
  
  &::after {
    right: 25%;
    background-color: rgba(138, 112, 255, 1);
    box-shadow: 0 0 10px rgba(138, 112, 255, 1);
  }
`;

const CrossConnector = styled.div`
  position: absolute;
  width: 70%;
  height: 70%;
  left: 15%;
  top: 15%;
  border: 1px dashed rgba(138, 112, 255, 0.2);
  border-radius: 50%;
  z-index: 0;
  transform: rotate(45deg);
  opacity: 0;
  animation: ${slideIn} 1s forwards ease-out;
  animation-delay: 0.7s;
`;

const FeatureCardStyled = styled(FeatureCard)<{ active?: boolean; delay?: number }>`
  opacity: 0;
  animation: ${slideIn} 0.8s forwards ease-out;
  animation-delay: ${props => `${0.3 + (props.delay || 0) * 0.1}s`};
  transition: all 0.3s ease;
  
  ${props => props.active && `
    opacity: 1;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  `}
  
  &:hover {
    transform: translateY(-7px) scale(1.02);
  }
`;

interface FeatureData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'build' | 'scale';
  color: string;
}

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [activeBuildIndex, setActiveBuildIndex] = useState<number | null>(null);
  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);
  const planetsContainerRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for the planets container
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!planetsContainerRef.current) return;
      
      const container = planetsContainerRef.current;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      container.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    };
    
    const handleMouseLeave = () => {
      if (!planetsContainerRef.current) return;
      planetsContainerRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };
    
    const container = planetsContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);
  
  const features: FeatureData[] = [
    {
      id: 'virtual-testnets',
      title: 'Virtual Testnets',
      description: 'Replace rigid public testnets with customizable, zero-setup dev environments',
      icon: <TestnetIcon />,
      category: 'build',
      color: '#00d2c2'
    },
    {
      id: 'smart-contract-dev',
      title: 'Smart Contract Development',
      description: 'Build and test smart contracts with a full development environment',
      icon: <DevelopmentIcon />,
      category: 'build',
      color: '#00d2c2'
    },
    {
      id: 'framework-integration',
      title: 'Framework Integration',
      description: 'Move across EVM chains with your entire stack natively supported',
      icon: <FrameworkIcon />,
      category: 'build',
      color: '#00d2c2'
    },
    {
      id: 'testing-integration',
      title: 'Testing & Integration',
      description: 'Seamlessly integrate with your existing testing workflow',
      icon: <IntegrationIcon />,
      category: 'build',
      color: '#00d2c2'
    },
    {
      id: 'node-rpc',
      title: 'Node RPC',
      description: 'Go beyond the node standard with a scalable and extensible Node RPC',
      icon: <RPCIcon />,
      category: 'scale',
      color: '#8a70ff'
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Work together in real-time with your team on your blockchain projects',
      icon: <CollaborationIcon />,
      category: 'scale',
      color: '#8a70ff'
    },
    {
      id: 'global-rpc',
      title: 'Global RPC Traffic',
      description: 'Advanced API & RPC services with global distribution for low latency',
      icon: <GlobalIcon />,
      category: 'scale',
      color: '#8a70ff'
    },
    {
      id: 'chain-monitoring',
      title: 'Chain Ops & Monitoring',
      description: 'Access granular on-chain data with Web3-native dev tooling',
      icon: <MonitoringIcon />,
      category: 'scale',
      color: '#8a70ff'
    }
  ];
  
  const buildFeatures = features.filter(feature => feature.category === 'build');
  const scaleFeatures = features.filter(feature => feature.category === 'scale');
  
  const activeFeatureData = features.find(feature => feature.id === activeFeature);
  
  const buildIcons = buildFeatures.map(feature => feature.icon);
  const scaleIcons = scaleFeatures.map(feature => feature.icon);
  
  const handleFeatureClick = (id: string) => {
    if (activeFeature === id) {
      setActiveFeature(null);
      setActiveBuildIndex(null);
      setActiveScaleIndex(null);
    } else {
      setActiveFeature(id);
      const feature = features.find(f => f.id === id);
      if (feature) {
        if (feature.category === 'build') {
          const index = buildFeatures.findIndex(f => f.id === id);
          setActiveBuildIndex(index);
          setActiveScaleIndex(null);
        } else {
          const index = scaleFeatures.findIndex(f => f.id === id);
          setActiveScaleIndex(index);
          setActiveBuildIndex(null);
        }
      }
    }
  };
  
  const handleBuildOrbitPointClick = (index: number) => {
    const featureId = buildFeatures[index]?.id;
    if (featureId) {
      handleFeatureClick(featureId);
    }
  };
  
  const handleScaleOrbitPointClick = (index: number) => {
    const featureId = scaleFeatures[index]?.id;
    if (featureId) {
      handleFeatureClick(featureId);
    }
  };
  
  return (
    <FeaturesSectionContainer>
      <BackgroundPattern />
      <ContentContainer>
        <SectionHeader>
          <Title>Web3 development stack. <span>Turbocharged.</span></Title>
          <Subtitle>
            Accelerate your on-chain velocity by adopting the most advanced, full-stack development platform for Web3.
          </Subtitle>
        </SectionHeader>
        
        <FeaturesContainer>
          <PlanetsContainer ref={planetsContainerRef}>
            <ConnectorLine />
            <CrossConnector />
            
            <PlanetsWrapper>
              <BuildPlanetPosition>
                <Planet 
                  type="build" 
                  size="280px" 
                  active={activeFeatureData?.category === 'build'} 
                  color="rgba(0, 210, 194, 0.6)"
                  zIndex={2}
                  orbitPoints={buildIcons}
                  activeFeatureIndex={activeBuildIndex !== null ? activeBuildIndex : undefined}
                  onFeatureClick={handleBuildOrbitPointClick}
                />
              </BuildPlanetPosition>
              
              <ScalePlanetPosition>
                <Planet 
                  type="scale" 
                  size="250px"
                  active={activeFeatureData?.category === 'scale'}
                  color="rgba(138, 112, 255, 0.6)"
                  delay="2s"
                  zIndex={2}
                  orbitPoints={scaleIcons}
                  activeFeatureIndex={activeScaleIndex !== null ? activeScaleIndex : undefined}
                  onFeatureClick={handleScaleOrbitPointClick}
                />
              </ScalePlanetPosition>
            </PlanetsWrapper>
          </PlanetsContainer>
          
          <FeatureBoxesGrid>
            <FeatureBox color="#00d2c2" position="topleft">
              <FeatureBoxTitle color="#00d2c2">VIRTUAL TESTNETS</FeatureBoxTitle>
              <FeatureItemsContainer>
                {buildFeatures.slice(0, 2).map((feature, index) => (
                  <FeatureCardStyled 
                    key={feature.id}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    active={activeFeature === feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    delay={index}
                  />
                ))}
              </FeatureItemsContainer>
            </FeatureBox>
            
            <FeatureBox color="#8a70ff" position="topright">
              <FeatureBoxTitle color="#8a70ff">DEVELOPER EXPLORER</FeatureBoxTitle>
              <FeatureItemsContainer>
                {scaleFeatures.slice(0, 2).map((feature, index) => (
                  <FeatureCardStyled 
                    key={feature.id}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    active={activeFeature === feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    delay={index + 2}
                  />
                ))}
              </FeatureItemsContainer>
            </FeatureBox>
            
            <FeatureBox color="#00d2c2" position="bottomleft">
              <FeatureBoxTitle color="#00d2c2">INTEGRATIONS</FeatureBoxTitle>
              <FeatureItemsContainer>
                {buildFeatures.slice(2, 4).map((feature, index) => (
                  <FeatureCardStyled 
                    key={feature.id}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    active={activeFeature === feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    delay={index + 4}
                  />
                ))}
              </FeatureItemsContainer>
            </FeatureBox>
            
            <FeatureBox color="#8a70ff" position="bottomright">
              <FeatureBoxTitle color="#8a70ff">NODE RPC</FeatureBoxTitle>
              <FeatureItemsContainer>
                {scaleFeatures.slice(2, 4).map((feature, index) => (
                  <FeatureCardStyled 
                    key={feature.id}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    active={activeFeature === feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    delay={index + 6}
                  />
                ))}
              </FeatureItemsContainer>
            </FeatureBox>
          </FeatureBoxesGrid>
        </FeaturesContainer>
      </ContentContainer>
    </FeaturesSectionContainer>
  );
};

export default Features; 