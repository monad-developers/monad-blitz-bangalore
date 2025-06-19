import React, { useRef, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

// Import images from assets
import explorerImage1 from '../../assets/home-explorer-1-mob.webp';
import explorerImage2 from '../../assets/home-explorer-2-mob.webp';
import explorerImage3 from '../../assets/home-explorer-3.webp';
import explorerImage4 from '../../assets/home-explorer-4.webp';
import explorerImage5 from '../../assets/home-explorer-5-mob.webp';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const bounce = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(5px);
  }
`;

// Styled components
const ExplorerSectionContainer = styled.section`
  width: 100%;
  min-height: 100vh;
  padding: 4rem 0;
  position: relative;
  background-color: ${theme.colors.background};
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s forwards ease-out;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 1rem;
  line-height: 1.2;
  
  span {
    color: ${theme.colors.secondary};
    display: inline-block;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.textSecondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ExplorerContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const TimelineContainer = styled.div`
  position: sticky;
  top: 120px;
  height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeInLeft} 1s forwards;
  
  @media (max-width: ${theme.breakpoints.md}) {
    position: relative;
    top: 0;
    height: auto;
    margin-bottom: 2rem;
  }
`;

const ImagesContainer = styled.div`
  position: relative;
  min-height: 400px;
  animation: ${fadeInRight} 1s forwards;
  
  @media (max-width: ${theme.breakpoints.md}) {
    min-height: 300px;
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const Dot = styled.button<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isActive ? theme.colors.secondary : theme.colors.backgroundMedium};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: scale(1.2);
  }
`;

// Timeline Item components
const TimelineItem = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  padding: 1.5rem;
  position: relative;
  padding-left: 3rem;
  margin-bottom: 0.5rem;
  background-color: ${props => props.isActive ? 'rgba(138, 112, 255, 0.1)' : 'transparent'};
  border-radius: ${theme.borderRadius.medium};
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: ${props => props.isActive ? 1 : props.isCompleted ? 0.8 : 0.5};
  
  &:hover {
    background-color: rgba(138, 112, 255, 0.05);
    opacity: ${props => props.isActive ? 1 : 0.7};
  }
  
  animation: ${props => props.isActive ? pulse : 'none'} 2s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    left: 1.5rem;
    top: 1.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: ${props => 
      props.isActive 
        ? theme.colors.secondary 
        : props.isCompleted 
          ? 'rgba(138, 112, 255, 0.6)'
          : theme.colors.backgroundMedium
    };
    transition: background-color 0.3s;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 2rem;
    top: ${props => props.isActive ? '2.5rem' : '1.5rem'};
    width: 1px;
    height: ${props => props.isActive ? 'calc(100% - 1rem)' : '100%'};
    background-color: ${props => 
      props.isActive || props.isCompleted
        ? 'rgba(138, 112, 255, 0.4)'
        : theme.colors.backgroundMedium
    };
    transition: background-color 0.3s;
  }
  
  &:last-child::after {
    display: none;
  }
`;

const ItemTitle = styled.h3<{ isActive: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.isActive ? theme.colors.secondary : theme.colors.text};
  margin-bottom: 0.5rem;
  transition: color 0.3s;
`;

const ItemDescription = styled.p<{ isActive: boolean }>`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${props => props.isActive ? theme.colors.text : theme.colors.textSecondary};
  margin: 0;
  transition: color 0.3s;
  max-height: ${props => props.isActive ? '100px' : '0'};
  overflow: hidden;
  opacity: ${props => props.isActive ? 1 : 0};
  transition: max-height 0.3s, opacity 0.3s;
`;

// Image component
const ExplorerImage = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.isActive ? 1 : 0};
  transition: opacity 0.5s ease;
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(220, 38, 38, 0.9);
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(138, 112, 255, 0.8);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${fadeIn} 0.5s ease-out, ${bounce} 1.5s infinite alternate;
  z-index: 90;
  
  &::after {
    content: '↓';
    font-size: 1rem;
  }
`;

const timelineData = [
  {
    id: 1,
    title: 'Function Registry',
    description: 'View all deployed serverless functions with metadata, WASM hashes, and trigger configurations stored on-chain.',
    image: explorerImage1,
    hasError: false
  },
  {
    id: 2,
    title: 'Execution Logs',
    description: 'Monitor real-time function executions with detailed logs, success rates, and performance metrics.',
    image: explorerImage2,
    hasError: false
  },
  {
    id: 3,
    title: 'Trigger Monitor',
    description: 'Track active triggers including price alerts, webhooks, and on-chain events with live status updates.',
    image: explorerImage3,
    hasError: false
  },
  {
    id: 4,
    title: 'Gas Analytics',
    description: 'Analyze gas consumption patterns, optimize costs, and monitor sponsored transaction efficiency.',
    image: explorerImage4,
    hasError: false
  },
  {
    id: 5,
    title: 'Performance Profiler',
    description: 'Optimize function performance with parallel execution metrics, WASM runtime statistics, and throughput analysis.',
    image: explorerImage5,
    hasError: false
  }
];

const Explorer: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visitedItems, setVisitedItems] = useState<Set<number>>(new Set([0]));
  const [showScrollHint, setShowScrollHint] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const isScrolling = useRef(false);
  
  // Handle scroll-like navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events when the section is visible
      const section = sectionRef.current;
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      
      if (!isInView) return;
      
      // Prevent rapid scrolling
      if (isScrolling.current) return;
      isScrolling.current = true;
      
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // If we're at the last item and trying to go forward, let the normal scroll happen
      if (direction > 0 && activeIndex === timelineData.length - 1) {
        setShowScrollHint(false);
        isScrolling.current = false;
        return;
      }
      
      // If we're at the first item and trying to go backward, let the normal scroll happen
      if (direction < 0 && activeIndex === 0) {
        isScrolling.current = false;
        return;
      }
      
      // Otherwise, change the active item
      const newIndex = Math.max(0, Math.min(timelineData.length - 1, activeIndex + direction));
      
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        setVisitedItems(prev => new Set([...Array.from(prev), newIndex]));
        
        // Small enhancement: prevent page scroll when changing items within the section
        // This makes it feel more like scroll jacking without breaking the page
        if (Math.abs(rect.top) < window.innerHeight * 0.8) {
          e.preventDefault();
        }
      }
      
      // Reset the scrolling state after a short delay
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    };
    
    // Use a passive listener that only prevents scrolling conditionally
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeIndex]);
  
  // Optional: Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      
      if (!isInView) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (activeIndex < timelineData.length - 1) {
          setActiveIndex(activeIndex + 1);
          setVisitedItems(prev => new Set([...Array.from(prev), activeIndex + 1]));
        } else {
          setShowScrollHint(false);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (activeIndex > 0) {
          setActiveIndex(activeIndex - 1);
          setVisitedItems(prev => new Set([...Array.from(prev), activeIndex - 1]));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex]);
  
  // Handle item click
  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setVisitedItems(prev => new Set([...Array.from(prev), index]));
  };
  
  // Handle dot click
  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setVisitedItems(prev => new Set([...Array.from(prev), index]));
  };
  
  return (
    <ExplorerSectionContainer ref={sectionRef}>
      <ContentContainer>
        <SectionHeader>
          <Title>Function <span>Explorer</span></Title>
          <Subtitle>
            Monitor and debug your serverless functions with real-time execution logs, performance metrics, and blockchain transaction details.
          </Subtitle>
        </SectionHeader>
        
        <ExplorerContent>
          <TimelineContainer>
            {timelineData.map((item, index) => (
              <TimelineItem 
                key={item.id}
                isActive={index === activeIndex}
                isCompleted={visitedItems.has(index) && index !== activeIndex}
                onClick={() => handleItemClick(index)}
              >
                <ItemTitle isActive={index === activeIndex}>{item.title}</ItemTitle>
                <ItemDescription isActive={index === activeIndex}>
                  {item.description}
                </ItemDescription>
              </TimelineItem>
            ))}
          </TimelineContainer>
          
          <ImagesContainer>
            {timelineData.map((item, index) => (
              <ExplorerImage
                key={item.id}
                isActive={index === activeIndex}
              >
                <Image src={item.image} alt={item.title} />
                {item.hasError && (
                  <ErrorOverlay>Error: at line 315</ErrorOverlay>
                )}
              </ExplorerImage>
            ))}
          </ImagesContainer>
        </ExplorerContent>
        
        <ProgressDots>
          {timelineData.map((_, index) => (
            <Dot 
              key={index}
              isActive={index === activeIndex}
              onClick={() => handleDotClick(index)}
              aria-label={`View ${timelineData[index].title}`}
            />
          ))}
        </ProgressDots>
      </ContentContainer>
      
      {showScrollHint && activeIndex === timelineData.length - 1 && (
        <ScrollHint>
          Scroll to continue
        </ScrollHint>
      )}
    </ExplorerSectionContainer>
  );
};

export default Explorer; 