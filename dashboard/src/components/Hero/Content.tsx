import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Button from '../common/Button';
import ClientLogos from './ClientLogos';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 1rem;
  }
`;

const Heading = styled.h1`
  font-size: 5rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 0.5rem;
  line-height: 1.1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 3rem;
  }
`;

const SubHeading = styled.h1`
  font-size: 5rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 1.5rem;
  line-height: 1.1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 3rem;
  }
`;

const ColoredText = styled.span`
  color: ${theme.colors.secondary};
`;

const Subheading = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.6;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  color: ${theme.colors.textSecondary};
  
  &::before {
    content: '→';
    margin-right: 1rem;
    color: ${theme.colors.secondary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 4rem;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  font-weight: 600;
`;

const SignUpButton = styled(StyledButton)`
  background-color: ${theme.colors.secondary};
  &:hover {
    background-color: #7c61ff;
  }
`;

const ContactSalesButton = styled(StyledButton)`
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
`;

const HeroContent: React.FC = () => {
  return (
    <Container>
      <Heading>
        Monad FaaS
      </Heading>
      <SubHeading>
        Serverless Functions for <ColoredText>Monad</ColoredText> Blockchain
      </SubHeading>
      <Subheading>
        Deploy small serverless functions (WebAssembly, JS, Python) that automatically run in parallel
        in response to on-chain or HTTP/webhook triggers—just like AWS Lambda, but on-chain,
        with pay-as-you-go gas abstraction.
      </Subheading>

      <FeatureList>
        <FeatureItem>WebAssembly & JavaScript Runtime</FeatureItem>
        <FeatureItem>On-chain & HTTP/Webhook Triggers</FeatureItem>
        <FeatureItem>Parallel Execution & Gas Optimization</FeatureItem>
        <FeatureItem>Real-time Metrics & Monitoring</FeatureItem>
      </FeatureList>

      <ButtonContainer>
        <SignUpButton>Deploy Functions</SignUpButton>
        <ContactSalesButton>View Demo</ContactSalesButton>
      </ButtonContainer>
      
      <ClientLogos />
    </Container>
  );
};

export default HeroContent; 