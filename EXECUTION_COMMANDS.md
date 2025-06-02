# 🚀 Monad FaaS - Complete Execution Commands Guide

This file contains all the commands needed to run the entire Monad FaaS platform in the correct order.

## 📋 Prerequisites
- Node.js 18+
- Git
- MON tokens on Monad testnet
- Private key configured in `.env` file

## 🔧 Step-by-Step Execution Commands

### 1. Initial Setup
```bash
# Clone the repository (if not already done)
git clone <repo-url>
cd monad-blitz-bangalore

# Install all dependencies (root + dashboard)
npm install
```

### 2. Environment Configuration
```bash
# Verify .env file exists with your private key
cat .env

# Should contain:
# PRIVATE_KEY=0xYourPrivateKeyHere
# ETHERSCAN_API_KEY=YourAPIKey (optional)
```

### 3. Launch Complete Platform (RECOMMENDED)
```bash
# 🚀 One-command launch - starts everything
npm run launch

# This automatically:
# - Starts backend API server (port 3001)
# - Starts frontend dashboard (port 3000)
# - Runs integration tests
# - Displays access instructions
```

### 4. Alternative Manual Startup Commands
```bash
# Start both services with concurrently
npm run dev

# OR start services individually:
npm run server      # Backend API only (port 3001)
npm run dashboard   # Frontend only (port 3000)
```

### 5. Access the Platform
```bash
# Open in browser:
# Dashboard:     http://localhost:3000
# API Server:    http://localhost:3001
# Live Metrics:  http://localhost:3000 (click "📊 Live Metrics")
# Demo:          http://localhost:3000 (click "🚀 Demo")
```

### 6. Demo Execution Commands

#### Quick Start Demos
```bash
# Small scale test (5 functions)
npm run demo:small

# Standard demo (20 functions)
npm run demo

# Medium scale demo (20 functions)
npm run demo:medium

# High performance turbo mode (20 functions)
npm run demo:turbo
```

#### Advanced Performance Demos
```bash
# Large scale demo (50 functions)
npm run demo:large

# Ultra performance demo (50 functions with turbo)
npm run demo:ultra

# Enhanced analytics demo (100 functions)
npm run demo:enhanced

# Stress test (200 functions)
npm run demo:stress

# Analytics export with metrics
npm run demo:analytics
```

#### Performance Benchmarking
```bash
# Full performance benchmark
npm run benchmark

# Quick benchmark test
npm run benchmark:quick
```

### 7. Testing Commands
```bash
# Integration tests
npm run test:integration

# Smart contract tests (if needed)
cd contracts
forge test
cd ..

# Frontend tests (if needed)
cd dashboard
npm test
cd ..
```

### 8. Development Commands
```bash
# Start with auto-reload (development mode)
npm run dev

# Build frontend for production
npm run build

# Start production server
npm start
```

### 9. Troubleshooting Commands
```bash
# Check if ports are in use
lsof -ti:3001
lsof -ti:3000

# Kill processes using ports (if needed)
pkill -f "node.*server.js"
pkill -f "react-scripts"

# Check platform health
curl http://localhost:3001/health
curl http://localhost:3000
```

### 10. Stop Platform
```bash
# Stop all services (when running npm run launch)
# Press Ctrl+C in the terminal running the launch command

# Or kill individual processes if needed
pkill -f "node.*start-demo.js"
pkill -f "node.*server.js"
pkill -f "react-scripts"
```

## 🎯 Recommended Execution Flow

### For First-Time Setup:
1. `npm install`
2. Verify `.env` configuration
3. `npm run launch`
4. Open http://localhost:3000 in browser
5. Run `npm run demo:small` to test functionality

### For Development:
1. `npm run dev` (for auto-reload)
2. Make changes to code
3. Test with `npm run demo:small`
4. Run `npm run benchmark:quick` for performance testing

### For Demonstrations:
1. `npm run launch`
2. Open http://localhost:3000
3. Run progressive demos:
   - `npm run demo:small`
   - `npm run demo:enhanced`
   - `npm run demo:stress`
4. Show live metrics in dashboard

## 📊 Expected Outputs

### Successful Launch Indicators:
- ✅ Backend server started on http://localhost:3001
- ✅ Frontend dashboard started on http://localhost:3000
- ✅ Integration tests: 7/8 passed (87.5% success rate)
- ✅ Platform health check - All services running
- ✅ Real-time metrics broadcasting enabled

### Demo Success Indicators:
- Function registration transactions on Monad testnet
- Live metrics updating in dashboard
- WebSocket connections active
- Gas usage statistics displayed
- Performance metrics logged

## 🚨 Common Issues & Solutions

### Port Already in Use:
```bash
# Kill processes and restart
pkill -f "node.*server.js"
npm run launch
```

### Dependencies Issues:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf dashboard/node_modules dashboard/package-lock.json
npm install
```

### Blockchain Connection Issues:
- Verify `.env` has correct PRIVATE_KEY
- Check Monad testnet RPC is accessible
- Ensure account has MON tokens for gas

---

**Note**: This platform is successfully deployed on Monad Testnet with contract address `0x4142d9Ad70f87c359260e6dC41340af5823BC888`
