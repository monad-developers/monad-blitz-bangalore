
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the GriffinLockEscrow contract
  const GriffinLockEscrow = await ethers.getContractFactory("GriffinLockEscrow");
  
  // Set platform arbitrator to deployer for now, and 1% platform fee (100 basis points)
  const platformArbitrator = deployer.address;
  const platformFee = 100; // 1%
  
  const escrow = await GriffinLockEscrow.deploy(platformArbitrator, platformFee);
  await escrow.deployed();

  console.log("GriffinLockEscrow deployed to:", escrow.address);
  console.log("Platform arbitrator:", platformArbitrator);
  console.log("Platform fee:", platformFee / 100, "%");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    escrowAddress: escrow.address,
    platformArbitrator,
    platformFee,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("Deployment info:", deploymentInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
