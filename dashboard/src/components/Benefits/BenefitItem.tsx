import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import EnhancedImage from './EnhancedImage';

interface BenefitItemProps {
  title: string;
  description: string;
  image: string;
}

// const float = keyframes`
//   0%, 100% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
// `;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(138, 112, 255, 0);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(138, 112, 255, 0.3);
  }
`;

const ItemContainer = styled.div`
  background-color: rgba(18, 18, 30, 0.6);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(138, 112, 255, 0.1);
  z-index: 1;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    
    .image-container {
      transform: scale(1.05);
    }
    
    .title {
      color: ${theme.colors.secondary};
    }
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #0c0c14;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  transition: transform 0.5s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(0, 210, 194, 0.1) 0%, transparent 70%);
    z-index: 0;
  }
`;

const GlowingBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, transparent, ${theme.colors.secondary}, transparent);
  opacity: 0.7;
  animation: ${pulse} 3s ease-in-out infinite;
`;

const ContentContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${theme.colors.text};
  transition: color 0.3s ease;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${theme.colors.textSecondary};
`;

const BenefitItem: React.FC<BenefitItemProps> = ({ title, description, image }) => {
  return (
    <ItemContainer>
      <GlowingBorder />
      <ImageContainer className="image-container">
        <EnhancedImage src={image} alt={title} />
      </ImageContainer>
      <ContentContainer>
        <Title className="title">{title}</Title>
        <Description>{description}</Description>
      </ContentContainer>
    </ItemContainer>
  );
};

export default BenefitItem; 