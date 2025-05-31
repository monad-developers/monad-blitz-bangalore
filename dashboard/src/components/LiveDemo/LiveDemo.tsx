import React, { useState } from 'react';
import styled from 'styled-components';
import DeploymentService from '../../services/DeploymentService';
import MetricsService from '../../services/MetricsService';
import EtherscanService from '../../utils/etherscan';

const DemoContainer = styled.div`
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 112, 255, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
`;

const DemoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const DemoTitle = styled.h3`
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const DemoStatus = styled.div<{ status: 'idle' | 'deploying' | 'deployed' | 'testing' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'idle': return 'rgba(136, 136, 136, 0.1)';
      case 'deploying': return 'rgba(255, 217, 61, 0.1)';
      case 'deployed': return 'rgba(76, 205, 196, 0.1)';
      case 'testing': return 'rgba(138, 112, 255, 0.1)';
      case 'error': return 'rgba(255, 107, 107, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'idle': return '#888';
      case 'deploying': return '#ffd93d';
      case 'deployed': return '#4ecdc4';
      case 'testing': return '#8a70ff';
      case 'error': return '#ff6b6b';
    }
  }};
`;

const StatusDot = styled.div<{ status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: ${props => props.status === 'deploying' || props.status === 'testing' ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const DemoSteps = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const StepCard = styled.div<{ active?: boolean; completed?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => {
    if (props.completed) return 'rgba(76, 205, 196, 0.3)';
    if (props.active) return 'rgba(138, 112, 255, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
`;

const StepNumber = styled.div<{ completed?: boolean; active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return '#4ecdc4';
    if (props.active) return '#8a70ff';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 12px;
`;

const StepTitle = styled.h4`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const StepDescription = styled.p`
  color: #888;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const ConfigSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ConfigTitle = styled.h4`
  color: #8a70ff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConfigLabel = styled.label`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
`;

const ConfigInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #8a70ff;
  }
`;

const ConfigSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;

  option {
    background: #1a1a2e;
    color: #ffffff;
  }

  &:focus {
    outline: none;
    border-color: #8a70ff;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
  background: ${props => {
    if (props.disabled) return 'rgba(136, 136, 136, 0.2)';
    if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
    return 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)';
  }};
  border: 1px solid ${props => {
    if (props.disabled) return 'rgba(136, 136, 136, 0.3)';
    if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.2)';
    return 'transparent';
  }};
  color: ${props => props.disabled ? '#666' : '#ffffff'};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(138, 112, 255, 0.3);
  }
`;

const LogsSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const LogEntry = styled.div<{ type: 'info' | 'success' | 'error' | 'warning' }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4ecdc4';
      case 'error': return '#ff6b6b';
      case 'warning': return '#ffd93d';
      default: return '#888';
    }
  }};
`;

const LogTime = styled.span`
  color: #666;
  min-width: 60px;
`;

const LogMessage = styled.span`
  flex: 1;
`;

const LogLink = styled.a`
  color: #8a70ff;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
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
      <DemoHeader>
        <DemoTitle>🚨 Live Price Alert Demo</DemoTitle>
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
