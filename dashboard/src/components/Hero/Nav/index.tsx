import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const NavBarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  width: 100%;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color ${theme.transitions.default};
  cursor: pointer;
  
  &:hover {
    color: ${theme.colors.text};
  }
`;

const NavLinkWithArrow = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &::after {
    content: '▾';
    font-size: 0.7rem;
  }
`;

const DashboardButton = styled.a`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.pill};
  text-decoration: none;
  font-weight: 500;
  transition: background-color ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
  }
`;

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  return (
    <NavBarContainer className={className}>
      <LogoWrapper>
        <svg width="40" height="40" viewBox="0 0 50 50" fill={theme.colors.primary}>
          <path d="M25 5L5 15v20l20 10 20-10V15L25 5z" fillOpacity="0.4" />
          <path d="M25 5L5 15l20 10 20-10L25 5z" />
          <path d="M25 35l-20-10v10l20 10 20-10V25L25 35z" />
        </svg>
        <LogoText>tenderly</LogoText>
      </LogoWrapper>
      
      <NavLinks>
        <NavLinkWithArrow>Product</NavLinkWithArrow>
        <NavLinkWithArrow>Solutions</NavLinkWithArrow>
        <NavLinkWithArrow>Learn</NavLinkWithArrow>
        <NavLink>Pricing</NavLink>
        <DashboardButton href="#">Go to Dashboard</DashboardButton>
      </NavLinks>
    </NavBarContainer>
  );
};

export default NavBar; 