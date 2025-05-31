import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

const EditorContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  background: rgba(10, 10, 15, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 112, 255, 0.3);
  border-radius: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const TemplateSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;

  option {
    background: #1a1a2e;
    color: #ffffff;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const CodeEditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidePanel = styled.div`
  width: 300px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #8a70ff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
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

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #8a70ff;
  }
`;

const TriggerConfig = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const TriggerTitle = styled.h4`
  color: #ffffff;
  font-size: 14px;
  margin: 0 0 12px 0;
`;

const DeployButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  background: ${props => props.disabled ? 'rgba(138, 112, 255, 0.3)' : 'linear-gradient(135deg, #8a70ff 0%, #6b5ce7 100%)'};
  border: none;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(138, 112, 255, 0.3);
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 14px;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(76, 205, 196, 0.1)';
      case 'error': return 'rgba(255, 107, 107, 0.1)';
      case 'info': return 'rgba(138, 112, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return 'rgba(76, 205, 196, 0.3)';
      case 'error': return 'rgba(255, 107, 107, 0.3)';
      case 'info': return 'rgba(138, 112, 255, 0.3)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4ecdc4';
      case 'error': return '#ff6b6b';
      case 'info': return '#8a70ff';
    }
  }};
`;

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FUNCTION_TEMPLATES = {
  'price-alert': {
    name: 'Advanced Price Alert',
    code: `// Advanced Multi-Token Price Alert Function
export async function handler(ctx) {
  const { trigger, env } = ctx;

  // Configuration for multiple tokens
  const watchList = [
    { token: "ARB/USDC", threshold: 0.75, severity: "HIGH" },
    { token: "ETH/USDT", threshold: 2000, severity: "MEDIUM" },
    { token: "BTC/USDT", threshold: 40000, severity: "LOW" }
  ];

  const alerts = [];

  for (const config of watchList) {
    // Simulate price fetch (in real implementation, use oracle)
    const currentPrice = await ctx.fetchTokenPrice(config.token);

    if (currentPrice < config.threshold) {
      const changePercent = ((currentPrice - config.threshold) / config.threshold * 100).toFixed(2);

      alerts.push({
        token: config.token,
        currentPrice,
        threshold: config.threshold,
        changePercent,
        severity: config.severity,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (alerts.length > 0) {
    // Send consolidated alert
    await ctx.sendWebhook(env.WEBHOOK_URL || "https://webhook.site/demo", {
      type: "PRICE_ALERT_BATCH",
      alertCount: alerts.length,
      alerts,
      summary: \`\${alerts.length} price alerts triggered\`,
      highSeverityCount: alerts.filter(a => a.severity === "HIGH").length
    });

    return {
      success: true,
      message: \`\${alerts.length} alerts triggered and sent\`,
      alerts
    };
  }

  return {
    success: true,
    message: 'All prices above thresholds, monitoring continues'
  };
}`
  },
  'event-handler': {
    name: 'Blockchain Event Handler',
    code: `// Serverless On-Chain Event Handler for Monad FaaS
export async function handler(ctx) {
  const { trigger, env } = ctx;

  // Process blockchain event from Monad network
  const { event, blockNumber, transactionHash } = trigger.data;

  console.log(\`Processing Monad event: \${event.name} at block \${blockNumber}\`);

  // Parallel processing for high throughput
  const results = await Promise.all([
    processEvent(event),
    updateMetrics(event, blockNumber),
    checkTriggerConditions(event)
  ]);

  const [eventResult, metricsResult, triggerResult] = results;

  // Send notifications if conditions are met
  if (eventResult.shouldNotify || triggerResult.triggered) {
    await ctx.sendWebhook(env.WEBHOOK_URL, {
      type: 'BLOCKCHAIN_EVENT',
      message: \`Monad event processed: \${event.name}\`,
      blockNumber,
      transactionHash,
      gasUsed: ctx.getGasUsed(),
      results: { eventResult, metricsResult, triggerResult },
      processedAt: new Date().toISOString()
    });
  }

  return {
    success: true,
    eventProcessed: event.name,
    blockNumber,
    parallelResults: results,
    gasEfficient: true
  };
}

async function processEvent(event) {
  // WASM-optimized event processing
  return {
    shouldNotify: event.value > 1000000, // Notify for large transactions
    processedAt: Date.now(),
    eventType: event.name
  };
}

async function updateMetrics(event, blockNumber) {
  // Update real-time metrics
  return {
    metricsUpdated: true,
    blockNumber,
    eventCount: 1
  };
}

async function checkTriggerConditions(event) {
  // Check if event triggers other functions
  return {
    triggered: event.name === 'Transfer' && event.value > 500000,
    condition: 'large_transfer'
  };
}`
  },
  'custom': {
    name: 'Custom WASM Function',
    code: `// Custom Serverless Function for Monad FaaS
export async function handler(ctx) {
  const { trigger, env } = ctx;

  console.log('WASM function triggered on Monad blockchain:', trigger);

  // Access blockchain data through EVM-shim
  const blockNumber = await ctx.getBlockNumber();
  const gasPrice = await ctx.getGasPrice();

  // Your custom serverless logic here
  const result = {
    message: 'Hello from Monad FaaS serverless function!',
    timestamp: new Date().toISOString(),
    triggerType: trigger.type,
    blockNumber,
    gasPrice: gasPrice.toString(),
    runtime: 'WebAssembly',
    platform: 'Monad Blockchain'
  };

  // Optional: Send webhook notification
  if (env.WEBHOOK_URL) {
    await ctx.sendWebhook(env.WEBHOOK_URL, {
      functionExecuted: true,
      result,
      gasUsed: ctx.getGasUsed()
    });
  }

  return {
    success: true,
    data: result,
    gasEfficient: true
  };
}`
  }
};

interface FunctionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (functionData: any) => Promise<void>;
}

const FunctionEditor: React.FC<FunctionEditorProps> = ({ isOpen, onClose, onDeploy }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof FUNCTION_TEMPLATES>('price-alert');
  const [functionName, setFunctionName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(FUNCTION_TEMPLATES['price-alert'].code);
  const [triggerType, setTriggerType] = useState('price-threshold');
  const [triggerConfig, setTriggerConfig] = useState('{"token": "ARB/USDC", "threshold": 0.75}');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const editorRef = useRef<any>(null);

  const handleTemplateChange = (template: keyof typeof FUNCTION_TEMPLATES) => {
    setSelectedTemplate(template);
    setCode(FUNCTION_TEMPLATES[template].code);
    setFunctionName(FUNCTION_TEMPLATES[template].name);
  };

  const handleDeploy = async () => {
    if (!functionName.trim() || !code.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide function name and code' });
      toast.error('Please provide function name and code');
      return;
    }

    setIsDeploying(true);
    setStatusMessage({ type: 'info', text: 'Deploying function to Monad blockchain...' });
    toast.loading('Deploying function...', { id: 'deploy' });

    try {
      // Validate trigger config JSON
      let parsedTriggerConfig = {};
      try {
        parsedTriggerConfig = JSON.parse(triggerConfig || '{}');
      } catch (error) {
        throw new Error('Invalid trigger configuration JSON');
      }

      const functionData = {
        name: functionName,
        description: description || `${functionName} - Deployed via MonadFaas Editor`,
        code,
        runtime: 'javascript',
        triggerType,
        triggerConfig: parsedTriggerConfig,
        webhookUrl,
        gasLimit: 500000
      };

      // Deploy via API
      const response = await fetch(`${API_BASE_URL}/api/functions/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(functionData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      const { functionId, triggerId, txHash, gasUsed } = result.data;

      setStatusMessage({
        type: 'success',
        text: `Function deployed successfully! Function ID: ${functionId}, Trigger ID: ${triggerId}. Transaction: ${txHash}`
      });

      toast.success(`Function deployed! ID: ${functionId}`, { id: 'deploy' });

      // Also call the original onDeploy for backward compatibility
      await onDeploy(functionData);

      // Auto-close after successful deployment
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Deployment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage({
        type: 'error',
        text: `Deployment failed: ${errorMessage}`
      });
      toast.error(`Deployment failed: ${errorMessage}`, { id: 'deploy' });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <EditorContainer>
      <EditorHeader>
        <Title>Function Editor</Title>
        <HeaderActions>
          <TemplateSelect 
            value={selectedTemplate} 
            onChange={(e) => handleTemplateChange(e.target.value as keyof typeof FUNCTION_TEMPLATES)}
          >
            {Object.entries(FUNCTION_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>{template.name}</option>
            ))}
          </TemplateSelect>
          <CloseButton onClick={onClose}>×</CloseButton>
        </HeaderActions>
      </EditorHeader>

      <EditorContent>
        <CodeEditorPanel>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </CodeEditorPanel>

        <SidePanel>
          <FormGroup>
            <Label>Function Name</Label>
            <Input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder="my-price-alert"
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your function does..."
            />
          </FormGroup>

          <TriggerConfig>
            <TriggerTitle>Trigger Configuration</TriggerTitle>
            
            <FormGroup>
              <Label>Trigger Type</Label>
              <TemplateSelect 
                value={triggerType} 
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="price-threshold">Price Threshold</option>
                <option value="on-chain-event">On-Chain Event</option>
                <option value="webhook">HTTP Webhook</option>
                <option value="time-based">Time-Based</option>
              </TemplateSelect>
            </FormGroup>

            <FormGroup>
              <Label>Trigger Data (JSON)</Label>
              <TextArea
                value={triggerConfig}
                onChange={(e) => setTriggerConfig(e.target.value)}
                placeholder='{"token": "ARB/USDC", "threshold": 0.75}'
              />
            </FormGroup>
          </TriggerConfig>

          <FormGroup>
            <Label>Webhook URL (Optional)</Label>
            <Input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://webhook.site/your-url"
            />
          </FormGroup>

          <DeployButton 
            onClick={handleDeploy} 
            disabled={isDeploying || !functionName.trim() || !code.trim()}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Function'}
          </DeployButton>

          {statusMessage && (
            <StatusMessage type={statusMessage.type}>
              {statusMessage.text}
            </StatusMessage>
          )}
        </SidePanel>
      </EditorContent>
    </EditorContainer>
  );
};

export default FunctionEditor;
