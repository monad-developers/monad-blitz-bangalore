import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../../styles/theme';

interface TimelineItemProps {
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  index: number;
  total: number;
}

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const expand = keyframes`
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
`;

// Styled components
const ItemContainer = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  position: relative;
  padding: 0 0 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isActive || props.isCompleted ? 1 : 0.5)};
  transition: opacity 0.3s ease;
  
  &:last-child {
    padding-bottom: 0;
  }
`;

const Dot = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => 
    props.isActive 
      ? theme.colors.secondary 
      : props.isCompleted 
        ? theme.colors.secondary 
        : theme.colors.backgroundMedium
  };
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  z-index: 2;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => 
      props.isActive 
        ? theme.colors.background 
        : props.isCompleted 
          ? theme.colors.background 
          : 'transparent'
    };
    transition: background-color 0.3s ease;
  }
  
  ${props => props.isCompleted && css`
    &::after {
      content: '✓';
      position: absolute;
      color: ${theme.colors.background};
      font-size: 12px;
      font-weight: bold;
    }
  `}
`;

const Line = styled.div<{ isActive: boolean; isCompleted: boolean; isLast: boolean }>`
  position: absolute;
  left: 11px;
  top: 24px;
  width: 2px;
  height: ${props => props.isLast ? '0' : 'calc(100% - 24px)'};
  background-color: ${props => 
    props.isActive || props.isCompleted
      ? theme.colors.secondary
      : theme.colors.backgroundMedium
  };
  transition: background-color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: ${props => (props.isActive || props.isCompleted) ? '100%' : '0'};
    background-color: ${theme.colors.secondary};
    transition: height 0.6s ease;
    animation: ${props => props.isActive && !props.isCompleted ? css`${expand} 0.6s forwards` : 'none'};
  }
`;

const Content = styled.div<{ isActive: boolean }>`
  padding: 0.25rem 0;
  animation: ${props => props.isActive ? css`${fadeIn} 0.4s forwards` : 'none'};
`;

const Title = styled.h3<{ isActive: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.isActive ? theme.colors.secondary : theme.colors.text};
  transition: color 0.3s ease;
`;

const Description = styled.p<{ isActive: boolean }>`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${props => props.isActive ? theme.colors.text : theme.colors.textSecondary};
  transition: color 0.3s ease;
  max-width: 350px;
  margin: 0;
`;

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  description,
  isActive,
  isCompleted,
  index,
  total
}) => {
  const isLast = index === total - 1;
  
  return (
    <ItemContainer isActive={isActive} isCompleted={isCompleted}>
      <Dot isActive={isActive} isCompleted={isCompleted} />
      <Line isActive={isActive} isCompleted={isCompleted} isLast={isLast} />
      <Content isActive={isActive}>
        <Title isActive={isActive}>{title}</Title>
        <Description isActive={isActive}>{description}</Description>
      </Content>
    </ItemContainer>
  );
};

export default TimelineItem; 