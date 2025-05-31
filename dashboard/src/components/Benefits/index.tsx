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
    title: 'Local dev',
    description: 'Integrate Virtual TestNets with Hardhat or Foundry to build with mainnet data locally. Extend your local setup with advanced development tools and facilitate collaboration over a shared infrastructure.',
    image: benefit1,
  },
  {
    id: 2,
    title: 'CI/CD',
    description: 'Scale your CI process with managed environments for fast, iterative testing. Speed up your build and release cycles without additional infrastructure management overhead.',
    image: benefit2,
  },
  {
    id: 3,
    title: 'Dapp staging',
    description: 'Spin up collaborative staging environments for your smart contract, frontend, and backend teams. Eliminate development silos and enable fast, iterative, and incremental dapp development.',
    image: benefit3,
  },
  {
    id: 4,
    title: 'Public testing',
    description: 'Gather real-time feedback and identify actual usage patterns through public dapp testing. Run your dapp on a long-running, publicly accessible Virtual TestNet so users can test your dapp with an unlimited faucet.',
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
          title="Virtual TestNets, development workflows" 
          subtitle="Streamline your development process with purpose-built environments for every stage"
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