// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ILaunchPass {
    function mint(address to, uint256 id, uint256 amount, bytes calldata data) external;
    function transfer(address from, address to, uint256 id, uint256 amount) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function uri(uint256 id) external view returns (string memory);
    function setURI(uint256 id, string calldata newuri) external;
}