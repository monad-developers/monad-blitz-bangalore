import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const GhostPass = await ethers.getContractFactory("GhostPass");
  const ghostPass = await GhostPass.deploy();

  // Wait for deployment to complete (ethers v6)
  await ghostPass.waitForDeployment();

  console.log("Contract deployed to:", ghostPass.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
