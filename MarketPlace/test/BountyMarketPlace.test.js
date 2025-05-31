// test/BountyMarketplace.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BountyMarketplace", function () {
  let BountyMarketplace;
  let bountyMarketplace;
  let owner;
  let creator;
  let contributor1;
  let contributor2;
  let voter1;
  let voter2;

  const BOUNTY_TITLE = "Build a DeFi Dashboard";
  const BOUNTY_DESCRIPTION = "Create a React dashboard for DeFi protocols";
  const IPFS_HASH = "QmExampleIPFSHash123456789";
  const SUBMISSION_HASH_1 = "QmSubmission1Hash";
  const SUBMISSION_HASH_2 = "QmSubmission2Hash";
  const REWARD_AMOUNT = ethers.utils.parseEther("1.0");

  beforeEach(async function () {
    // Get signers
    [owner, creator, contributor1, contributor2, voter1, voter2] = await ethers.getSigners();

    // Deploy contract
    BountyMarketplace = await ethers.getContractFactory("BountyMarketplace");
    bountyMarketplace = await BountyMarketplace.deploy();
    await bountyMarketplace.deployed();

    // Setup initial reputation
    await bountyMarketplace.grantReputation(voter1.address, 10);
    await bountyMarketplace.grantReputation(voter2.address, 15);
    await bountyMarketplace.grantReputation(creator.address, 5);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bountyMarketplace.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      expect(await bountyMarketplace.platformFeePercent()).to.equal(250);
      expect(await bountyMarketplace.MIN_REPUTATION_TO_VOTE()).to.equal(1);
      expect(await bountyMarketplace.VOTING_DURATION()).to.equal(7 * 24 * 60 * 60);
    });

    it("Should give initial reputation to owner", async function () {
      expect(await bountyMarketplace.getUserReputation(owner.address)).to.equal(100);
    });
  });

  describe("Bounty Creation", function () {
    it("Should create a bounty successfully", async function () {
      const deadline = (await time.latest()) + 86400; // 1 day from now
      
      await expect(
        bountyMarketplace.connect(creator).createBounty(
          BOUNTY_TITLE,
          BOUNTY_DESCRIPTION,
          IPFS_HASH,
          deadline,
          ["Developer"],
          { value: REWARD_AMOUNT }
        )
      ).to.emit(bountyMarketplace, "BountyCreated")
        .withArgs(1, creator.address, BOUNTY_TITLE, REWARD_AMOUNT, deadline);

      const bounty = await bountyMarketplace.getBounty(1);
      expect(bounty.creator).to.equal(creator.address);
      expect(bounty.title).to.equal(BOUNTY_TITLE);
      expect(bounty.rewardAmount).to.equal(REWARD_AMOUNT);
      expect(bounty.status).to.equal(0); // Active
    });

    it("Should fail to create bounty with zero reward", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        bountyMarketplace.connect(creator).createBounty(
          BOUNTY_TITLE,
          BOUNTY_DESCRIPTION,
          IPFS_HASH,
          deadline,
          [],
          { value: 0 }
        )
      ).to.be.revertedWith("Reward amount must be greater than 0");
    });

    it("Should fail to create bounty with past deadline", async function () {
      const pastDeadline = (await time.latest()) - 3600; // 1 hour ago
      
      await expect(
        bountyMarketplace.connect(creator).createBounty(
          BOUNTY_TITLE,
          BOUNTY_DESCRIPTION,
          IPFS_HASH,
          pastDeadline,
          [],
          { value: REWARD_AMOUNT }
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("Should fail with empty title", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        bountyMarketplace.connect(creator).createBounty(
          "",
          BOUNTY_DESCRIPTION,
          IPFS_HASH,
          deadline,
          [],
          { value: REWARD_AMOUNT }
        )
      ).to.be.revertedWith("Title cannot be empty");
    });
  });

  describe("Work Submission", function () {
    let bountyId;
    let deadline;

    beforeEach(async function () {
      deadline = (await time.latest()) + 86400; // 1 day from now
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      bountyId = 1;
    });

    it("Should submit work successfully", async function () {
      await expect(
        bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1)
      ).to.emit(bountyMarketplace, "SubmissionReceived")
        .withArgs(1, bountyId, contributor1.address, SUBMISSION_HASH_1);

      const submission = await bountyMarketplace.getSubmission(1);
      expect(submission.contributor).to.equal(contributor1.address);
      expect(submission.ipfsHash).to.equal(SUBMISSION_HASH_1);
      expect(submission.bountyId).to.equal(bountyId);
    });

    it("Should increase contributor reputation", async function () {
      const reputationBefore = await bountyMarketplace.getUserReputation(contributor1.address);
      
      await bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1);
      
      const reputationAfter = await bountyMarketplace.getUserReputation(contributor1.address);
      expect(reputationAfter).to.equal(reputationBefore.add(5));
    });

    it("Should fail if deadline has passed", async function () {
      await time.increaseTo(deadline + 1);
      
      await expect(
        bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1)
      ).to.be.revertedWith("Bounty deadline has passed");
    });

    it("Should fail if bounty creator tries to submit", async function () {
      await expect(
        bountyMarketplace.connect(creator).submitWork(bountyId, SUBMISSION_HASH_1)
      ).to.be.revertedWith("Bounty creator cannot submit");
    });

    it("Should fail with empty IPFS hash", async function () {
      await expect(
        bountyMarketplace.connect(contributor1).submitWork(bountyId, "")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });

  describe("Voting Phase", function () {
    let bountyId;
    let deadline;

    beforeEach(async function () {
      deadline = (await time.latest()) + 86400;
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      bountyId = 1;

      // Add submissions
      await bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1);
      await bountyMarketplace.connect(contributor2).submitWork(bountyId, SUBMISSION_HASH_2);
    });

    it("Should start voting phase successfully", async function () {
      await expect(
        bountyMarketplace.connect(creator).startVotingPhase(bountyId)
      ).to.emit(bountyMarketplace, "VotingStarted");

      const bounty = await bountyMarketplace.getBounty(bountyId);
      expect(bounty.status).to.equal(1); // Voting
    });

    it("Should allow voting after deadline without creator", async function () {
      await time.increaseTo(deadline + 1);
      
      await expect(
        bountyMarketplace.connect(voter1).startVotingPhase(bountyId)
      ).to.emit(bountyMarketplace, "VotingStarted");
    });

    it("Should fail to start voting with no submissions", async function () {
      // Create new bounty with no submissions
      const newDeadline = (await time.latest()) + 86400;
      await bountyMarketplace.connect(creator).createBounty(
        "New Bounty",
        "Description",
        "QmHash",
        newDeadline,
        [],
        { value: REWARD_AMOUNT }
      );

      await expect(
        bountyMarketplace.connect(creator).startVotingPhase(2)
      ).to.be.revertedWith("No submissions to vote on");
    });
  });

  describe("Voting", function () {
    let bountyId;
    let submissionId1;
    let submissionId2;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      bountyId = 1;

      await bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1);
      await bountyMarketplace.connect(contributor2).submitWork(bountyId, SUBMISSION_HASH_2);
      
      submissionId1 = 1;
      submissionId2 = 2;

      await bountyMarketplace.connect(creator).startVotingPhase(bountyId);
    });

    it("Should vote successfully", async function () {
      const voterReputation = await bountyMarketplace.getUserReputation(voter1.address);
      
      await expect(
        bountyMarketplace.connect(voter1).voteOnSubmission(bountyId, submissionId1)
      ).to.emit(bountyMarketplace, "VoteCast")
        .withArgs(bountyId, submissionId1, voter1.address, voterReputation);

      const submission = await bountyMarketplace.getSubmission(submissionId1);
      expect(submission.voteCount).to.equal(voterReputation);
    });

    it("Should increase voter reputation", async function () {
      const reputationBefore = await bountyMarketplace.getUserReputation(voter1.address);
      
      await bountyMarketplace.connect(voter1).voteOnSubmission(bountyId, submissionId1);
      
      const reputationAfter = await bountyMarketplace.getUserReputation(voter1.address);
      expect(reputationAfter).to.equal(reputationBefore.add(2));
    });

    it("Should fail to vote twice", async function () {
      await bountyMarketplace.connect(voter1).voteOnSubmission(bountyId, submissionId1);
      
      await expect(
        bountyMarketplace.connect(voter1).voteOnSubmission(bountyId, submissionId2)
      ).to.be.revertedWith("Already voted on this bounty");
    });

    it("Should fail to vote on own submission", async function () {
      await expect(
        bountyMarketplace.connect(contributor1).voteOnSubmission(bountyId, submissionId1)
      ).to.be.revertedWith("Cannot vote on own submission");
    });

    it("Should fail to vote with insufficient reputation", async function () {
      await expect(
        bountyMarketplace.connect(contributor1).voteOnSubmission(bountyId, submissionId2)
      ).to.be.revertedWith("Insufficient reputation to vote");
    });
  });

  describe("Winner Selection and Payout", function () {
    let bountyId;
    let submissionId1;
    let submissionId2;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      bountyId = 1;

      await bountyMarketplace.connect(contributor1).submitWork(bountyId, SUBMISSION_HASH_1);
      await bountyMarketplace.connect(contributor2).submitWork(bountyId, SUBMISSION_HASH_2);
      
      submissionId1 = 1;
      submissionId2 = 2;

      await bountyMarketplace.connect(creator).startVotingPhase(bountyId);
      
      // Cast votes - voter2 has more reputation
      await bountyMarketplace.connect(voter1).voteOnSubmission(bountyId, submissionId1);
      await bountyMarketplace.connect(voter2).voteOnSubmission(bountyId, submissionId2);
      
      // Fast forward past voting period
      const bounty = await bountyMarketplace.getBounty(bountyId);
      await time.increaseTo(bounty.votingEndTime.add(1));
    });

    it("Should select winner and payout correctly", async function () {
      const contributorBalanceBefore = await contributor2.getBalance();
      const expectedPayout = REWARD_AMOUNT.mul(9750).div(10000); // After 2.5% fee
      
      await expect(
        bountyMarketplace.selectWinnerAndPayout(bountyId)
      ).to.emit(bountyMarketplace, "WinnerPaid")
        .withArgs(bountyId, submissionId2, contributor2.address, expectedPayout);

      const contributorBalanceAfter = await contributor2.getBalance();
      expect(contributorBalanceAfter).to.be.gt(contributorBalanceBefore);

      const bounty = await bountyMarketplace.getBounty(bountyId);
      expect(bounty.status).to.equal(2); // Completed
      expect(bounty.winningSubmissionId).to.equal(submissionId2);
    });

    it("Should increase winner reputation", async function () {
      const reputationBefore = await bountyMarketplace.getUserReputation(contributor2.address);
      
      await bountyMarketplace.selectWinnerAndPayout(bountyId);
      
      const reputationAfter = await bountyMarketplace.getUserReputation(contributor2.address);
      expect(reputationAfter).to.equal(reputationBefore.add(50));
    });

    it("Should fail if voting period not ended", async function () {
      // Create new bounty and start voting
      const deadline = (await time.latest()) + 86400;
      await bountyMarketplace.connect(creator).createBounty(
        "New Bounty",
        "Description",
        "QmHash",
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      
      await bountyMarketplace.connect(contributor1).submitWork(2, SUBMISSION_HASH_1);
      await bountyMarketplace.connect(creator).startVotingPhase(2);
      
      await expect(
        bountyMarketplace.selectWinnerAndPayout(2)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("Should fail to payout twice", async function () {
      await bountyMarketplace.selectWinnerAndPayout(bountyId);
      
      await expect(
        bountyMarketplace.selectWinnerAndPayout(bountyId)
      ).to.be.revertedWith("Funds already released");
    });
  });

  describe("Bounty Cancellation", function () {
    it("Should cancel bounty without submissions", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );

      const creatorBalanceBefore = await creator.getBalance();
      
      await bountyMarketplace.connect(creator).cancelBounty(1);
      
      const creatorBalanceAfter = await creator.getBalance();
      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);

      const bounty = await bountyMarketplace.getBounty(1);
      expect(bounty.status).to.equal(3); // Cancelled
    });

    it("Should fail to cancel bounty with submissions", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );

      await bountyMarketplace.connect(contributor1).submitWork(1, SUBMISSION_HASH_1);
      
      await expect(
        bountyMarketplace.connect(creator).cancelBounty(1)
      ).to.be.revertedWith("Cannot cancel bounty with submissions");
    });

    it("Should fail if not bounty creator", async function () {
      const deadline = (await time.latest()) + 86400;
      await bountyMarketplace.connect(creator).createBounty(
        BOUNTY_TITLE,
        BOUNTY_DESCRIPTION,
        IPFS_HASH,
        deadline,
        [],
        { value: REWARD_AMOUNT }
      );
      // Try to cancel as someone who is not the creator
      await expect(
        bountyMarketplace.connect(contributor1).cancelBounty(1)
      ).to.be.revertedWith("Only bounty creator can call this");
    });
  });
});