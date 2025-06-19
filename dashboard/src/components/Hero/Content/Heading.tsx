import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const MainHeadingContainer = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.1;
  
  span {
    color: ${theme.colors.secondary};
    display: block;
  }
`;

interface HeadingProps {
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({ className }) => {
  return (
    <MainHeadingContainer className={className}>
      Full-Stack
      <br />
      Infrastructure for
      <br />
      <span>Web3</span> Pros
    </MainHeadingContainer>
  );
};

export default Heading; 