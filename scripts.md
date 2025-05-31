
# Additional Scripts to Add to package.json

Add these scripts to your package.json:

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost",
    "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet",
    "node": "hardhat node",
    "verify": "hardhat verify"
  }
}
```

Also add these dependencies if not already present:
- @openzeppelin/contracts
