
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GriffinLockEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum EscrowStatus { Active, Completed, Disputed, Cancelled, Expired }

    struct Escrow {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 deadline;
        EscrowStatus status;
        string senderTelegram;
        string receiverTelegram;
        string description;
        address arbitrator;
        bool senderApproved;
        bool recipientApproved;
        bool arbitratorApproved;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;
    address public platformArbitrator;
    uint256 public platformFee; // In basis points (100 = 1%)

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 deadline
    );

    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowDisputed(uint256 indexed escrowId);
    event EscrowCancelled(uint256 indexed escrowId);
    event EscrowExpired(uint256 indexed escrowId);

    constructor(address _platformArbitrator, uint256 _platformFee) {
        platformArbitrator = _platformArbitrator;
        platformFee = _platformFee;
    }

    function createEscrow(
        address _recipient,
        address _token,
        uint256 _amount,
        uint256 _deadline,
        string memory _senderTelegram,
        string memory _receiverTelegram,
        string memory _description
    ) external payable nonReentrant {
        require(_recipient != address(0), "Invalid recipient");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 escrowId = nextEscrowId++;

        if (_token == address(0)) {
            // ETH escrow
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            // ERC20 token escrow
            require(msg.value == 0, "ETH not needed for token escrow");
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        }

        escrows[escrowId] = Escrow({
            sender: msg.sender,
            recipient: _recipient,
            token: _token,
            amount: _amount,
            deadline: _deadline,
            status: EscrowStatus.Active,
            senderTelegram: _senderTelegram,
            receiverTelegram: _receiverTelegram,
            description: _description,
            arbitrator: platformArbitrator,
            senderApproved: false,
            recipientApproved: false,
            arbitratorApproved: false
        });

        emit EscrowCreated(escrowId, msg.sender, _recipient, _token, _amount, _deadline);
    }

    function releaseEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.sender, "Only sender can release");

        escrow.status = EscrowStatus.Completed;
        
        uint256 fee = (escrow.amount * platformFee) / 10000;
        uint256 recipientAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            // ETH transfer
            payable(escrow.recipient).transfer(recipientAmount);
            if (fee > 0) {
                payable(platformArbitrator).transfer(fee);
            }
        } else {
            // ERC20 transfer
            IERC20(escrow.token).safeTransfer(escrow.recipient, recipientAmount);
            if (fee > 0) {
                IERC20(escrow.token).safeTransfer(platformArbitrator, fee);
            }
        }

        emit EscrowCompleted(_escrowId);
    }

    function claimExpiredEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(block.timestamp > escrow.deadline, "Escrow not expired");
        require(msg.sender == escrow.sender, "Only sender can claim expired escrow");

        escrow.status = EscrowStatus.Expired;

        if (escrow.token == address(0)) {
            payable(escrow.sender).transfer(escrow.amount);
        } else {
            IERC20(escrow.token).safeTransfer(escrow.sender, escrow.amount);
        }

        emit EscrowExpired(_escrowId);
    }

    function raiseDispute(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.sender || msg.sender == escrow.recipient,
            "Only parties can raise dispute"
        );

        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(_escrowId);
    }

    function resolveDispute(
        uint256 _escrowId,
        bool _releaseToRecipient
    ) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(msg.sender == escrow.arbitrator, "Only arbitrator can resolve");

        escrow.status = EscrowStatus.Completed;

        address recipient = _releaseToRecipient ? escrow.recipient : escrow.sender;
        uint256 fee = _releaseToRecipient ? (escrow.amount * platformFee) / 10000 : 0;
        uint256 finalAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            payable(recipient).transfer(finalAmount);
            if (fee > 0) {
                payable(platformArbitrator).transfer(fee);
            }
        } else {
            IERC20(escrow.token).safeTransfer(recipient, finalAmount);
            if (fee > 0) {
                IERC20(escrow.token).safeTransfer(platformArbitrator, fee);
            }
        }

        emit EscrowCompleted(_escrowId);
    }

    function getEscrow(uint256 _escrowId) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }
}
