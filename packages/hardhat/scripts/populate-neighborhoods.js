const { ethers } = require("hardhat");

async function main() {
  console.log("🏘️  Starting neighborhood population script...");
  
  // Get the deployed contract
  const cleanChainAddress = "0x769f6211a7c7e62caba9f82a1db442da0fe5d3da"; // Your deployed contract address
  const CleanChain = await ethers.getContractFactory("CleanChain");
  const cleanChain = CleanChain.attach(cleanChainAddress);
  
  // Get the owner account (first account from hardhat)
  const [owner] = await ethers.getSigners();
  console.log("📝 Using owner account:", owner.address);
  
  // Check if owner matches contract owner
  const contractOwner = await cleanChain.owner();
  console.log("🔐 Contract owner:", contractOwner);
  
  if (owner.address.toLowerCase() !== contractOwner.toLowerCase()) {
    console.error("❌ Error: Signer is not the contract owner!");
    console.error("   Signer:", owner.address);
    console.error("   Contract Owner:", contractOwner);
    return;
  }
  
  // Test neighborhoods data
  const neighborhoods = [
    {
      name: "Downtown District",
      description: "Central business district with high-rise apartments and commercial buildings. Covers approximately 50 city blocks with mixed residential and commercial waste collection needs.",
      admin: "0x742d35Cc6637C0532c2B8a6E5a4B8E4BF0a8C8A5" // Example admin address
    },
    {
      name: "Green Valley",
      description: "Suburban residential area with single-family homes and tree-lined streets. Family-friendly neighborhood with consistent residential waste patterns and community garden initiatives.",
      admin: "0x8ba1f109551bD432803012645Hac136c33B97154" // Example admin address
    },
    {
      name: "Riverside Community",
      description: "Waterfront neighborhood featuring condominiums and townhouses along the river. Known for environmental consciousness and active community recycling programs.",
      admin: "0x1234567890123456789012345678901234567890" // Example admin address
    },
    {
      name: "Industrial Park",
      description: "Mixed-use area with light industrial facilities, warehouses, and worker housing. Requires specialized waste management for both industrial and residential components.",
      admin: "0x9876543210987654321098765432109876543210" // Example admin address
    },
    {
      name: "University Heights",
      description: "Student housing and academic facilities surrounding the main university campus. High-density population with variable waste patterns during academic seasons.",
      admin: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" // Example admin address
    }
  ];
  
  console.log("\n🌍 Registering neighborhoods...\n");
  
  try {
    // Check if contract is paused
    const isPaused = await cleanChain.isPaused();
    if (isPaused) {
      console.error("❌ Contract is paused! Cannot register neighborhoods.");
      return;
    }
    
    // Get current neighborhoods to avoid duplicates
    const existingNeighborhoods = await cleanChain.getAllNeighborhoods();
    console.log("📋 Existing neighborhoods:", existingNeighborhoods);
    
    let registered = 0;
    
    for (const [index, neighborhood] of neighborhoods.entries()) {
      // Check if neighborhood already exists
      if (existingNeighborhoods.includes(neighborhood.name)) {
        console.log(`⏭️  Skipping "${neighborhood.name}" - already exists`);
        continue;
      }
      
      console.log(`🏘️  Registering: ${neighborhood.name}`);
      console.log(`   📝 Description: ${neighborhood.description.substring(0, 80)}...`);
      console.log(`   👤 Admin: ${neighborhood.admin}`);
      
      try {
        // Register the neighborhood
        const tx = await cleanChain.registerNeighborhood(
          neighborhood.name,
          neighborhood.description,
          neighborhood.admin
        );
        
        console.log(`   ⏳ Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`   ✅ Confirmed in block: ${receipt.blockNumber}`);
        console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        registered++;
        
        // Add a small delay between transactions
        if (index < neighborhoods.length - 1) {
          console.log("   ⏱️  Waiting 2 seconds before next registration...\n");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to register "${neighborhood.name}":`, error.message);
      }
    }
    
    console.log("\n📊 Registration Summary:");
    console.log(`   ✅ Successfully registered: ${registered} neighborhoods`);
    console.log(`   ⏭️  Skipped (already exist): ${neighborhoods.length - registered} neighborhoods`);
    
    // Get final neighborhood list
    const finalNeighborhoods = await cleanChain.getAllNeighborhoods();
    console.log(`   🏘️  Total neighborhoods now: ${finalNeighborhoods.length}`);
    
    console.log("\n🎉 Neighborhood population complete!");
    
    // Display final neighborhoods
    console.log("\n📋 All neighborhoods in the system:");
    finalNeighborhoods.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    
    console.log("\n🚀 Ready for testing! You can now:");
    console.log("   • Visit http://localhost:3000/neighborhoods/view to see all neighborhoods");
    console.log("   • Register households in these neighborhoods");
    console.log("   • Assign cleaners to neighborhoods (as admin)");
    console.log("   • Start testing the full garbage collection workflow");
    
  } catch (error) {
    console.error("\n❌ Script failed:", error);
  }
}

// Handle script errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  }); 