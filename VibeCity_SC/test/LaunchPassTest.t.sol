// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LaunchPass.sol";

contract LaunchPassTest is Test {
    LaunchPass private launchPass;
    address recipient = address(1);
    
    function setUp() public {
        // Fix: Add initialOwner parameter
        launchPass = new LaunchPass(address(this));
    }

    function testMint() public {
        uint256 tokenId = 0;
        uint256 amount = 1;
        // Fix: Use correct TokenType enum
        launchPass.mint(
            recipient, 
            amount,
            LaunchPass.TokenType.DiscountToken,
            "https://example.com/token/1"
        );
        
        assertEq(launchPass.balanceOf(recipient, tokenId), amount);
    }

    function testTransfer() public {
        uint256 tokenId = 0;
        uint256 amount = 1;
        address newRecipient = address(2);
        
        // Fix: Use correct TokenType enum
        launchPass.mint(
            recipient,
            amount,
            LaunchPass.TokenType.DiscountToken,
            "https://example.com/token/1"
        );
        
        vm.prank(recipient);
        launchPass.transfer(recipient, newRecipient, tokenId, amount, "");
        
        assertEq(launchPass.balanceOf(newRecipient, tokenId), amount);
    }
}