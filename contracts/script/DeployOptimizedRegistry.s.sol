// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OptimizedFunctionRegistry.sol";

contract DeployOptimizedRegistry is Script {
    function run() external {
        // Use environment variable for private key (required for Monad mainnet)
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address expectedDeployer = 0x83412990439483714A5ab3CBa7a03AFb7363508C;

        // Verify the private key matches the expected account (when not using default)
        address actualDeployer = vm.addr(deployerPrivateKey);
        if (deployerPrivateKey != 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80) {
            require(actualDeployer == expectedDeployer, "Private key does not match expected deployer account");
        }

        vm.startBroadcast(deployerPrivateKey);
        
        OptimizedFunctionRegistry registry = new OptimizedFunctionRegistry();
        
        console.log("OptimizedFunctionRegistry deployed at:", address(registry));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Next Function ID:", registry.nextFunctionId());
        console.log("Max Gas Limit:", registry.MAX_GAS_LIMIT());
        
        vm.stopBroadcast();
    }
}
