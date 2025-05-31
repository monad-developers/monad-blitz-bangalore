// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./OwnershipManager.sol";

abstract contract VerificationManager is OwnershipManager {
    // Events
    event WalletVerified(address indexed user, bool verified);
    event ChallengeGenerated(address indexed user, bytes32 challenge);

    // Mappings for verified users and challenges
    mapping(address => bool) private verified;
    mapping(address => bytes32) private challenges;

    // Generate a challenge for a user
    function generateChallenge(address user) external {
        require(!verified[user], "User already verified");
        bytes32 challenge = keccak256(
            abi.encodePacked(user, block.timestamp, blockhash(block.number - 1))
        );
        challenges[user] = challenge;
        emit ChallengeGenerated(user, challenge);
    }

    // Verify user based on their signed challenge
    function verifyUser(address user, bytes memory signature) external {
        bytes32 challenge = challenges[user];
        require(challenge != bytes32(0), "No challenge found for user");

        // Hash with Ethereum signed message prefix
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
        );

        address signer = recoverSigner(messageHash, signature);
        require(signer == user, "Invalid signature");

        verified[user] = true;
        delete challenges[user];
        emit WalletVerified(user, true);
    }

    // Revoke verification for multiple addresses
    function revokeVerification(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            verified[wallets[i]] = false;
            emit WalletVerified(wallets[i], false);
        }
    }

    // View function to check verification status
    function isVerified(address wallet) external view returns (bool) {
        return verified[wallet];
    }

    // Helper to recover signer from signature
    function recoverSigner(bytes32 messageHash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature 'v' value");

        return ecrecover(messageHash, v, r, s);
    }
}
