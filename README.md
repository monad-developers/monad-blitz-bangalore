# GhostPass

GhostPass is a privacy-focused platform for **anonymous wallet verification** on the blockchain. It enables users to prove wallet ownership and display their verification status without revealing personal information.

## Features

- **Wallet Verification**: Users can cryptographically verify their Ethereum wallet to prove ownership.
- **Anonymous Identity**: No personal details are collected—only wallet addresses and blockchain transaction hashes are stored.
- **Verification Status Lookup**: Anyone can check the verification status of any wallet address.
- **Batch and Revoke Support**: Admins can batch-verify or revoke verification from wallets.
- **Web Interface**: Modern Next.js frontend for a seamless user experience.

## How it Works

### 1. Connect & Verify Wallet

- Users connect their Ethereum wallet (MetaMask or similar).
- To verify, users sign a message (challenge) with their wallet.
- The backend verifies the signature and, if valid, submits a verification transaction to a smart contract.
- The wallet address, verification timestamp, and blockchain transaction hash are logged for future checks.

### 2. Displaying Verified Users

- The backend maintains a list of verified users, each entry containing:
  - `address`: The Ethereum wallet address.
  - `verifiedAt`: Timestamp of verification.
  - `transactionHash`: Blockchain hash of the verification transaction.
- Anyone can query `/verified-users` (API) or use the frontend to see which wallets are verified.

### 3. Check Verification Status

- Users (or third parties) can check if any wallet is verified by entering the address in the UI.
- The backend/API will return:
  - Whether the address is verified.
  - The verification timestamp (if available).
  - The transaction hash of the verification.

## Technology Stack

- **Frontend**: Next.js (React), TypeScript
- **Backend**: Node.js, Express, ethers.js
- **Blockchain**: Ethereum (Hardhat for smart contract deployment/testing)
- **Wallets**: MetaMask or any EIP-1193-compatible wallet

## API Endpoints

- `POST /verify`: Verify a wallet address
  - Request: `{ walletAddress: string, signature: string, message: string }`
- `GET /verify/:address`: Check verification status of a wallet address
- `GET /verified-users`: List all verified wallet addresses
- `POST /revoke`: Admin-only, revoke verification for a wallet

## Local Development

### Backend

```bash
cd backend
npm install
# Configure .env with RPC URL, contract address, private key, etc.
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### Blockchain (Hardhat)

```bash
cd blockchain
npm install
npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Security & Privacy

- No personal data is ever stored. Only wallet addresses and blockchain proof.
- All verifications are on-chain, and revocation is supported.
- Users can check the verification status of any address at any time.

## License

MIT

---

Feel free to contribute! Open issues and PRs are welcome.