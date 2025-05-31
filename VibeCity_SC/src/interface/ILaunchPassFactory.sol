// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./ILaunchPass.sol";

interface ILaunchPassFactory {
    function createLaunchPass(string memory name, string memory symbol) external returns (ILaunchPass);
    function getLaunchPass(address launchPassAddress) external view returns (ILaunchPass);
    function getAllLaunchPasses() external view returns (ILaunchPass[] memory);
}