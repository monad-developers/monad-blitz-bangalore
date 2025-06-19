import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ExplorerImageProps {
  src: string;
  alt: string;
  isActive: boolean;
  index: number;
}

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(138, 112, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(138, 112, 255, 0.6);
  }
`;

// Styled components
const ImageContainer = styled.div<{ isActive: boolean }>`
  position: ${props => props.isActive ? 'relative' : 'absolute'};
  top: 0;
  left: 0;
  width: 100%;
  display: ${props => props.isActive ? 'block' : 'none'};
  border-radius: 12px;
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  animation: ${props => props.isActive ? css`${fadeIn} 0.6s forwards` : 'none'};
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgba(138, 112, 255, 0.3);
    pointer-events: none;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
`;

const ImageFrame = styled.div`
  position: relative;
  padding: 2px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(138, 112, 255, 0.2) 0%,
    rgba(138, 112, 255, 0.1) 100%
  );
  animation: ${glow} 4s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      rgba(138, 112, 255, 0.4) 0%,
      rgba(138, 112, 255, 0.1) 50%,
      rgba(138, 112, 255, 0.4) 100%
    );
    z-index: -1;
    opacity: 0.5;
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(220, 38, 38, 0.9);
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const HexOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 10, 20, 0.1);
  background-image: linear-gradient(rgba(138, 112, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(138, 112, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  mix-blend-mode: overlay;
`;

const ExplorerImage: React.FC<ExplorerImageProps> = ({ src, alt, isActive, index }) => {
  return (
    <ImageContainer isActive={isActive}>
      <ImageFrame>
        <StyledImage src={src} alt={alt} />
        
        {/* Add error overlay for the first image which has error messages */}
        {index === 0 && (
          <ErrorOverlay>Error: at line 315</ErrorOverlay>
        )}
        
        {/* Hex overlay for the digital effect */}
        <HexOverlay />
      </ImageFrame>
    </ImageContainer>
  );
};

export default ExplorerImage; 