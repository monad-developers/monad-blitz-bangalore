// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FunctionRegistry.sol";

contract DeployFunctionRegistry is Script {
    function run() external {
        // Use environment variable for private key (required for Monad testnet)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address expectedDeployer = 0x83412990439483714A5ab3CBa7a03AFb7363508C;

        // Verify the private key matches the expected account
        address actualDeployer = vm.addr(deployerPrivateKey);
        require(actualDeployer == expectedDeployer, "Private key does not match expected deployer account");

        console.log("Deploying with account:", actualDeployer);
        console.log("Expected account:", expectedDeployer);

        vm.startBroadcast(deployerPrivateKey);
        
        FunctionRegistry registry = new FunctionRegistry();
        
        console.log("FunctionRegistry deployed at:", address(registry));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Next Function ID:", registry.nextFunctionId());
        console.log("Max Gas Limit:", registry.maxGasLimit());
        
        vm.stopBroadcast();
    }
}
