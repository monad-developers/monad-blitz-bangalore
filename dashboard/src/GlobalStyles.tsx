import { createGlobalStyle } from 'styled-components';
import { theme } from './styles/theme';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.primary};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    
    /* Scroll snapping container */
    scroll-behavior: smooth;
    &.scroll-snap {
      scroll-snap-type: y mandatory;
      scroll-padding-top: 80px; /* Adjust for any fixed headers */
    }
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.default};

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  button {
    cursor: pointer;
    font-family: ${theme.fonts.primary};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 1rem 0;
    font-weight: 700;
    line-height: 1.2;
  }

  p {
    margin: 0 0 1rem 0;
  }

  section {
    position: relative;
    padding: 4rem 0;
  }
  
  /* Classes for scrolljacking */
  .scroll-section {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    min-height: 100vh;
  }
`;

export default GlobalStyles; 