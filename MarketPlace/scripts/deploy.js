// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting BountyMarketplace deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Get the contract factory
  const BountyMarketplace = await ethers.getContractFactory("BountyMarketplace");
  
  console.log("⏳ Deploying BountyMarketplace contract...");
  
  // Deploy the contract
  const bountyMarketplace = await BountyMarketplace.deploy();
  
  // Wait for deployment to be mined
  await bountyMarketplace.waitForDeployment();
  
  const contractAddress = await bountyMarketplace.getAddress();
  
  console.log("✅ BountyMarketplace deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔍 Transaction hash:", bountyMarketplace.deploymentTransaction().hash);
  console.log("⛽ Gas used:", bountyMarketplace.deploymentTransaction().gasLimit.toString());
  
  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await bountyMarketplace.deploymentTransaction().wait(2);
  console.log("✅ Contract confirmed on blockchain!\n");
  
  // Display contract information
  console.log("📋 Contract Information:");
  console.log("- Owner:", await bountyMarketplace.owner());
  console.log("- Platform Fee:", await bountyMarketplace.platformFeePercent(), "basis points (2.5%)");
  console.log("- Min Reputation to Vote:", await bountyMarketplace.MIN_REPUTATION_TO_VOTE());
  console.log("- Voting Duration:", await bountyMarketplace.VOTING_DURATION(), "seconds (7 days)\n");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: bountyMarketplace.deploymentTransaction().hash,
    gasUsed: bountyMarketplace.deploymentTransaction().gasLimit.toString()
  };
  
  console.log("💾 Deployment completed successfully!");
  console.log("📄 Save this information for interaction:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify contract if on a supported network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Attempting contract verification...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on block explorer!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("You can manually verify using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    }
  }
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });