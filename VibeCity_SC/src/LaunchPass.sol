// filepath: /launch-pass-project/launch-pass-project/src/LaunchPass.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/Counters.sol";

contract LaunchPass is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    enum TokenType { DiscountToken, CreatorShareToken, BadgeNFT }

    mapping(uint256 => TokenType) public tokenTypes;
    mapping(uint256 => string) private _tokenURIs;

    constructor(address initialOwner) ERC1155("https://api.example.com/metadata/{id}.json") Ownable(initialOwner) {}

    function mint(address account, uint256 amount, TokenType tokenType, string memory tokenURI) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _mint(account, tokenId, amount, "");
        tokenTypes[tokenId] = tokenType;
        _setTokenURI(tokenId, tokenURI);
        _tokenIdCounter.increment();
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        _tokenURIs[tokenId] = tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function transfer(address from, address to, uint256 id, uint256 amount, bytes memory data) public {
        safeTransferFrom(from, to, id, amount, data);
    }
}