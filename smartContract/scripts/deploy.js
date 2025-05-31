// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying NFT Marketplace...");
  console.log("Network:", hre.network.name);
  
  // Get the signers
  const signers = await hre.ethers.getSigners();
  
  if (signers.length === 0) {
    throw new Error("No signers available. Make sure PRIVATE_KEY is set in your environment variables.");
  }
  
  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  // Check balance (only for non-hardhat networks)
  if (hre.network.name !== "hardhat") {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Deployer account has no funds. Please add some testnet tokens to your account.");
    }
  }
  
  // Get the contract factory
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const nftMarketplace = await NFTMarketplace.deploy();
  
  // Wait for deployment
  console.log("Waiting for deployment confirmation...");
  await nftMarketplace.waitForDeployment();
  
  const contractAddress = await nftMarketplace.getAddress();
  console.log("✅ NFTMarketplace deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Explorer URL:", `https://testnet.monadexplorer.com/address/${contractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => {
    console.log("Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });