# MonadFaas Enhanced Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Monad testnet ETH
- Private key with sufficient balance

### Environment Setup
```bash
# Clone and setup
git clone <repository>
cd monad-blitz-bangalore

# Install dependencies
npm install
cd dashboard && npm install && cd ..
cd cli && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your private key
```

### Environment Variables
```bash
PRIVATE_KEY=0xYourPrivateKeyHere
REACT_APP_PRIVATE_KEY=0xYourPrivateKeyHere  # For dashboard
```

## 🎯 Enhanced Features Overview

### 1. Real-Time Metrics Dashboard
- **Live Performance Monitoring**: Functions/sec, gas usage, success rates
- **Collapsible Metrics Panel**: Fixed position with auto-refresh
- **Transaction Links**: Direct links to Monad explorer
- **Gas & Cost Analytics**: ETH/gwei conversions, cost tracking

### 2. In-Browser Function Editor
- **Monaco Editor Integration**: Full JavaScript IDE in browser
- **Function Templates**: Price alerts, event handlers, custom functions
- **One-Click Deployment**: Direct integration with smart contracts
- **Real-Time Validation**: Code linting and error checking

### 3. Live Use Case Demo
- **Price Alert System**: Configure token/threshold, deploy, test
- **Step-by-Step Workflow**: Visual progress tracking
- **Live Execution Logs**: Real-time function execution monitoring
- **Webhook Integration**: External notification system

### 4. High-Performance Backend
- **100+ Concurrent Executions**: Optimized for scale
- **Advanced Analytics**: Comprehensive metrics collection
- **Stress Testing**: Load testing capabilities
- **Export Functionality**: JSON metrics export

## 🛠️ Local Deployment Instructions

### Step 1: Start the Enhanced Dashboard
```bash
# Terminal 1: Start dashboard with enhanced features
npm run dashboard

# Dashboard will be available at http://localhost:3000
# Features:
# - Live metrics panel (top-right)
# - Function editor (floating button)
# - Live demo section
# - Real-time analytics
```

### Step 2: Run High-Performance Demo
```bash
# Terminal 2: Run enhanced demo (100 functions)
npm run demo:enhanced

# Alternative options:
npm run demo:stress        # 200 functions with stress testing
npm run demo:analytics     # 50 functions with JSON export
npm run demo:ultra         # 50 functions in turbo mode
```

### Step 3: Test Individual Features

#### A. Function Editor Test
1. Open dashboard at http://localhost:3000
2. Click floating "✍️" button (bottom-left)
3. Select "Price Alert" template
4. Configure:
   - Function Name: `test-price-alert`
   - Token: `ARB/USDC`
   - Threshold: `0.75`
   - Webhook: `https://webhook.site/unique-id`
5. Click "Deploy Function"
6. Monitor deployment in metrics panel

#### B. Live Demo Test
1. Scroll to "Live Price Alert Demo" section
2. Configure price alert parameters
3. Click "Deploy Price Alert"
4. Watch step-by-step progress
5. Click "Test Function" to simulate execution
6. Check webhook URL for notifications

#### C. Metrics Panel Test
1. Metrics panel auto-appears (top-right)
2. Click to expand/collapse
3. Monitor real-time statistics
4. Click "View" links to see transactions
5. Observe live updates during demo execution

## 📊 Performance Validation
cd /home/aditya/Desktop/Repos/monad-blitz-bangalore && npm run launch
### Mock Test Flow
```bash
# 1. Quick validation (5 functions)
npm run demo:small

# 2. Medium scale test (20 functions)
npm run demo:turbo

# 3. High performance test (100 functions)
npm run demo:enhanced

# 4. Stress test (200 functions)
npm run demo:stress

# 5. Analytics export
npm run demo:analytics
# Check metrics.json for detailed analytics
```

### Expected Performance Metrics
- **Registration**: ~2-5 functions/second
- **Trigger Setup**: ~3-7 triggers/second  
- **Execution**: ~5-10 executions/second
- **Success Rate**: >95%
- **Gas Efficiency**: <300k gas per function

### Dashboard Features Validation

#### Real-Time Metrics
- [ ] Metrics panel appears and updates live
- [ ] Gas usage displayed in gwei/ETH
- [ ] Success rate percentage shown
- [ ] Recent executions list populated
- [ ] Transaction links work

#### Function Editor
- [ ] Monaco editor loads properly
- [ ] Templates selectable and load
- [ ] Code validation works
- [ ] Deployment succeeds
- [ ] Status messages appear

#### Live Demo
- [ ] Configuration options work
- [ ] Step progress updates
- [ ] Deployment logs appear
- [ ] Test execution works
- [ ] Webhook notifications sent

## 🔧 Advanced Configuration

### High-Performance Settings
```javascript
// enhanced-demo.js configuration
const CONFIG = {
  maxConcurrency: 20,        // Parallel transactions
  batchSize: 50,            // Batch processing size
  gasPrice: '75 gwei',      // Higher gas for speed
  delays: {
    betweenBatches: 10,     // Minimal delays
    betweenTxs: 5
  }
};
```

### Dashboard Customization
```typescript
// MetricsService.ts - Update intervals
const AUTO_REFRESH_INTERVAL = 3000; // 3 seconds

// EtherscanService.ts - Network configuration
const NETWORKS = {
  monad: {
    chainId: 10143,
    explorerUrl: 'https://explorer.monad.xyz'
  }
};
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Dashboard Not Loading
```bash
# Check dependencies
cd dashboard && npm install

# Restart with verbose logging
npm start -- --verbose
```

#### 2. Function Deployment Fails
- Verify private key has sufficient ETH
- Check gas price settings
- Ensure contract address is correct
- Monitor network connectivity

#### 3. Metrics Not Updating
- Check browser console for errors
- Verify WebSocket connections
- Restart dashboard service
- Clear browser cache

#### 4. Performance Issues
```bash
# Reduce concurrency
node enhanced-demo.js --functions=50

# Check system resources
top -p $(pgrep node)

# Monitor network latency
ping testnet-rpc.monad.xyz
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run demo:enhanced

# Export detailed metrics
npm run demo:analytics
cat metrics.json | jq '.metrics.summary'
```

## 📈 Production Considerations

### Scaling for 100+ Functions
1. **Increase Gas Price**: Higher gas for faster inclusion
2. **Optimize Concurrency**: Balance speed vs stability
3. **Monitor Resources**: CPU/memory usage
4. **Network Optimization**: Use multiple RPC endpoints
5. **Error Handling**: Robust retry mechanisms

### Security Best Practices
1. **Private Key Management**: Use environment variables
2. **Gas Limit Controls**: Prevent excessive gas usage
3. **Rate Limiting**: Avoid overwhelming network
4. **Input Validation**: Sanitize user inputs
5. **Access Controls**: Restrict deployment permissions

## 🎯 Demo Presentation Flow

### 1. Introduction (2 minutes)
- Show dashboard overview
- Highlight key metrics
- Explain architecture

### 2. Live Function Creation (3 minutes)
- Open function editor
- Write price alert function
- Deploy to blockchain
- Show transaction confirmation

### 3. High-Performance Demo (5 minutes)
- Run enhanced demo (100 functions)
- Monitor real-time metrics
- Show throughput statistics
- Demonstrate scalability

### 4. Use Case Demonstration (3 minutes)
- Configure price alert
- Deploy and test function
- Show webhook notification
- Explain practical applications

### 5. Analytics & Insights (2 minutes)
- Review performance metrics
- Show gas efficiency
- Discuss optimization techniques
- Export analytics data

## 🔗 Additional Resources

- [Monad Documentation](https://docs.monad.xyz)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [React Styled Components](https://styled-components.com/)

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review console logs
3. Verify environment configuration
4. Test with smaller function counts
5. Monitor network connectivity
