import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const HeaderContainer = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${theme.colors.text};
  line-height: 1.2;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 1.1rem;
  }
`;

const Accent = styled.div`
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary});
  margin: 0 auto;
  border-radius: 4px;
`;

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <Accent />
    </HeaderContainer>
  );
};

export default SectionHeader; 