import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const ClientLogosContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xxl};
  opacity: 0.7;
  
  img {
    height: 2rem;
    filter: grayscale(100%) brightness(200%);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

interface ClientLogosProps {
  className?: string;
}

const ClientLogos: React.FC<ClientLogosProps> = ({ className }) => {
  return (
    <ClientLogosContainer className={className}>
      <img src="/safe-logo.svg" alt="Safe" />
      <img src="/world-logo.svg" alt="World" />
      <img src="/polygon-logo.svg" alt="Polygon" />
      <img src="/yearn-logo.svg" alt="Yearn" />
      <img src="/thirdweb-logo.svg" alt="ThirdWeb" />
      <img src="/immutable-logo.svg" alt="Immutable" />
      <img src="/defi-logo.svg" alt="DeFi" />
    </ClientLogosContainer>
  );
};

export default ClientLogos; 