// SPDX-License-Identifier: MIT
// This file contains the test cases for the LaunchPassFactory contract. 
// It verifies the functionality of the factory contract, including the creation of new LaunchPass instances.

pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LaunchPassFactory.sol";
import "../src/LaunchPass.sol";

contract LaunchPassFactoryTest is Test {
    LaunchPassFactory private factory;
    LaunchPass private launchPass;

    function setUp() public {
        factory = new LaunchPassFactory();
    }

    function testCreateLaunchPass() public {
        // Rename variable to avoid shadowing
        ILaunchPass newLaunchPass = factory.createLaunchPass("LaunchPass", "LP");
        assertEq(address(newLaunchPass), factory.getLaunchPasses(address(this))[0]);
    }

    function testLaunchPassCount() public {
        // Fix argument count to match function signature
        factory.createLaunchPass("LaunchPass1", "LP1");
        factory.createLaunchPass("LaunchPass2", "LP2");
        // Use array length instead of non-existent launchPassCount
        assertEq(factory.getLaunchPasses(address(this)).length, 2);
    }
}