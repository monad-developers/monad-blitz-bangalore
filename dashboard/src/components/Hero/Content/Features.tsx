import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const SubHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.lg} 0;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};
  font-size: 1rem;
  
  &::before {
    content: '→';
    color: ${theme.colors.secondary};
  }
`;

interface FeaturesProps {
  className?: string;
}

const Features: React.FC<FeaturesProps> = ({ className }) => {
  return (
    <SubHeadingContainer className={className}>
      <Feature>Customizable Node RPC</Feature>
      <Feature>Collaborative dev infrastructure</Feature>
      <Feature>Industry-recognized exploration tools</Feature>
    </SubHeadingContainer>
  );
};

export default Features; 