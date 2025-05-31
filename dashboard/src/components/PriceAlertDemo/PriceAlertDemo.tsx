import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface PriceData {
  token: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

interface AlertConfig {
  token: string;
  threshold: number;
  enabled: boolean;
}

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #a0a0a0;
  font-size: 1.1rem;
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PricePanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
`;

const AlertPanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
`;

const PanelTitle = styled.h3`
  color: #667eea;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const PriceCard = styled.div<{ isAlert?: boolean }>`
  background: ${props => props.isAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isAlert ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  ${props => props.isAlert && `
    animation: pulse 2s infinite;
  `}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const TokenName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
`;

const Change = styled.div<{ positive: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.positive ? '#22c55e' : '#ef4444'};
`;

const AlertForm = styled.div`
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #a0a0a0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  option {
    background: #1a1a2e;
    color: white;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3); }
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          &:hover { background: rgba(255, 255, 255, 0.2); }
        `;
    }
  }}
`;

const StatusIndicator = styled.div<{ status: 'active' | 'inactive' | 'triggered' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);`;
      case 'triggered':
        return `background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);`;
      default:
        return `background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3);`;
    }
  }}
`;

const PriceAlertDemo: React.FC = () => {
  const [prices, setPrices] = useState<PriceData[]>([
    { token: 'ARB/USDC', price: 0.82, change24h: -2.5, lastUpdated: Date.now() },
    { token: 'ETH/USDT', price: 2150, change24h: 1.2, lastUpdated: Date.now() },
    { token: 'BTC/USDT', price: 42500, change24h: 0.8, lastUpdated: Date.now() }
  ]);
  
  const [alerts, setAlerts] = useState<AlertConfig[]>([
    { token: 'ARB/USDC', threshold: 0.75, enabled: false },
    { token: 'ETH/USDT', threshold: 2000, enabled: false },
    { token: 'BTC/USDT', threshold: 40000, enabled: false }
  ]);
  
  const [selectedToken, setSelectedToken] = useState('ARB/USDC');
  const [threshold, setThreshold] = useState('0.75');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/demo');
  const [deployedFunctionId, setDeployedFunctionId] = useState<number | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(price => ({
        ...price,
        price: price.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random change
        change24h: price.change24h + (Math.random() - 0.5) * 0.5,
        lastUpdated: Date.now()
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Check for triggered alerts
  useEffect(() => {
    prices.forEach(price => {
      const alert = alerts.find(a => a.token === price.token && a.enabled);
      if (alert && price.price < alert.threshold) {
        toast.error(`🚨 Price Alert: ${price.token} dropped to $${price.price.toFixed(4)}!`, {
          duration: 5000,
          id: `alert-${price.token}`
        });
      }
    });
  }, [prices, alerts]);

  const deployPriceAlert = async () => {
    setIsDeploying(true);
    toast.loading('Deploying price alert function...', { id: 'deploy-alert' });

    try {
      const functionCode = `// Live Price Alert Function
export async function handler(ctx) {
  const { trigger, env } = ctx;
  
  // Get current price for ${selectedToken}
  const currentPrice = await ctx.fetchTokenPrice("${selectedToken}");
  const threshold = ${threshold};
  
  console.log(\`Checking \${selectedToken}: $\${currentPrice} vs threshold $\${threshold}\`);
  
  if (currentPrice < threshold) {
    const changePercent = ((currentPrice - threshold) / threshold * 100).toFixed(2);
    
    await ctx.sendWebhook("${webhookUrl}", {
      type: "PRICE_ALERT",
      token: "${selectedToken}",
      currentPrice,
      threshold,
      changePercent,
      message: \`🚨 ALERT: \${selectedToken} dropped to $\${currentPrice.toFixed(4)} (below $\${threshold})\`,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: "Alert triggered and webhook sent",
      data: { currentPrice, threshold, changePercent }
    };
  }
  
  return {
    success: true,
    message: "Price above threshold, no alert needed",
    data: { currentPrice, threshold }
  };
}`;

      const response = await fetch(`${API_BASE_URL}/api/functions/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `PriceAlert_${selectedToken.replace('/', '_')}_${Date.now()}`,
          description: `Price alert for ${selectedToken} below $${threshold}`,
          code: functionCode,
          runtime: 'javascript',
          triggerType: 'PRICE_THRESHOLD',
          triggerConfig: { token: selectedToken, threshold: parseFloat(threshold) },
          webhookUrl,
          gasLimit: 500000
        })
      });

      const result = await response.json();

      if (result.success) {
        setDeployedFunctionId(result.data.functionId);
        
        // Enable the alert
        setAlerts(prev => prev.map(alert => 
          alert.token === selectedToken 
            ? { ...alert, threshold: parseFloat(threshold), enabled: true }
            : alert
        ));
        
        toast.success(`Price alert deployed! Function ID: ${result.data.functionId}`, { id: 'deploy-alert' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      toast.error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'deploy-alert' });
    } finally {
      setIsDeploying(false);
    }
  };

  const toggleAlert = (token: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.token === token ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  return (
    <Container>
      <Header>
        <Title>🚨 Serverless Price Alert Demo</Title>
        <Subtitle>Deploy WebAssembly functions that automatically monitor token prices and trigger webhooks</Subtitle>
      </Header>

      <DemoGrid>
        <PricePanel>
          <PanelTitle>📊 Live Token Prices</PanelTitle>
          {prices.map(price => {
            const alert = alerts.find(a => a.token === price.token);
            const isTriggered = alert?.enabled && price.price < alert.threshold;
            
            return (
              <PriceCard key={price.token} isAlert={isTriggered}>
                <TokenName>{price.token}</TokenName>
                <Price>${price.price.toFixed(4)}</Price>
                <Change positive={price.change24h >= 0}>
                  {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                </Change>
                {alert && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <StatusIndicator status={isTriggered ? 'triggered' : alert.enabled ? 'active' : 'inactive'}>
                      {isTriggered ? '🚨 TRIGGERED' : alert.enabled ? '✅ MONITORING' : '⏸️ INACTIVE'}
                    </StatusIndicator>
                  </div>
                )}
              </PriceCard>
            );
          })}
        </PricePanel>

        <AlertPanel>
          <PanelTitle>⚙️ Deploy Price Alert</PanelTitle>
          
          <AlertForm>
            <FormGroup>
              <Label>Token Pair</Label>
              <Select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)}>
                <option value="ARB/USDC">ARB/USDC</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="BTC/USDT">BTC/USDT</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Alert Threshold ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="0.75"
              />
            </FormGroup>

            <FormGroup>
              <Label>Webhook URL</Label>
              <Input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://webhook.site/your-url"
              />
            </FormGroup>

            <Button 
              variant="primary" 
              onClick={deployPriceAlert}
              disabled={isDeploying}
            >
              {isDeploying ? 'Deploying...' : '🚀 Deploy Alert Function'}
            </Button>

            {deployedFunctionId && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                  ✅ Function deployed successfully!<br/>
                  Function ID: {deployedFunctionId}<br/>
                  Monitoring {selectedToken} below ${threshold}
                </div>
              </div>
            )}
          </AlertForm>

          <div>
            <PanelTitle>🎛️ Alert Controls</PanelTitle>
            {alerts.map(alert => (
              <div key={alert.token} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: 'white' }}>{alert.token} &lt; ${alert.threshold}</span>
                <Button 
                  variant={alert.enabled ? 'danger' : 'secondary'}
                  onClick={() => toggleAlert(alert.token)}
                >
                  {alert.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </div>
        </AlertPanel>
      </DemoGrid>
    </Container>
  );
};

export default PriceAlertDemo;
