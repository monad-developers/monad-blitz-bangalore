// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./OwnershipManager.sol";
import "./VerificationEvents.sol";

abstract contract VerificationManager is OwnershipManager, VerificationEvents {
    mapping(address => bool) private verified;

    function verifyUser(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            verified[wallets[i]] = true;
            emit WalletVerified(wallets[i], true);
        }
    }

    function revokeVerification(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            verified[wallets[i]] = false;
            emit WalletVerified(wallets[i], false);
        }
    }

    function isVerified(address wallet) external view returns (bool) {
        return verified[wallet];
    }
}
