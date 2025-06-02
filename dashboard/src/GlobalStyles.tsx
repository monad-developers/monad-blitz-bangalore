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
    outline: none;
    
    &:focus {
      outline: none;
    }
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
  
  /* Dashboard-specific styles */
  .dashboard-container {
    position: relative;
    z-index: 10;
  }
  
  /* Reusable animation keyframes */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(138, 112, 255, 0.3);
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 112, 255, 0.5);
  }
  
  /* Glass morphism effect */
  .glass {
    background: rgba(26, 26, 46, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: ${theme.borderRadius.medium};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  /* Gradient text */
  .gradient-text {
    background: linear-gradient(90deg, #8A70FF, #5C55DF, #4ECDC4);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
`;

export default GlobalStyles; 