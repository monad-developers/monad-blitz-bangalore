import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const LogosContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
`;

const LogosGrid = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 3rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: 2rem;
  }
`;

const LogoItem = styled.div`
  opacity: 0.7;
  transition: opacity 0.2s ease;
  filter: grayscale(100%);
  
  &:hover {
    opacity: 1;
    filter: grayscale(0%);
  }
`;

// Company logo components
const CompanyLogo = ({ name }: { name: string }) => {
  const logoStyle = {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  };
  
  return <div style={logoStyle}>{name}</div>;
};

const ClientLogos: React.FC = () => {
  return (
    <LogosContainer>
      <LogosGrid>
        <LogoItem><CompanyLogo name="induit" /></LogoItem>
        <LogoItem><CompanyLogo name="Chainlink" /></LogoItem>
        <LogoItem><CompanyLogo name="Uniswap" /></LogoItem>
        <LogoItem><CompanyLogo name="aave" /></LogoItem>
        <LogoItem><CompanyLogo name="MAKER" /></LogoItem>
        <LogoItem><CompanyLogo name="Safe" /></LogoItem>
        <LogoItem><CompanyLogo name="world" /></LogoItem>
      </LogosGrid>
    </LogosContainer>
  );
};

export default ClientLogos; 