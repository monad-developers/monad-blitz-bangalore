import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

interface CardProps {
  active?: boolean;
  color?: string;
  borderColor?: string;
}

const Card = styled.div<CardProps>`
  position: relative;
  padding: 2rem;
  background-color: rgba(20, 20, 40, 0.7);
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.active 
    ? props.borderColor || theme.colors.primary 
    : 'rgba(92, 69, 255, 0.1)'};
  
  &:hover {
    border-color: ${props => props.borderColor || theme.colors.primary};
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  ${props => props.active && `
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  `}
`;

const CardTitle = styled.h3<{ color?: string }>`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${props => props.color || theme.colors.text};
`;

const CardContent = styled.p`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const CardButton = styled.a<{ color?: string }>`
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background-color: ${props => props.color || theme.colors.primary};
  color: white;
  border-radius: ${theme.borderRadius.pill};
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => {
      const color = props.color || theme.colors.primary;
      return color === theme.colors.primary ? theme.colors.primaryHover : color;
    }};
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.color || theme.colors.primary}33;
  margin-bottom: 1.25rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.color || theme.colors.primary};
  }
`;

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  icon?: React.ReactNode;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  buttonText = "Read more",
  buttonLink = "#",
  icon,
  color = theme.colors.primary,
  active = false,
  onClick,
  className
}) => {
  return (
    <Card 
      active={active} 
      color={color} 
      borderColor={color}
      onClick={onClick}
      className={className}
    >
      {icon && <IconContainer color={color}>{icon}</IconContainer>}
      <CardTitle color={color}>{title}</CardTitle>
      <CardContent>{description}</CardContent>
      <CardButton href={buttonLink} color={color}>{buttonText}</CardButton>
    </Card>
  );
};

export default FeatureCard; 