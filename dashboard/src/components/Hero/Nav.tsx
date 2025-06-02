import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImg = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 10px;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavItem = styled.a`
  color: ${theme.colors.text};
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${theme.colors.secondary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DashboardButton = styled.a`
  background-color: ${theme.colors.secondary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #7c61ff;
    transform: translateY(-2px);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

// Tenderly logo (simplified version)
const TenderlyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM27.5 15L20 25L12.5 15H27.5Z" fill="#8A70FF"/>
  </svg>
);

export {
  NavContainer,
  Logo,
  LogoImg,
  LogoText,
  NavLinks,
  NavItem,
  DashboardButton,
  MobileMenuButton,
  TenderlyLogo
};