import React, { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Benefits from './components/Benefits';
import Explorer from './components/Explorer';
import Statistics from './components/Statistics';
import MetricsPanel from './components/MetricsPanel/MetricsPanel';
import FunctionEditor from './components/FunctionEditor/FunctionEditor';
import LiveDemo from './components/LiveDemo/LiveDemo';
import RealTimeMetrics from './components/RealTimeMetrics/RealTimeMetrics';
import PriceAlertDemo from './components/PriceAlertDemo/PriceAlertDemo';
import GlobalStyles from './GlobalStyles';
import styled from 'styled-components';
import BackgroundImage from './components/Features/BackgroundImage';
import DeploymentService from './services/DeploymentService';
import MetricsService from './services/MetricsService';
import { Toaster } from 'react-hot-toast';

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  scroll-behavior: smooth;
`;

const BackgroundPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(14, 14, 28, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14, 14, 28, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
  pointer-events: none;
`;

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'metrics' | 'demo'>('home');

  // Apply scroll-snap behavior to body when Explorer section is in view
  useEffect(() => {
    const body = document.body;

    // Add CSS for smooth scrolling
    body.style.scrollBehavior = 'smooth';

    // Subscribe to metrics updates for any components that need it
    const unsubscribe = MetricsService.subscribe(() => {
      // Metrics updates are handled by individual components
    });

    return () => {
      // Cleanup
      body.style.scrollBehavior = '';
      unsubscribe();
    };
  }, []);

  const handleDeploy = async (functionData: any): Promise<void> => {
    try {
      const result = await DeploymentService.deployFunction(functionData);
      if (result.success) {
        console.log('Function deployed successfully:', result);
      } else {
        console.error('Deployment failed:', result.error);
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  };

  // Navigation components
  const NavigationBar = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(138, 112, 255, 0.3);
    border-radius: 50px;
    padding: 0.5rem;
    z-index: 1000;
  `;

  const NavButton = styled.button<{ active?: boolean }>`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 25px;
    background: ${props => props.active ? 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)' : 'transparent'};
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: ${props => props.active ? 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)' : 'rgba(138, 112, 255, 0.2)'};
    }
  `;

  // Add floating action button for function editor
  const FloatingActionButton = styled.button`
    position: fixed;
    bottom: 30px;
    left: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(138, 112, 255, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 35px rgba(138, 112, 255, 0.6);
    }
  `;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'metrics':
        return <RealTimeMetrics />;
      case 'demo':
        return (
          <div>
            <PriceAlertDemo />
            <LiveDemo />
          </div>
        );
      default:
        return (
          <>
            <Hero />
            <Features />
            <Statistics />
            <PriceAlertDemo />
            <Benefits />
            <Explorer />
            <MetricsPanel chainId={10143} />
          </>
        );
    }
  };

  return (
    <AppContainer>
      <GlobalStyles />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 10, 15, 0.95)',
            color: '#fff',
            border: '1px solid rgba(138, 112, 255, 0.3)',
            borderRadius: '8px',
          },
        }}
      />

      <BackgroundImage src="/features-bg.webp" overlayOpacity={0.9} />
      <BackgroundPattern />

      {/* Navigation */}
      <NavigationBar>
        <NavButton
          active={currentView === 'home'}
          onClick={() => setCurrentView('home')}
        >
          🏠 Home
        </NavButton>
        <NavButton
          active={currentView === 'metrics'}
          onClick={() => setCurrentView('metrics')}
        >
          📊 Live Metrics
        </NavButton>
        <NavButton
          active={currentView === 'demo'}
          onClick={() => setCurrentView('demo')}
        >
          🚀 Demo
        </NavButton>
      </NavigationBar>

      {renderCurrentView()}

      <FunctionEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onDeploy={handleDeploy}
      />

      <FloatingActionButton
        onClick={() => setIsEditorOpen(true)}
        title="Write Function"
      >
        ✍️
      </FloatingActionButton>
    </AppContainer>
  );
}

export default App;
