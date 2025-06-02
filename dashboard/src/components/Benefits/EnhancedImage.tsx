import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
// import { theme } from '../../styles/theme';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
}

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled.img`
  width: auto;
  height: 80%;
  object-fit: contain;
  z-index: 2;
  animation: ${float} 6s ease-in-out infinite;
  transform-origin: center;
  filter: drop-shadow(0 5px 15px rgba(0, 210, 194, 0.3));
  transition: transform 0.3s ease, filter 0.3s ease;
  
  &:hover {
    filter: drop-shadow(0 10px 25px rgba(138, 112, 255, 0.5));
  }
`;

const ImageGlow = styled.div`
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0, 210, 194, 0.2) 0%, transparent 70%);
  filter: blur(20px);
  z-index: 1;
  animation: ${pulse} 4s ease-in-out infinite;
  pointer-events: none;
`;

const Shimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 8s infinite linear;
  pointer-events: none;
  z-index: 3;
`;

const LoadingPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(110deg, #0c0c14 30%, #151529 50%, #0c0c14 70%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 8px;
`;

const EnhancedImage: React.FC<EnhancedImageProps> = ({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple lazy loading simulation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <ImageContainer className={className}>
      {isVisible && (
        <>
          {!imageLoaded && <LoadingPlaceholder />}
          <StyledImage 
            src={src} 
            alt={alt} 
            onLoad={handleImageLoad} 
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {imageLoaded && (
            <>
              <ImageGlow />
              <Shimmer />
            </>
          )}
        </>
      )}
    </ImageContainer>
  );
};

export default EnhancedImage; 