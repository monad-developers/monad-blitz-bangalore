// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BountyMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _bountyIds;
    Counters.Counter private _submissionIds;
    
    // Enums
    enum BountyStatus { Active, Voting, Completed, Cancelled }
    enum SubmissionStatus { Pending, Won, Lost }
    
    // Structs
    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        string ipfsHash;
        uint256 deadline;
        uint256 rewardAmount;
        BountyStatus status;
        uint256 totalSubmissions;
        uint256 winningSubmissionId;
        string[] allowedRoles;
        uint256 votingEndTime;
        bool fundsReleased;
    }
    
    struct Submission {
        uint256 id;
        uint256 bountyId;
        address contributor;
        string ipfsHash;
        uint256 voteCount;
        uint256 timestamp;
        SubmissionStatus status;
    }
    
    struct Vote {
        address voter;
        uint256 submissionId;
        uint256 weight;
        uint256 timestamp;
    }
    
    // State variables
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public bountySubmissions; // bountyId => submissionIds[]
    mapping(address => uint256) public userReputation;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // bountyId => voter => hasVoted
    mapping(uint256 => mapping(uint256 => uint256)) public submissionVotes; // bountyId => submissionId => voteCount
    mapping(uint256 => Vote[]) public bountyVotes; // bountyId => votes[]
    
    // Constants
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant MIN_REPUTATION_TO_VOTE = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Events
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 rewardAmount,
        uint256 deadline
    );
    
    event SubmissionReceived(
        uint256 indexed submissionId,
        uint256 indexed bountyId,
        address indexed contributor,
        string ipfsHash
    );
    
    event VotingStarted(
        uint256 indexed bountyId,
        uint256 votingEndTime
    );
    
    event VoteCast(
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address indexed voter,
        uint256 weight
    );
    
    event WinnerPaid(
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address indexed winner,
        uint256 amount
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 newReputation
    );
    
    // Modifiers
    modifier bountyExists(uint256 _bountyId) {
        require(_bountyId > 0 && _bountyId <= _bountyIds.current(), "Bounty does not exist");
        _;
    }
    
    modifier onlyBountyCreator(uint256 _bountyId) {
        require(bounties[_bountyId].creator == msg.sender, "Only bounty creator can call this");
        _;
    }
    
    modifier bountyActive(uint256 _bountyId) {
        require(bounties[_bountyId].status == BountyStatus.Active, "Bounty is not active");
        _;
    }
    
    modifier votingPhase(uint256 _bountyId) {
        require(bounties[_bountyId].status == BountyStatus.Voting, "Bounty is not in voting phase");
        _;
    }
    
    modifier hasMinReputation() {
        require(userReputation[msg.sender] >= MIN_REPUTATION_TO_VOTE, "Insufficient reputation to vote");
        _;
    }
    
    constructor() {
        // Give initial reputation to contract deployer
        userReputation[msg.sender] = 100;
    }
    
    /**
     * @dev Create a new bounty with escrowed funds
     */
    function createBounty(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _deadline,
        string[] memory _allowedRoles
    ) external payable nonReentrant {
        require(msg.value > 0, "Reward amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        _bountyIds.increment();
        uint256 newBountyId = _bountyIds.current();
        
        bounties[newBountyId] = Bounty({
            id: newBountyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            ipfsHash: _ipfsHash,
            deadline: _deadline,
            rewardAmount: msg.value,
            status: BountyStatus.Active,
            totalSubmissions: 0,
            winningSubmissionId: 0,
            allowedRoles: _allowedRoles,
            votingEndTime: 0,
            fundsReleased: false
        });
        
        emit BountyCreated(newBountyId, msg.sender, _title, msg.value, _deadline);
    }
    
    /**
     * @dev Submit work for a bounty
     */
    function submitWork(
        uint256 _bountyId,
        string memory _ipfsHash
    ) external bountyExists(_bountyId) bountyActive(_bountyId) {
        require(block.timestamp <= bounties[_bountyId].deadline, "Bounty deadline has passed");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(msg.sender != bounties[_bountyId].creator, "Bounty creator cannot submit");
        
        _submissionIds.increment();
        uint256 newSubmissionId = _submissionIds.current();
        
        submissions[newSubmissionId] = Submission({
            id: newSubmissionId,
            bountyId: _bountyId,
            contributor: msg.sender,
            ipfsHash: _ipfsHash,
            voteCount: 0,
            timestamp: block.timestamp,
            status: SubmissionStatus.Pending
        });
        
        bountySubmissions[_bountyId].push(newSubmissionId);
        bounties[_bountyId].totalSubmissions++;
        
        // Award reputation for participation
        userReputation[msg.sender] += 5;
        
        emit SubmissionReceived(newSubmissionId, _bountyId, msg.sender, _ipfsHash);
        emit ReputationUpdated(msg.sender, userReputation[msg.sender]);
    }
    
    /**
     * @dev Start voting phase for a bounty
     */
    function startVotingPhase(uint256 _bountyId) 
        external 
        bountyExists(_bountyId) 
        bountyActive(_bountyId) 
    {
        require(
            msg.sender == bounties[_bountyId].creator || block.timestamp > bounties[_bountyId].deadline,
            "Only creator can start voting before deadline"
        );
        require(bounties[_bountyId].totalSubmissions > 0, "No submissions to vote on");
        
        bounties[_bountyId].status = BountyStatus.Voting;
        bounties[_bountyId].votingEndTime = block.timestamp + VOTING_DURATION;
        
        emit VotingStarted(_bountyId, bounties[_bountyId].votingEndTime);
    }
    
    /**
     * @dev Vote on a submission
     */
    function voteOnSubmission(
        uint256 _bountyId,
        uint256 _submissionId
    ) external bountyExists(_bountyId) votingPhase(_bountyId) hasMinReputation {
        require(block.timestamp <= bounties[_bountyId].votingEndTime, "Voting period has ended");
        require(!hasVoted[_bountyId][msg.sender], "Already voted on this bounty");
        require(submissions[_submissionId].bountyId == _bountyId, "Submission does not belong to this bounty");
        require(msg.sender != submissions[_submissionId].contributor, "Cannot vote on own submission");
        
        uint256 voteWeight = userReputation[msg.sender];
        
        hasVoted[_bountyId][msg.sender] = true;
        submissionVotes[_bountyId][_submissionId] += voteWeight;
        submissions[_submissionId].voteCount += voteWeight;
        
        bountyVotes[_bountyId].push(Vote({
            voter: msg.sender,
            submissionId: _submissionId,
            weight: voteWeight,
            timestamp: block.timestamp
        }));
        
        // Award reputation for voting
        userReputation[msg.sender] += 2;
        
        emit VoteCast(_bountyId, _submissionId, msg.sender, voteWeight);
        emit ReputationUpdated(msg.sender, userReputation[msg.sender]);
    }
    
    /**
     * @dev Select winner and release payment
     */
    function selectWinnerAndPayout(uint256 _bountyId) 
        external 
        bountyExists(_bountyId) 
        votingPhase(_bountyId) 
        nonReentrant 
    {
        require(block.timestamp > bounties[_bountyId].votingEndTime, "Voting period not ended");
        require(!bounties[_bountyId].fundsReleased, "Funds already released");
        
        uint256 winningSubmissionId = _getWinningSubmission(_bountyId);
        require(winningSubmissionId > 0, "No valid submissions found");
        
        Submission storage winningSubmission = submissions[winningSubmissionId];
        address winner = winningSubmission.contributor;
        uint256 rewardAmount = bounties[_bountyId].rewardAmount;
        
        // Calculate platform fee
        uint256 platformFee = (rewardAmount * platformFeePercent) / FEE_DENOMINATOR;
        uint256 winnerPayout = rewardAmount - platformFee;
        
        // Update states
        bounties[_bountyId].status = BountyStatus.Completed;
        bounties[_bountyId].winningSubmissionId = winningSubmissionId;
        bounties[_bountyId].fundsReleased = true;
        winningSubmission.status = SubmissionStatus.Won;
        
        // Award reputation to winner
        userReputation[winner] += 50;
        
        // Mark losing submissions
        uint256[] memory submissionIds = bountySubmissions[_bountyId];
        for (uint256 i = 0; i < submissionIds.length; i++) {
            if (submissionIds[i] != winningSubmissionId) {
                submissions[submissionIds[i]].status = SubmissionStatus.Lost;
            }
        }
        
        // Transfer funds
        (bool success, ) = payable(winner).call{value: winnerPayout}("");
        require(success, "Transfer to winner failed");
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        
        emit WinnerPaid(_bountyId, winningSubmissionId, winner, winnerPayout);
        emit ReputationUpdated(winner, userReputation[winner]);
    }
    
    /**
     * @dev Cancel bounty and refund creator (only if no submissions)
     */
    function cancelBounty(uint256 _bountyId) 
        external 
        bountyExists(_bountyId) 
        onlyBountyCreator(_bountyId) 
        nonReentrant 
    {
        require(
            bounties[_bountyId].status == BountyStatus.Active,
            "Can only cancel active bounties"
        );
        require(
            bounties[_bountyId].totalSubmissions == 0,
            "Cannot cancel bounty with submissions"
        );
        
        bounties[_bountyId].status = BountyStatus.Cancelled;
        bounties[_bountyId].fundsReleased = true;
        
        uint256 refundAmount = bounties[_bountyId].rewardAmount;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");
    }
    
    /**
     * @dev Get winning submission (highest vote count)
     */
    function _getWinningSubmission(uint256 _bountyId) private view returns (uint256) {
        uint256[] memory submissionIds = bountySubmissions[_bountyId];
        if (submissionIds.length == 0) return 0;
        
        uint256 winningId = submissionIds[0];
        uint256 highestVotes = submissions[winningId].voteCount;
        
        for (uint256 i = 1; i < submissionIds.length; i++) {
            uint256 currentId = submissionIds[i];
            if (submissions[currentId].voteCount > highestVotes) {
                highestVotes = submissions[currentId].voteCount;
                winningId = currentId;
            }
        }
        
        return winningId;
    }
    
    // View functions
    function getBounty(uint256 _bountyId) external view bountyExists(_bountyId) returns (Bounty memory) {
        return bounties[_bountyId];
    }
    
    function getSubmission(uint256 _submissionId) external view returns (Submission memory) {
        require(_submissionId > 0 && _submissionId <= _submissionIds.current(), "Submission does not exist");
        return submissions[_submissionId];
    }
    
    function getBountySubmissions(uint256 _bountyId) external view bountyExists(_bountyId) returns (uint256[] memory) {
        return bountySubmissions[_bountyId];
    }
    
    function getBountyVotes(uint256 _bountyId) external view bountyExists(_bountyId) returns (Vote[] memory) {
        return bountyVotes[_bountyId];
    }
    
    function getTotalBounties() external view returns (uint256) {
        return _bountyIds.current();
    }
    
    function getTotalSubmissions() external view returns (uint256) {
        return _submissionIds.current();
    }
    
    function getUserReputation(address _user) external view returns (uint256) {
        return userReputation[_user];
    }
    
    // Admin functions
    function setPlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _newFeePercent;
    }
    
    function grantReputation(address _user, uint256 _amount) external onlyOwner {
        userReputation[_user] += _amount;
        emit ReputationUpdated(_user, userReputation[_user]);
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}