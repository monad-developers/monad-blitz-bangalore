import React from 'react';
import styled, { keyframes } from 'styled-components';
import HeroContent from './Content';
import DashboardModel from './DashboardModel';
import { theme } from '../../styles/theme';

const floatAnimation = keyframes`
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

const HeroSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
  position: relative;
  z-index: 1;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(45deg, ${theme.colors.primary}33, ${theme.colors.secondary}33);
  filter: blur(80px);
  z-index: 0;
  opacity: 0.5;
  animation: ${floatAnimation} 10s ease-in-out infinite;
  
  &.orb1 {
    top: -100px;
    right: 10%;
    animation-delay: 0s;
  }
  
  &.orb2 {
    bottom: -150px;
    left: 5%;
    width: 250px;
    height: 250px;
    animation-delay: -3s;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const MainContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    padding: 0 2rem;
  }
`;

const LeftContent = styled.div`
  flex: 1;
  max-width: 600px;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    max-width: 100%;
    margin-bottom: 2rem;
  }
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    width: 100%;
  }
`;

const Hero: React.FC = () => {
  return (
    <HeroSection>
      <FloatingOrb className="orb1" />
      <FloatingOrb className="orb2" />
      <ContentWrapper>
        <MainContentContainer>
          <LeftContent>
            <HeroContent />
          </LeftContent>
          <RightContent>
            <DashboardModel />
          </RightContent>
        </MainContentContainer>
      </ContentWrapper>
    </HeroSection>
  );
};

export default Hero;