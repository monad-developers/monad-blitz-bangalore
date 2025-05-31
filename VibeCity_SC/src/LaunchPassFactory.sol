// filepath: /launch-pass-project/launch-pass-project/src/LaunchPassFactory.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./LaunchPass.sol";
import "./interface/ILaunchPassFactory.sol";
contract LaunchPassFactory is ILaunchPassFactory {
    mapping(address => address[]) public launchPasses;

    function createLaunchPass(string memory name, string memory symbol) 
        external 
        override 
        returns (ILaunchPass) 
    {
        LaunchPass newLaunchPass = new LaunchPass(msg.sender);
        launchPasses[msg.sender].push(address(newLaunchPass));
        return ILaunchPass(address(newLaunchPass));
    }

    function getLaunchPass(address launchPassAddress) 
        external 
        view 
        override 
        returns (ILaunchPass) 
    {
        return ILaunchPass(launchPassAddress);
    }

    function getAllLaunchPasses() 
        external 
        view 
        override 
        returns (ILaunchPass[] memory) 
    {
        // Implementation needed
        revert("Not implemented");
    }

    function getLaunchPasses(address owner) 
        external 
        view 
        returns (address[] memory) 
    {
        return launchPasses[owner];
    }
}