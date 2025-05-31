import React from 'react';
import styled from 'styled-components';
import Heading from './Heading';
import Features from './Features';
import CTAButtons from './CTAButtons';
import HeroImage from './HeroImage';
import ClientLogos from '../Logos';
import { theme } from '../../../styles/theme';

const HeroContentContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xl} 0;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    padding: ${theme.spacing.lg} 0;
  }
`;

const HeroText = styled.div`
  max-width: 600px;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 100%;
    text-align: center;
  }
`;

interface HeroContentProps {
  className?: string;
}

const HeroContent: React.FC<HeroContentProps> = ({ className }) => {
  return (
    <HeroContentContainer className={className}>
      <HeroText>
        <Heading />
        <Features />
        <CTAButtons />
        <ClientLogos />
      </HeroText>
      
      <HeroImage />
    </HeroContentContainer>
  );
};

export default HeroContent; 