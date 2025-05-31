// scripts/interact.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔗 Interacting with BountyMarketplace contract...\n");

  // IMPORTANT: Replace this with your actual deployed contract address
  // You need to deploy the contract first and get the address from deployment logs
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Check if contract address needs to be updated
  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    console.error("❌ Invalid contract address:", CONTRACT_ADDRESS);
    console.log("Please ensure you've deployed the contract first with: npm run deploy:local");
    process.exit(1);
  }
  
  // Get signers
  const [owner, creator, contributor1, contributor2, voter1, voter2] = await ethers.getSigners();
  
  console.log("👥 Available accounts:");
  console.log("- Owner:", owner.address);
  console.log("- Creator:", creator.address);
  console.log("- Contributor 1:", contributor1.address);
  console.log("- Contributor 2:", contributor2.address);
  console.log("- Voter 1:", voter1.address);
  console.log("- Voter 2:", voter2.address, "\n");

  // Get contract instance
  const BountyMarketplace = await ethers.getContractFactory("BountyMarketplace");
  
  // Verify contract exists at the address
  const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
  if (code === "0x") {
    console.error("❌ No contract found at address:", CONTRACT_ADDRESS);
    console.log("Please ensure you've deployed the contract first with: npm run deploy:local");
    process.exit(1);
  }
  
  const contract = BountyMarketplace.attach(CONTRACT_ADDRESS);
  
  console.log("📋 Contract connected at:", CONTRACT_ADDRESS, "\n");

  try {
    // Verify contract is working by checking owner
    const contractOwner = await contract.owner();
    console.log("🔍 Contract owner:", contractOwner);
    console.log("🔍 Script owner:", owner.address);
    
    if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
      console.log("⚠️  Warning: Contract owner differs from script owner");
    }
    console.log();

    // 1. Setup initial reputation for voters
    console.log("🎯 Step 1: Setting up initial reputation...");
    await contract.connect(owner).grantReputation(voter1.address, 10);
    await contract.connect(owner).grantReputation(voter2.address, 15);
    await contract.connect(owner).grantReputation(creator.address, 5);
    
    console.log("✅ Reputation granted:");
    console.log("- Voter 1:", await contract.getUserReputation(voter1.address));
    console.log("- Voter 2:", await contract.getUserReputation(voter2.address));
    console.log("- Creator:", await contract.getUserReputation(creator.address), "\n");

    // 2. Create a bounty
    console.log("🎯 Step 2: Creating a bounty...");
    const bountyTitle = "Build a React DeFi Dashboard";
    const bountyDescription = "Create a responsive React dashboard for tracking DeFi protocols";
    const ipfsHash = "QmExampleIPFSHash123456789";
    const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const allowedRoles = ["Frontend Developer", "UI/UX Designer"];
    const rewardAmount = ethers.parseEther("2.0");

    const createTx = await contract.connect(creator).createBounty(
      bountyTitle,
      bountyDescription,
      ipfsHash,
      deadline,
      allowedRoles,
      { value: rewardAmount }
    );
    
    const createReceipt = await createTx.wait();
    const bountyId = createReceipt.logs[0].args.bountyId;
    
    console.log("✅ Bounty created!");
    console.log("- Bounty ID:", bountyId.toString());
    console.log("- Reward Amount:", ethers.formatEther(rewardAmount), "ETH");
    console.log("- Transaction Hash:", createTx.hash, "\n");

    // 3. Submit work from contributors
    console.log("🎯 Step 3: Submitting work...");
    
    // Contributor 1 submission
    const submission1Hash = "QmContributor1SubmissionHash";
    const submit1Tx = await contract.connect(contributor1).submitWork(bountyId, submission1Hash);
    const submit1Receipt = await submit1Tx.wait();
    const submission1Id = submit1Receipt.logs[0].args.submissionId;
    
    console.log("✅ Contributor 1 submitted work:");
    console.log("- Submission ID:", submission1Id.toString());
    console.log("- IPFS Hash:", submission1Hash);

    // Contributor 2 submission
    const submission2Hash = "QmContributor2SubmissionHash";
    const submit2Tx = await contract.connect(contributor2).submitWork(bountyId, submission2Hash);
    const submit2Receipt = await submit2Tx.wait();
    const submission2Id = submit2Receipt.logs[0].args.submissionId;
    
    console.log("✅ Contributor 2 submitted work:");
    console.log("- Submission ID:", submission2Id.toString());
    console.log("- IPFS Hash:", submission2Hash, "\n");

    // Check updated reputations after submissions
    console.log("📊 Updated reputations after submissions:");
    console.log("- Contributor 1:", await contract.getUserReputation(contributor1.address));
    console.log("- Contributor 2:", await contract.getUserReputation(contributor2.address), "\n");

    // 4. Start voting phase
    console.log("🎯 Step 4: Starting voting phase...");
    const votingTx = await contract.connect(creator).startVotingPhase(bountyId);
    await votingTx.wait();
    
    const bountyInfo = await contract.getBounty(bountyId);
    console.log("✅ Voting phase started!");
    console.log("- Voting end time:", new Date(Number(bountyInfo.votingEndTime) * 1000).toLocaleString());
    console.log("- Status:", bountyInfo.status, "(1 = Voting)", "\n");

    // 5. Cast votes
    console.log("🎯 Step 5: Casting votes...");
    
    // Voter 1 votes for submission 1
    const vote1Tx = await contract.connect(voter1).voteOnSubmission(bountyId, submission1Id);
    await vote1Tx.wait();
    console.log("✅ Voter 1 voted for Submission", submission1Id.toString());

    // Voter 2 votes for submission 2
    const vote2Tx = await contract.connect(voter2).voteOnSubmission(bountyId, submission2Id);
    await vote2Tx.wait();
    console.log("✅ Voter 2 voted for Submission", submission2Id.toString(), "\n");

    // Check vote counts
    const submission1Info = await contract.getSubmission(submission1Id);
    const submission2Info = await contract.getSubmission(submission2Id);
    
    console.log("📊 Vote results:");
    console.log("- Submission 1 votes:", submission1Info.voteCount.toString());
    console.log("- Submission 2 votes:", submission2Info.voteCount.toString(), "\n");

    // Check updated reputations after voting
    console.log("📊 Updated reputations after voting:");
    console.log("- Voter 1:", await contract.getUserReputation(voter1.address));
    console.log("- Voter 2:", await contract.getUserReputation(voter2.address), "\n");

    // 6. Fast forward time for testing (local network only)
    if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
      console.log("🎯 Step 6: Fast forwarding time (local network)...");
      await hre.network.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await hre.network.provider.send("evm_mine");
      console.log("✅ Time advanced past voting deadline\n");
    } else {
      console.log("⏰ Step 6: Waiting for voting period to end...");
      console.log("Note: On live networks, you need to wait for the voting period to end naturally.\n");
      return;
    }

    // 7. Select winner and payout
    console.log("🎯 Step 7: Selecting winner and processing payout...");
    
    // Check balances before payout
    const contributor1BalanceBefore = await contributor1.provider.getBalance(contributor1.address);
    const contributor2BalanceBefore = await contributor2.provider.getBalance(contributor2.address);
    
    console.log("💰 Balances before payout:");
    console.log("- Contributor 1:", ethers.formatEther(contributor1BalanceBefore), "ETH");
    console.log("- Contributor 2:", ethers.formatEther(contributor2BalanceBefore), "ETH");
    
    const payoutTx = await contract.connect(owner).selectWinnerAndPayout(bountyId);
    const payoutReceipt = await payoutTx.wait();
    
    // Find the WinnerPaid event
    const winnerPaidEvent = payoutReceipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "WinnerPaid";
      } catch {
        return false;
      }
    });
    
    const parsedEvent = contract.interface.parseLog(winnerPaidEvent);
    const winner = parsedEvent.args.winner;
    const winningAmount = parsedEvent.args.amount;
    
    console.log("🏆 Winner selected and paid!");
    console.log("- Winner:", winner);
    console.log("- Amount paid:", ethers.formatEther(winningAmount), "ETH");
    
    // Check balances after payout
    const contributor1BalanceAfter = await contributor1.provider.getBalance(contributor1.address);
    const contributor2BalanceAfter = await contributor2.provider.getBalance(contributor2.address);
    
    console.log("💰 Balances after payout:");
    console.log("- Contributor 1:", ethers.formatEther(contributor1BalanceAfter), "ETH");
    console.log("- Contributor 2:", ethers.formatEther(contributor2BalanceAfter), "ETH");
    
    // Check final reputations
    console.log("📊 Final reputations:");
    console.log("- Contributor 1:", await contract.getUserReputation(contributor1.address));
    console.log("- Contributor 2:", await contract.getUserReputation(contributor2.address));
    console.log("- Voter 1:", await contract.getUserReputation(voter1.address));
    console.log("- Voter 2:", await contract.getUserReputation(voter2.address), "\n");

    // 8. Display final bounty state
    console.log("🎯 Step 8: Final bounty information...");
    const finalBountyInfo = await contract.getBounty(bountyId);
    console.log("📋 Final Bounty State:");
    console.log("- Status:", finalBountyInfo.status, "(2 = Completed)");
    console.log("- Total Submissions:", finalBountyInfo.totalSubmissions.toString());
    console.log("- Winning Submission ID:", finalBountyInfo.winningSubmissionId.toString());
    console.log("- Funds Released:", finalBountyInfo.fundsReleased);
    
    // Get all submissions for this bounty
    const allSubmissions = await contract.getBountySubmissions(bountyId);
    console.log("- All Submission IDs:", allSubmissions.map(id => id.toString()).join(", "));
    
    // Get all votes for this bounty
    const allVotes = await contract.getBountyVotes(bountyId);
    console.log("- Total Votes Cast:", allVotes.length);
    
    console.log("\n🎉 Complete bounty lifecycle demonstration finished!");
    console.log("✨ All contract functions tested successfully!");

  } catch (error) {
    console.error("❌ Error during interaction:");
    console.error(error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.code) {
      console.error("Error Code:", error.code);
    }
  }
}

// Helper function to display contract stats
async function displayContractStats(contract) {
  console.log("📊 Contract Statistics:");
  console.log("- Total Bounties:", await contract.getTotalBounties());
  console.log("- Total Submissions:", await contract.getTotalSubmissions());
  console.log("- Platform Fee:", await contract.platformFeePercent(), "basis points");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction script failed:");
    console.error(error);
    process.exit(1);
  });