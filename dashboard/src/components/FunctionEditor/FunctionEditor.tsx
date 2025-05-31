import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';

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

const FUNCTION_TEMPLATES = {
  'price-alert': {
    name: 'Price Alert',
    code: `// Price Alert Function
export async function handler(ctx) {
  const { trigger, env } = ctx;
  
  // Get price data from trigger
  const { token, currentPrice, threshold } = trigger.data;
  
  console.log(\`Price alert triggered: \${token} = $\${currentPrice}\`);
  
  if (currentPrice < threshold) {
    // Send webhook notification
    await ctx.sendWebhook(env.WEBHOOK_URL, {
      message: \`🚨 Price Alert: \${token} dropped to $\${currentPrice}\`,
      token,
      currentPrice,
      threshold,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Alert sent successfully',
      data: { token, currentPrice, threshold }
    };
  }
  
  return {
    success: true,
    message: 'Price above threshold, no alert needed'
  };
}`
  },
  'event-handler': {
    name: 'Event Handler',
    code: `// On-Chain Event Handler
export async function handler(ctx) {
  const { trigger, env } = ctx;
  
  // Process blockchain event
  const { event, blockNumber, transactionHash } = trigger.data;
  
  console.log(\`Processing event: \${event.name} at block \${blockNumber}\`);
  
  // Your event processing logic here
  const result = await processEvent(event);
  
  // Store result or trigger other actions
  if (result.shouldNotify) {
    await ctx.sendWebhook(env.WEBHOOK_URL, {
      message: \`Event processed: \${event.name}\`,
      blockNumber,
      transactionHash,
      result
    });
  }
  
  return {
    success: true,
    eventProcessed: event.name,
    result
  };
}

async function processEvent(event) {
  // Implement your event processing logic
  return {
    shouldNotify: true,
    processedAt: Date.now()
  };
}`
  },
  'custom': {
    name: 'Custom Function',
    code: `// Custom Serverless Function
export async function handler(ctx) {
  const { trigger, env } = ctx;
  
  console.log('Function triggered:', trigger);
  
  // Your custom logic here
  const result = {
    message: 'Hello from MonadFaas!',
    timestamp: new Date().toISOString(),
    triggerType: trigger.type
  };
  
  return {
    success: true,
    data: result
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
      return;
    }

    setIsDeploying(true);
    setStatusMessage({ type: 'info', text: 'Deploying function...' });

    try {
      const functionData = {
        name: functionName,
        description: description || `${functionName} - Deployed via MonadFaas Editor`,
        code,
        runtime: 'javascript',
        triggerType,
        triggerConfig: JSON.parse(triggerConfig || '{}'),
        webhookUrl,
        gasLimit: 500000
      };

      await onDeploy(functionData);
      
      setStatusMessage({ 
        type: 'success', 
        text: 'Function deployed successfully! Check the metrics panel for execution details.' 
      });
      
      // Auto-close after successful deployment
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setStatusMessage({ 
        type: 'error', 
        text: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
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
