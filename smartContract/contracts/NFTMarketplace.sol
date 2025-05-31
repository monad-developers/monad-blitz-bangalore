// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Structs
    struct NFTDetails {
        uint256 basePrice;
        bool isListedForSale;
        bool isListedForRent;
        uint256 rentPricePerDay;
        bool isCurrentlyRented;
        address currentRenter;
        uint256 rentalStartTime;
        uint256 rentalDuration;
        bool isLocked;
        uint256 lockEndTime;
        uint256 lockDuration;
    }
    
    struct RentalInfo {
        address renter;
        uint256 startTime;
        uint256 endTime;
        uint256 dailyRate;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => NFTDetails) public nftDetails;
    mapping(uint256 => RentalInfo) public rentalInfo;
    
    // Mapping to track user rights for rented NFTs
    mapping(uint256 => address) public temporaryUser;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, uint256 basePrice, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTDelisted(uint256 indexed tokenId, address indexed owner);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTRentListed(uint256 indexed tokenId, uint256 dailyRate, address indexed owner);
    event NFTRented(uint256 indexed tokenId, address indexed renter, address indexed owner, uint256 duration, uint256 totalCost);
    event NFTRentalEnded(uint256 indexed tokenId, address indexed renter, address indexed owner);
    event NFTLocked(uint256 indexed tokenId, address indexed owner, uint256 lockDuration, uint256 lockEndTime);
    event NFTUnlocked(uint256 indexed tokenId, address indexed owner);
    
    constructor() ERC721("NFTMarketplace", "NFTM") Ownable(msg.sender) {}
    
    // Helper function to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Mint NFT with base price and automatically list for sale
    function mintNFT(
        address to,
        string memory uri,
        uint256 basePrice
    ) public returns (uint256) {
        require(basePrice > 0, "Base price must be greater than 0");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Set NFT details - automatically listed for sale at base price
        nftDetails[tokenId] = NFTDetails({
            basePrice: basePrice,
            isListedForSale: true,  // Automatically listed for sale
            isListedForRent: false,
            rentPricePerDay: 0,
            isCurrentlyRented: false,
            currentRenter: address(0),
            rentalStartTime: 0,
            rentalDuration: 0,
            isLocked: false,
            lockEndTime: 0,
            lockDuration: 0
        });
        
        emit NFTMinted(tokenId, to, basePrice, uri);
        emit NFTListed(tokenId, basePrice, to); // Emit listed event since it's auto-listed
        return tokenId;
    }
    
    // List NFT for sale (no price parameter needed - uses basePrice)
    function listForSale(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can list for sale");
        require(!nftDetails[tokenId].isCurrentlyRented, "Cannot list rented NFT for sale");
        
        nftDetails[tokenId].isListedForSale = true;
        
        emit NFTListed(tokenId, nftDetails[tokenId].basePrice, msg.sender);
    }
    
    // Delist NFT from sale (only if not locked)
    function delistFromSale(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can delist");
        require(nftDetails[tokenId].isListedForSale, "NFT is not listed for sale");
        require(!nftDetails[tokenId].isLocked, "Cannot delist locked NFT");
        require(block.timestamp >= nftDetails[tokenId].lockEndTime, "NFT is still in lock period");
        
        nftDetails[tokenId].isListedForSale = false;
        
        emit NFTDelisted(tokenId, msg.sender);
    }
    
    // Buy NFT
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isListedForSale, "NFT is not listed for sale");
        require(!nftDetails[tokenId].isCurrentlyRented, "Cannot buy rented NFT");
        require(msg.value >= nftDetails[tokenId].basePrice, "Payment below base price");
        
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");
        
        uint256 basePrice = nftDetails[tokenId].basePrice;
        
        // Reset listing status
        nftDetails[tokenId].isListedForSale = false;
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer all payment to seller (no refund for excess)
        payable(seller).transfer(msg.value);
        
        emit NFTSold(tokenId, seller, msg.sender, basePrice);
    }
    
    // List NFT for rent
    function listForRent(uint256 tokenId, uint256 dailyRate) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can list for rent");
        require(dailyRate > 0, "Daily rate must be greater than 0");
        require(!nftDetails[tokenId].isCurrentlyRented, "NFT is already rented");
        
        nftDetails[tokenId].isListedForRent = true;
        nftDetails[tokenId].rentPricePerDay = dailyRate;
        
        emit NFTRentListed(tokenId, dailyRate, msg.sender);
    }
    
    // Delist NFT from rent
    function delistFromRent(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can delist");
        require(nftDetails[tokenId].isListedForRent, "NFT is not listed for rent");
        require(!nftDetails[tokenId].isCurrentlyRented, "Cannot delist currently rented NFT");
        
        nftDetails[tokenId].isListedForRent = false;
        nftDetails[tokenId].rentPricePerDay = 0;
    }
    
    // Rent NFT
    function rentNFT(uint256 tokenId, uint256 durationInDays) public payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isListedForRent, "NFT is not listed for rent");
        require(!nftDetails[tokenId].isCurrentlyRented, "NFT is already rented");
        require(durationInDays > 0, "Duration must be greater than 0");
        
        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "Cannot rent your own NFT");
        
        uint256 totalCost = nftDetails[tokenId].rentPricePerDay * durationInDays;
        require(msg.value >= totalCost, "Insufficient payment for rent");
        
        // Set rental details
        nftDetails[tokenId].isCurrentlyRented = true;
        nftDetails[tokenId].currentRenter = msg.sender;
        nftDetails[tokenId].rentalStartTime = block.timestamp;
        nftDetails[tokenId].rentalDuration = durationInDays * 1 days;
        
        // Set rental info
        rentalInfo[tokenId] = RentalInfo({
            renter: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + (durationInDays * 1 days),
            dailyRate: nftDetails[tokenId].rentPricePerDay,
            isActive: true
        });
        
        // Grant temporary user rights
        temporaryUser[tokenId] = msg.sender;
        
        // Transfer payment to owner
        payable(owner).transfer(totalCost);
        
        // Keep excess payment (no refund)
        
        emit NFTRented(tokenId, msg.sender, owner, durationInDays, totalCost);
    }
    
    // Lock NFT for a specific duration (prevents delisting)
    function lockNFT(uint256 tokenId, uint256 lockDurationInDays) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can lock NFT");
        require(lockDurationInDays > 0, "Lock duration must be greater than 0");
        require(!nftDetails[tokenId].isLocked, "NFT is already locked");
        require(!nftDetails[tokenId].isCurrentlyRented, "Cannot lock rented NFT");
        
        uint256 lockDurationSeconds = lockDurationInDays * 1 days;
        uint256 lockEndTime = block.timestamp + lockDurationSeconds;
        
        nftDetails[tokenId].isLocked = true;
        nftDetails[tokenId].lockEndTime = lockEndTime;
        nftDetails[tokenId].lockDuration = lockDurationSeconds;
        
        // Ensure NFT is listed for sale when locked
        if (!nftDetails[tokenId].isListedForSale) {
            nftDetails[tokenId].isListedForSale = true;
            emit NFTListed(tokenId, nftDetails[tokenId].basePrice, msg.sender);
        }
        
        emit NFTLocked(tokenId, msg.sender, lockDurationInDays, lockEndTime);
    }
    
    // Unlock NFT manually (only after lock period expires)
    function unlockNFT(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can unlock NFT");
        require(nftDetails[tokenId].isLocked, "NFT is not locked");
        require(block.timestamp >= nftDetails[tokenId].lockEndTime, "Lock period has not expired");
        
        nftDetails[tokenId].isLocked = false;
        nftDetails[tokenId].lockEndTime = 0;
        nftDetails[tokenId].lockDuration = 0;
        
        emit NFTUnlocked(tokenId, msg.sender);
    }
    
    // Check and auto-unlock expired locks
    function checkAndUnlockExpiredLock(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isLocked, "NFT is not locked");
        require(block.timestamp >= nftDetails[tokenId].lockEndTime, "Lock period has not expired");
        
        address owner = ownerOf(tokenId);
        nftDetails[tokenId].isLocked = false;
        nftDetails[tokenId].lockEndTime = 0;
        nftDetails[tokenId].lockDuration = 0;
        
        emit NFTUnlocked(tokenId, owner);
    }
    
    function endRental(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isCurrentlyRented, "NFT is not currently rented");
        
        address owner = ownerOf(tokenId);
        address renter = nftDetails[tokenId].currentRenter;
        
        // Check if rental period has expired or if called by owner/renter
        bool rentalExpired = block.timestamp >= (nftDetails[tokenId].rentalStartTime + nftDetails[tokenId].rentalDuration);
        bool authorizedCaller = (msg.sender == owner || msg.sender == renter);
        
        require(rentalExpired || authorizedCaller, "Rental period not expired and unauthorized caller");
        
        // Reset rental status
        nftDetails[tokenId].isCurrentlyRented = false;
        nftDetails[tokenId].currentRenter = address(0);
        nftDetails[tokenId].rentalStartTime = 0;
        nftDetails[tokenId].rentalDuration = 0;
        
        // Clear rental info
        rentalInfo[tokenId].isActive = false;
        
        // Remove temporary user rights
        temporaryUser[tokenId] = address(0);
        
        emit NFTRentalEnded(tokenId, renter, owner);
    }
    
    // Check if rental has expired and auto-end if needed
    function checkAndEndExpiredRental(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isCurrentlyRented, "NFT is not currently rented");
        
        bool rentalExpired = block.timestamp >= (nftDetails[tokenId].rentalStartTime + nftDetails[tokenId].rentalDuration);
        require(rentalExpired, "Rental period has not expired yet");
        
        endRental(tokenId);
    }
    
    // Get NFT details
    function getNFTDetails(uint256 tokenId) public view returns (NFTDetails memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftDetails[tokenId];
    }
    
    // Get rental info
    function getRentalInfo(uint256 tokenId) public view returns (RentalInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return rentalInfo[tokenId];
    }
    
    // Check if NFT is available for rent
    function isAvailableForRent(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return nftDetails[tokenId].isListedForRent && !nftDetails[tokenId].isCurrentlyRented;
    }
    
    // Check if NFT is available for sale
    function isAvailableForSale(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return nftDetails[tokenId].isListedForSale && !nftDetails[tokenId].isCurrentlyRented;
    }
    
    // Get current renter (returns address(0) if not rented)
    function getCurrentRenter(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        if (nftDetails[tokenId].isCurrentlyRented) {
            return nftDetails[tokenId].currentRenter;
        }
        return address(0);
    }
    
    // Get remaining lock time in seconds
    function getRemainingLockTime(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isLocked, "NFT is not locked");
        
        if (block.timestamp >= nftDetails[tokenId].lockEndTime) {
            return 0;
        }
        return nftDetails[tokenId].lockEndTime - block.timestamp;
    }
    
    // Check if NFT is currently locked
    function isLocked(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        if (!nftDetails[tokenId].isLocked) {
            return false;
        }
        // Check if lock has expired
        return block.timestamp < nftDetails[tokenId].lockEndTime;
    }
    
    // Check if NFT can be delisted (not locked or lock expired)
    function canDelist(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        if (!nftDetails[tokenId].isLocked) {
            return true;
        }
        return block.timestamp >= nftDetails[tokenId].lockEndTime;
    }
    
    function getRemainingRentalTime(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        require(nftDetails[tokenId].isCurrentlyRented, "NFT is not currently rented");
        
        uint256 endTime = nftDetails[tokenId].rentalStartTime + nftDetails[tokenId].rentalDuration;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}