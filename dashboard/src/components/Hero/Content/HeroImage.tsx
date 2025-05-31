import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../../styles/theme';

const pulse = keyframes`
  0% {
    filter: drop-shadow(0 0 20px rgba(92, 69, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(92, 69, 255, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(92, 69, 255, 0.4));
  }
`;

const rotate = keyframes`
  0% {
    transform: perspective(1200px) rotateY(-15deg);
  }
  50% {
    transform: perspective(1200px) rotateY(-10deg);
  }
  100% {
    transform: perspective(1200px) rotateY(-15deg);
  }
`;

const HeroImageContainer = styled.div`
  position: relative;
  width: 50%;
  height: 100%;
  
  svg, object, img {
    width: 100%;
    height: auto;
    transform: perspective(1200px) rotateY(-15deg);
    filter: drop-shadow(0 0 30px rgba(92, 69, 255, 0.5));
    animation: ${rotate} 6s ease-in-out infinite, ${pulse} 4s ease-in-out infinite;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    height: 60%;
    background: ${theme.colors.primary};
    filter: blur(120px);
    opacity: 0.2;
    z-index: -1;
    transform: translate(-50%, -50%);
  }
`;

interface HeroImageProps {
  className?: string;
}

const HeroImage: React.FC<HeroImageProps> = ({ className }) => {
  return (
    <HeroImageContainer className={className}>
      <object type="image/svg+xml" data="/hero-image.svg">Tenderly interface</object>
    </HeroImageContainer>
  );
};

export default HeroImage; 