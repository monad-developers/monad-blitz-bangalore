import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const ButtonGroupContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

const PrimaryButton = styled.a`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.pill};
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  transition: background-color ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
  }
`;

const SecondaryButton = styled.a`
  background-color: transparent;
  color: ${theme.colors.text};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.pill};
  text-decoration: none;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-block;
  transition: border-color ${theme.transitions.default};
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.7);
  }
`;

interface CTAButtonsProps {
  className?: string;
}

const CTAButtons: React.FC<CTAButtonsProps> = ({ className }) => {
  return (
    <ButtonGroupContainer className={className}>
      <PrimaryButton href="#">Sign up</PrimaryButton>
      <SecondaryButton href="#">Contact sales</SecondaryButton>
    </ButtonGroupContainer>
  );
};

export default CTAButtons; 