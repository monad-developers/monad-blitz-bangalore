// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./VerificationManager.sol";

contract GhostPass is VerificationManager {
    constructor() OwnershipManager() {}
}
