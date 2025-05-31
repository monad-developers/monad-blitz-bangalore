import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import BenefitItem from './BenefitItem';
import SectionHeader from './SectionHeader';
import BackgroundEffect from './BackgroundEffect';

// Images
import benefit1 from '../../assets/home-benefits-1.webp';
import benefit2 from '../../assets/home-benefits-2.webp';
import benefit3 from '../../assets/home-benefits-3.webp';
import benefit4 from '../../assets/home-benefits-4.webp';

const BenefitsSection = styled.section`
  width: 100%;
  padding: 6rem 0;
  background-color: ${theme.colors.backgroundDark};
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 3rem;
  margin-top: 5rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    grid-gap: 2rem;
  }
`;

const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(0, 210, 194, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 210, 194, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
  z-index: 0;
`;

// Data for benefits items
const benefitsData = [
  {
    id: 1,
    title: 'Function Development',
    description: 'Build serverless functions in JavaScript, Python, or Solidity-style with automatic WASM compilation. Deploy with a simple CLI command and integrate with your existing development workflow.',
    image: benefit1,
  },
  {
    id: 2,
    title: 'Automated Triggers',
    description: 'Set up price alerts, on-chain event listeners, HTTP webhooks, and time-based triggers. Functions execute automatically when conditions are met, with parallel processing for high throughput.',
    image: benefit2,
  },
  {
    id: 3,
    title: 'Gas Optimization',
    description: 'Pay-as-you-go gas model with ERC-2771 forwarder contracts for sponsored transactions. Users can execute functions without holding ETH, while developers control gas costs efficiently.',
    image: benefit3,
  },
  {
    id: 4,
    title: 'Real-time Analytics',
    description: 'Monitor function executions with live dashboards, WebSocket updates, and comprehensive metrics. Track performance, costs, success rates, and optimize your serverless architecture.',
    image: benefit4,
  },
];

const Benefits: React.FC = () => {
  return (
    <BenefitsSection>
      <GridBackground />
      <BackgroundEffect />
      <Container>
        <SectionHeader
          title="Serverless Functions, Blockchain Workflows"
          subtitle="Transform your dApp development with on-chain serverless computing and automated execution"
        />
        <BenefitsGrid>
          {benefitsData.map((benefit) => (
            <BenefitItem
              key={benefit.id}
              title={benefit.title}
              description={benefit.description}
              image={benefit.image}
            />
          ))}
        </BenefitsGrid>
      </Container>
    </BenefitsSection>
  );
};

export default Benefits; 