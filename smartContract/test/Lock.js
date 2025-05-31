const { expect } = require("chai");
const hre = require("hardhat");

describe("NFTMarketplace", function () {
    let nftMarketplace;
    let owner, addr1, addr2, addr3;
    let basePrice, rentPrice;
    
    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();
        
        // Define prices using ethers methods
        basePrice = hre.ethers.parseEther("1.0"); // 1 ETH
        rentPrice = hre.ethers.parseEther("0.1"); // 0.1 ETH per day
        
        const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.waitForDeployment();
    });

    describe("NFT Minting", function () {
        it("Should mint NFT with correct details and auto-list for sale", async function () {
            const tokenURI = "https://example.com/token/1";
            
            await expect(nftMarketplace.mintNFT(addr1.address, tokenURI, basePrice))
                .to.emit(nftMarketplace, "NFTMinted")
                .withArgs(0, addr1.address, basePrice, tokenURI)
                .and.to.emit(nftMarketplace, "NFTListed")
                .withArgs(0, basePrice, addr1.address);
            
            // Check NFT details
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.basePrice).to.equal(basePrice);
            expect(details.isListedForSale).to.be.true;
            expect(details.isListedForRent).to.be.false;
            
            // Check ownership and URI
            expect(await nftMarketplace.ownerOf(0)).to.equal(addr1.address);
            expect(await nftMarketplace.tokenURI(0)).to.equal(tokenURI);
        });

        it("Should reject minting with zero base price", async function () {
            await expect(
                nftMarketplace.mintNFT(addr1.address, "uri", 0)
            ).to.be.revertedWith("Base price must be greater than 0");
        });
    });

    describe("Buying NFTs", function () {
        beforeEach(async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
        });

        it("Should allow buying NFT at base price", async function () {
            const initialBalance = await hre.ethers.provider.getBalance(addr1.address);
            
            await expect(
                nftMarketplace.connect(addr2).buyNFT(0, { value: basePrice })
            )
                .to.emit(nftMarketplace, "NFTSold")
                .withArgs(0, addr1.address, addr2.address, basePrice);
            
            // Check ownership transfer
            expect(await nftMarketplace.ownerOf(0)).to.equal(addr2.address);
            
            // Check payment transfer
            const finalBalance = await hre.ethers.provider.getBalance(addr1.address);
            expect(finalBalance - initialBalance).to.equal(basePrice);
            
            // Check NFT is no longer listed
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isListedForSale).to.be.false;
        });

        it("Should accept overpayment without refund", async function () {
            const overpayment = hre.ethers.parseEther("2.0");
            const initialBalance = await hre.ethers.provider.getBalance(addr1.address);
            
            await nftMarketplace.connect(addr2).buyNFT(0, { value: overpayment });
            
            // Seller should receive full overpayment
            const finalBalance = await hre.ethers.provider.getBalance(addr1.address);
            expect(finalBalance - initialBalance).to.equal(overpayment);
        });

        it("Should reject purchase below base price", async function () {
            const lowPrice = hre.ethers.parseEther("0.5");
            await expect(
                nftMarketplace.connect(addr2).buyNFT(0, { value: lowPrice })
            ).to.be.revertedWith("Payment below base price");
        });

        it("Should reject self-purchase", async function () {
            await expect(
                nftMarketplace.connect(addr1).buyNFT(0, { value: basePrice })
            ).to.be.revertedWith("Cannot buy your own NFT");
        });
    });

    describe("Rental System", function () {
        beforeEach(async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
        });

        it("Should list NFT for rent", async function () {
            await expect(
                nftMarketplace.connect(addr1).listForRent(0, rentPrice)
            )
                .to.emit(nftMarketplace, "NFTRentListed")
                .withArgs(0, rentPrice, addr1.address);
            
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isListedForRent).to.be.true;
            expect(details.rentPricePerDay).to.equal(rentPrice);
        });

        it("Should rent NFT for specified duration", async function () {
            const duration = 7; // 7 days
            const totalCost = rentPrice * BigInt(duration);
            
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            
            const initialBalance = await hre.ethers.provider.getBalance(addr1.address);
            
            await expect(
                nftMarketplace.connect(addr2).rentNFT(0, duration, { value: totalCost })
            )
                .to.emit(nftMarketplace, "NFTRented")
                .withArgs(0, addr2.address, addr1.address, duration, totalCost);
            
            // Check rental details
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isCurrentlyRented).to.be.true;
            expect(details.currentRenter).to.equal(addr2.address);
            
            // Check temporary user rights
            expect(await nftMarketplace.temporaryUser(0)).to.equal(addr2.address);
            
            // Check payment transfer
            const finalBalance = await hre.ethers.provider.getBalance(addr1.address);
            expect(finalBalance - initialBalance).to.equal(totalCost);
        });

        it("Should end rental after duration expires", async function () {
            const duration = 1; // 1 day
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await nftMarketplace.connect(addr2).rentNFT(0, duration, { value: rentPrice });
            
            // Fast forward time by more than 1 day
            await hre.ethers.provider.send("evm_increaseTime", [86400 + 1]); // 1 day + 1 second
            await hre.ethers.provider.send("evm_mine");
            
            await expect(
                nftMarketplace.checkAndEndExpiredRental(0)
            )
                .to.emit(nftMarketplace, "NFTRentalEnded")
                .withArgs(0, addr2.address, addr1.address);
            
            // Check rental status reset
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isCurrentlyRented).to.be.false;
            expect(details.currentRenter).to.equal(hre.ethers.ZeroAddress);
            expect(await nftMarketplace.temporaryUser(0)).to.equal(hre.ethers.ZeroAddress);
        });

        it("Should reject rental of own NFT", async function () {
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await expect(
                nftMarketplace.connect(addr1).rentNFT(0, 1, { value: rentPrice })
            ).to.be.revertedWith("Cannot rent your own NFT");
        });

        it("Should reject insufficient payment for rent", async function () {
            const duration = 7;
            const insufficientPayment = rentPrice * BigInt(duration - 1);
            
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await expect(
                nftMarketplace.connect(addr2).rentNFT(0, duration, { value: insufficientPayment })
            ).to.be.revertedWith("Insufficient payment for rent");
        });
    });

    describe("NFT Locking System", function () {
        beforeEach(async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
        });

        it("Should lock NFT for specified duration", async function () {
            const lockDuration = 30; // 30 days
            
            await expect(
                nftMarketplace.connect(addr1).lockNFT(0, lockDuration)
            )
                .to.emit(nftMarketplace, "NFTLocked");
            
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isLocked).to.be.true;
            expect(await nftMarketplace.isLocked(0)).to.be.true;
            
            // Should auto-list for sale when locked
            expect(details.isListedForSale).to.be.true;
        });

        it("Should prevent delisting locked NFT", async function () {
            await nftMarketplace.connect(addr1).lockNFT(0, 30);
            
            await expect(
                nftMarketplace.connect(addr1).delistFromSale(0)
            ).to.be.revertedWith("Cannot delist locked NFT");
        });

        it("Should unlock NFT after lock period expires", async function () {
            const lockDuration = 1; // 1 day
            await nftMarketplace.connect(addr1).lockNFT(0, lockDuration);
            
            // Fast forward time
            await hre.ethers.provider.send("evm_increaseTime", [86400 + 1]);
            await hre.ethers.provider.send("evm_mine");
            
            await expect(
                nftMarketplace.connect(addr1).unlockNFT(0)
            )
                .to.emit(nftMarketplace, "NFTUnlocked")
                .withArgs(0, addr1.address);
            
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isLocked).to.be.false;
            expect(await nftMarketplace.isLocked(0)).to.be.false;
        });

        it("Should prevent unlocking before lock period expires", async function () {
            await nftMarketplace.connect(addr1).lockNFT(0, 30);
            
            await expect(
                nftMarketplace.connect(addr1).unlockNFT(0)
            ).to.be.revertedWith("Lock period has not expired");
        });
    });

    describe("Listing and Delisting", function () {
        beforeEach(async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
        });

        it("Should allow owner to delist from sale", async function () {
            await expect(
                nftMarketplace.connect(addr1).delistFromSale(0)
            )
                .to.emit(nftMarketplace, "NFTDelisted")
                .withArgs(0, addr1.address);
            
            const details = await nftMarketplace.getNFTDetails(0);
            expect(details.isListedForSale).to.be.false;
        });

        it("Should allow owner to relist for sale", async function () {
            await nftMarketplace.connect(addr1).delistFromSale(0);
            
            await expect(
                nftMarketplace.connect(addr1).listForSale(0)
            )
                .to.emit(nftMarketplace, "NFTListed")
                .withArgs(0, basePrice, addr1.address);
        });

        it("Should prevent non-owner from listing/delisting", async function () {
            await expect(
                nftMarketplace.connect(addr2).delistFromSale(0)
            ).to.be.revertedWith("Only owner can delist");
            
            await expect(
                nftMarketplace.connect(addr2).listForSale(0)
            ).to.be.revertedWith("Only owner can list for sale");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
        });

        it("Should return correct availability status", async function () {
            expect(await nftMarketplace.isAvailableForSale(0)).to.be.true;
            expect(await nftMarketplace.isAvailableForRent(0)).to.be.false;
            
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            expect(await nftMarketplace.isAvailableForRent(0)).to.be.true;
        });

        it("Should return correct renter information", async function () {
            expect(await nftMarketplace.getCurrentRenter(0)).to.equal(hre.ethers.ZeroAddress);
            
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await nftMarketplace.connect(addr2).rentNFT(0, 1, { value: rentPrice });
            
            expect(await nftMarketplace.getCurrentRenter(0)).to.equal(addr2.address);
        });

        it("Should return correct remaining times", async function () {
            // Test lock time
            await nftMarketplace.connect(addr1).lockNFT(0, 1);
            const lockTime = await nftMarketplace.getRemainingLockTime(0);
            expect(lockTime).to.be.greaterThan(0);
            
            // Test rental time
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await nftMarketplace.connect(addr2).rentNFT(0, 1, { value: rentPrice });
            const rentalTime = await nftMarketplace.getRemainingRentalTime(0);
            expect(rentalTime).to.be.greaterThan(0);
        });
    });

    describe("Error Cases", function () {
        it("Should reject operations on non-existent tokens", async function () {
            await expect(
                nftMarketplace.getNFTDetails(999)
            ).to.be.revertedWith("Token does not exist");
            
            await expect(
                nftMarketplace.buyNFT(999, { value: basePrice })
            ).to.be.revertedWith("Token does not exist");
        });

        it("Should prevent buying rented NFT", async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await nftMarketplace.connect(addr2).rentNFT(0, 1, { value: rentPrice });
            
            await expect(
                nftMarketplace.connect(addr3).buyNFT(0, { value: basePrice })
            ).to.be.revertedWith("Cannot buy rented NFT");
        });

        it("Should prevent listing rented NFT for sale", async function () {
            await nftMarketplace.mintNFT(addr1.address, "uri1", basePrice);
            await nftMarketplace.connect(addr1).delistFromSale(0);
            await nftMarketplace.connect(addr1).listForRent(0, rentPrice);
            await nftMarketplace.connect(addr2).rentNFT(0, 1, { value: rentPrice });
            
            await expect(
                nftMarketplace.connect(addr1).listForSale(0)
            ).to.be.revertedWith("Cannot list rented NFT for sale");
        });
    });
});