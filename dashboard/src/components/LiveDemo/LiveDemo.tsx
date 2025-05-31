import React, { useState } from 'react';
import styled from 'styled-components';
import DeploymentService from '../../services/DeploymentService';
import MetricsService from '../../services/MetricsService';
import EtherscanService from '../../utils/etherscan';

const DemoContainer = styled.div`
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 112, 255, 0.3);
  border-radius: 24px;
  padding: 32px;
  margin: 20px 0;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle at center, rgba(138, 112, 255, 0.15) 0%, transparent 70%);
    filter: blur(60px);
    opacity: 0.6;
    z-index: 0;
    transform: translate(30%, -30%);
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, rgba(76, 205, 196, 0.15) 0%, transparent 70%);
  filter: blur(50px);
  opacity: 0.5;
  z-index: 0;
  transform: translate(-30%, 30%);
`;

const DemoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(138, 112, 255, 0.3), transparent);
  }
`;

const DemoTitle = styled.h3`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: '🚨';
    font-size: 28px;
    filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.8));
  }
  
  span {
    background: linear-gradient(135deg, #ffffff 20%, #8a70ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const DemoStatus = styled.div<{ status: 'idle' | 'deploying' | 'deployed' | 'testing' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  
  background: ${props => {
    switch (props.status) {
      case 'idle': return 'rgba(136, 136, 136, 0.15)';
      case 'deploying': return 'rgba(255, 217, 61, 0.15)';
      case 'deployed': return 'rgba(76, 205, 196, 0.15)';
      case 'testing': return 'rgba(138, 112, 255, 0.15)';
      case 'error': return 'rgba(255, 107, 107, 0.15)';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'idle': return '#aaa';
      case 'deploying': return '#ffd93d';
      case 'deployed': return '#4ecdc4';
      case 'testing': return '#8a70ff';
      case 'error': return '#ff6b6b';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
`;

const StatusDot = styled.div<{ status: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: currentColor;
  box-shadow: 0 0 10px currentColor;
  animation: ${props => props.status === 'deploying' || props.status === 'testing' ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const DemoSteps = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

const StepCard = styled.div<{ active?: boolean; completed?: boolean }>`
  background: ${props => {
    if (props.completed) return 'rgba(76, 205, 196, 0.07)';
    if (props.active) return 'rgba(138, 112, 255, 0.07)';
    return 'rgba(255, 255, 255, 0.03)';
  }};
  border: 1px solid ${props => {
    if (props.completed) return 'rgba(76, 205, 196, 0.3)';
    if (props.active) return 'rgba(138, 112, 255, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: ${props => {
    if (props.completed) return '0 8px 25px rgba(76, 205, 196, 0.1)';
    if (props.active) return '0 8px 25px rgba(138, 112, 255, 0.1)';
    return 'none';
  }};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => {
      if (props.completed) return '0 12px 30px rgba(76, 205, 196, 0.15)';
      if (props.active) return '0 12px 30px rgba(138, 112, 255, 0.15)';
      return '0 8px 20px rgba(0, 0, 0, 0.1)';
    }};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => {
      if (props.completed) return 'radial-gradient(circle at center, rgba(76, 205, 196, 0.15) 0%, transparent 70%)';
      if (props.active) return 'radial-gradient(circle at center, rgba(138, 112, 255, 0.15) 0%, transparent 70%)';
      return 'none';
    }};
    filter: blur(20px);
    opacity: 0.5;
    transform: translate(30%, -30%);
  }
`;

const StepNumber = styled.div<{ completed?: boolean; active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return 'linear-gradient(135deg, #4ecdc4 0%, #2eaaa1 100%)';
    if (props.active) return 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 16px;
  box-shadow: ${props => {
    if (props.completed) return '0 5px 15px rgba(76, 205, 196, 0.3)';
    if (props.active) return '0 5px 15px rgba(138, 112, 255, 0.3)';
    return 'none';
  }};
  transition: all 0.3s ease;
  
  ${StepCard}:hover & {
    transform: scale(1.05);
  }
`;

const StepTitle = styled.h4`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
`;

const ConfigSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #8a70ff, #4ecdc4);
    border-radius: 3px 3px 0 0;
  }
`;

const ConfigTitle = styled.h4`
  color: #8a70ff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background: rgba(138, 112, 255, 0.5);
    border-radius: 1px;
  }
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConfigLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    width: 4px;
    height: 4px;
    background: #8a70ff;
    border-radius: 50%;
  }
`;

const ConfigInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #8a70ff;
    box-shadow: 0 0 0 3px rgba(138, 112, 255, 0.1), 
                inset 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  &:hover:not(:disabled) {
    border-color: rgba(138, 112, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfigSelect = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;

  option {
    background: #1a1a2e;
    color: #ffffff;
  }

  &:focus {
    outline: none;
    border-color: #8a70ff;
    box-shadow: 0 0 0 3px rgba(138, 112, 255, 0.1), 
                inset 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  &:hover:not(:disabled) {
    border-color: rgba(138, 112, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
  background: ${props => {
    if (props.disabled) return 'rgba(136, 136, 136, 0.2)';
    if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.05)';
    return 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)';
  }};
  border: 1px solid ${props => {
    if (props.disabled) return 'rgba(136, 136, 136, 0.3)';
    if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
    return 'transparent';
  }};
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.4)' : '#ffffff'};
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => {
    if (props.disabled) return 'none';
    if (props.variant === 'secondary') return '0 5px 15px rgba(0, 0, 0, 0.1)';
    return '0 8px 25px rgba(138, 112, 255, 0.3)';
  }};
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: ${props => {
      if (props.variant === 'secondary') return '0 8px 20px rgba(0, 0, 0, 0.15)';
      return '0 12px 30px rgba(138, 112, 255, 0.4)';
    }};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255, 255, 255, 0.1), transparent);
    opacity: ${props => props.disabled ? 0 : 0.2};
  }
`;

const LogsSection = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  max-height: 240px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(138, 112, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(138, 112, 255, 0.5);
    }
  }
`;

const LogEntry = styled.div<{ type: 'info' | 'success' | 'error' | 'warning' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4ecdc4';
      case 'error': return '#ff6b6b';
      case 'warning': return '#ffd93d';
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  }};
  padding: 10px 12px;
  border-radius: 8px;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(78, 205, 196, 0.1)';
      case 'error': return 'rgba(255, 107, 107, 0.1)';
      case 'warning': return 'rgba(255, 217, 61, 0.1)';
      default: return 'rgba(255, 255, 255, 0.03)';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.type) {
      case 'success': return '#4ecdc4';
      case 'error': return '#ff6b6b';
      case 'warning': return '#ffd93d';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      switch (props.type) {
        case 'success': return 'rgba(78, 205, 196, 0.15)';
        case 'error': return 'rgba(255, 107, 107, 0.15)';
        case 'warning': return 'rgba(255, 217, 61, 0.15)';
        default: return 'rgba(255, 255, 255, 0.05)';
      }
    }};
  }
`;

const LogTime = styled.span`
  color: rgba(255, 255, 255, 0.4);
  min-width: 65px;
`;

const LogMessage = styled.span`
  flex: 1;
`;

const LogLink = styled.a`
  color: #8a70ff;
  text-decoration: none;
  background: rgba(138, 112, 255, 0.1);
  padding: 3px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(138, 112, 255, 0.2);
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

interface DemoLogEntry {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
  txHash?: string;
}

const LiveDemo: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'testing' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [token, setToken] = useState('ARB/USDC');
  const [threshold, setThreshold] = useState('0.75');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/unique-id');
  const [deployedFunction, setDeployedFunction] = useState<any>(null);
  const [logs, setLogs] = useState<DemoLogEntry[]>([]);
  const etherscanService = new EtherscanService(10143);

  const addLog = (type: DemoLogEntry['type'], message: string, txHash?: string) => {
    const newLog: DemoLogEntry = {
      type,
      message,
      timestamp: Date.now(),
      txHash
    };
    setLogs(prev => [...prev, newLog]);
  };

  const deployPriceAlertFunction = async () => {
    setStatus('deploying');
    setCurrentStep(1);
    addLog('info', 'Starting price alert function deployment...');

    try {
      const functionData = {
        name: `price-alert-${token.replace('/', '-').toLowerCase()}`,
        description: `Price alert for ${token} when price drops below $${threshold}`,
        code: `// Price Alert Function for ${token}
export async function handler(ctx) {
  const { trigger, env } = ctx;
  const { currentPrice, threshold } = trigger.data;
  
  console.log(\`Price check: ${token} = $\${currentPrice}\`);
  
  if (currentPrice < ${threshold}) {
    await ctx.sendWebhook('${webhookUrl}', {
      message: \`🚨 ${token} Alert: Price dropped to $\${currentPrice}\`,
      token: '${token}',
      currentPrice,
      threshold: ${threshold},
      timestamp: new Date().toISOString()
    });
    
    return { success: true, alertSent: true };
  }
  
  return { success: true, alertSent: false };
}`,
        runtime: 'javascript' as const,
        triggerType: 'price-threshold',
        triggerConfig: {
          token,
          threshold: parseFloat(threshold)
        },
        webhookUrl,
        gasLimit: 500000
      };

      addLog('info', 'Compiling function to WASM...');
      setCurrentStep(2);

      const result = await DeploymentService.deployFunction(functionData);

      if (result.success) {
        setDeployedFunction(result);
        setStatus('deployed');
        setCurrentStep(4);
        addLog('success', `Function deployed successfully! ID: ${result.functionId}`, result.txHash);
        addLog('success', `Trigger created with ID: ${result.triggerId}`);
      } else {
        setStatus('error');
        addLog('error', `Deployment failed: ${result.error}`);
      }

    } catch (error) {
      setStatus('error');
      addLog('error', `Deployment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testFunction = async () => {
    if (!deployedFunction) return;

    setStatus('testing');
    addLog('info', 'Testing function with mock price data...');

    try {
      const testData = {
        token,
        currentPrice: parseFloat(threshold) - 0.05, // Price below threshold
        threshold: parseFloat(threshold)
      };

      const result = await DeploymentService.testFunction(
        deployedFunction.functionId,
        deployedFunction.triggerId,
        testData
      );

      if (result.success) {
        setStatus('deployed');
        addLog('success', `Function executed successfully!`, result.txHash);
        addLog('info', `Gas used: ${result.gasUsed || '0'}`);
        addLog('success', `Webhook should be triggered at: ${webhookUrl}`);
      } else {
        addLog('error', `Test execution failed: ${result.error}`);
      }

    } catch (error) {
      addLog('error', `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetDemo = () => {
    setStatus('idle');
    setCurrentStep(0);
    setDeployedFunction(null);
    setLogs([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const steps = [
    { title: 'Configure', description: 'Set up price alert parameters' },
    { title: 'Deploy', description: 'Deploy function to blockchain' },
    { title: 'Compile', description: 'Compile JavaScript to WASM' },
    { title: 'Test', description: 'Test function execution' }
  ];

  return (
    <DemoContainer>
      <GlowEffect />
      <DemoHeader>
        <DemoTitle><span>Live Price Alert Demo</span></DemoTitle>
        <DemoStatus status={status}>
          <StatusDot status={status} />
          {status === 'idle' && 'Ready to Deploy'}
          {status === 'deploying' && 'Deploying...'}
          {status === 'deployed' && 'Deployed & Ready'}
          {status === 'testing' && 'Testing...'}
          {status === 'error' && 'Error'}
        </DemoStatus>
      </DemoHeader>

      <DemoSteps>
        {steps.map((step, index) => (
          <StepCard 
            key={index} 
            active={currentStep === index} 
            completed={currentStep > index}
          >
            <StepNumber 
              active={currentStep === index} 
              completed={currentStep > index}
            >
              {currentStep > index ? '✓' : index + 1}
            </StepNumber>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </StepCard>
        ))}
      </DemoSteps>

      <ConfigSection>
        <ConfigTitle>Price Alert Configuration</ConfigTitle>
        <ConfigGrid>
          <ConfigItem>
            <ConfigLabel>Token Pair</ConfigLabel>
            <ConfigSelect 
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              disabled={status === 'deploying' || status === 'testing'}
            >
              <option value="ARB/USDC">ARB/USDC</option>
              <option value="ETH/USDC">ETH/USDC</option>
              <option value="BTC/USDC">BTC/USDC</option>
              <option value="MATIC/USDC">MATIC/USDC</option>
            </ConfigSelect>
          </ConfigItem>
          
          <ConfigItem>
            <ConfigLabel>Price Threshold ($)</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              disabled={status === 'deploying' || status === 'testing'}
            />
          </ConfigItem>
          
          <ConfigItem style={{ gridColumn: '1 / -1' }}>
            <ConfigLabel>Webhook URL</ConfigLabel>
            <ConfigInput
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://webhook.site/your-unique-url"
              disabled={status === 'deploying' || status === 'testing'}
            />
          </ConfigItem>
        </ConfigGrid>
      </ConfigSection>

      <ActionButtons>
        <ActionButton
          onClick={deployPriceAlertFunction}
          disabled={status === 'deploying' || status === 'testing' || !token || !threshold || !webhookUrl}
        >
          {status === 'deploying' ? 'Deploying...' : 'Deploy Price Alert'}
        </ActionButton>
        
        <ActionButton
          variant="secondary"
          onClick={testFunction}
          disabled={!deployedFunction || status === 'testing' || status === 'deploying'}
        >
          {status === 'testing' ? 'Testing...' : 'Test Function'}
        </ActionButton>
        
        <ActionButton
          variant="secondary"
          onClick={resetDemo}
          disabled={status === 'deploying' || status === 'testing'}
        >
          Reset Demo
        </ActionButton>
      </ActionButtons>

      <LogsSection>
        {logs.map((log, index) => (
          <LogEntry key={index} type={log.type}>
            <LogTime>{formatTime(log.timestamp)}</LogTime>
            <LogMessage>{log.message}</LogMessage>
            {log.txHash && (
              <LogLink
                href={etherscanService.getTransactionUrl(log.txHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Tx
              </LogLink>
            )}
          </LogEntry>
        ))}
        {logs.length === 0 && (
          <LogEntry type="info">
            <LogTime>--:--</LogTime>
            <LogMessage>Ready to start demo...</LogMessage>
          </LogEntry>
        )}
      </LogsSection>
    </DemoContainer>
  );
};

export default LiveDemo;
