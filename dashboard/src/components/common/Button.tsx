import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ButtonContainer = styled.button<{ primary?: boolean; size?: string }>`
  display: inline-block;
  padding: ${props => 
    props.size === 'small' ? '0.5rem 1rem' : 
    props.size === 'large' ? '1rem 2rem' : 
    '0.75rem 1.5rem'
  };
  border-radius: 6px;
  font-weight: 600;
  font-size: ${props => 
    props.size === 'small' ? '0.875rem' : 
    props.size === 'large' ? '1.125rem' : 
    '1rem'
  };
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  text-align: center;
  outline: none;
  
  ${props => props.primary 
    ? css`
      background-color: ${theme.colors.primary};
      color: white;
      border: none;
      box-shadow: 0 4px 14px rgba(92, 69, 255, 0.3);
      
      &:hover {
        background-color: ${theme.colors.primaryHover};
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(92, 69, 255, 0.4);
      }
    `
    : css`
      background-color: transparent;
      color: ${theme.colors.text};
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.3);
      }
    `
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Button: React.FC<ButtonProps> = ({ 
  primary = false, 
  size = 'medium', 
  onClick, 
  children,
  className
}) => {
  return (
    <ButtonContainer 
      primary={primary} 
      size={size} 
      onClick={onClick}
      className={className}
    >
      {children}
    </ButtonContainer>
  );
};

export default Button; 