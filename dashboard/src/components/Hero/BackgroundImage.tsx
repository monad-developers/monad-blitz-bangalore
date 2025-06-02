import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div<{ loaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  opacity: ${props => props.loaded ? 0.7 : 0};
  transition: opacity 0.5s ease;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(14, 14, 28, 0.6);
  z-index: 1;
`;

interface BackgroundImageProps {
  src: string;
  className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ src, className }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <BackgroundContainer className={className} loaded={loaded}>
      <StyledImage src={src} alt="Background" />
      <Overlay />
    </BackgroundContainer>
  );
};

export default BackgroundImage; 