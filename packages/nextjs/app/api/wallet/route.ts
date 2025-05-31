import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

// Define the path for the wallet mapping file
const WALLET_MAPPING_FILE = path.join(
  process.cwd(),
  "data",
  "wallet-mapping.json"
);

// Initialize the data directory and mapping file
function initializeWalletStorage() {
  const dataDir = path.join(process.cwd(), "data");

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  // Create mapping file if it doesn't exist
  if (!fs.existsSync(WALLET_MAPPING_FILE)) {
    fs.writeFileSync(WALLET_MAPPING_FILE, JSON.stringify({}));
  }
}

export async function GET(request: Request) {
  try {
    console.log("GET request received");
    // Get email from URL parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    console.log("Email:", email);
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // // Initialize storage
    initializeWalletStorage();
    console.log("wallet storage initialized");
    // // Get the user's session
    // const session = await getServerSession(authOptions);

    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { success: false, error: "Not authenticated" },
    //     { status: 401 }
    //   );
    // }

    // Read the current wallet mapping
    const mappingContent = fs.readFileSync(WALLET_MAPPING_FILE, "utf-8");
    const walletMapping = JSON.parse(mappingContent);

    // Check if user already has a wallet
    if (walletMapping[email]) {
      return NextResponse.json({
        success: true,
        data: walletMapping[email],
      });
    }

    // If no wallet exists for this email, create a new one
    try {
      const wallet = await createCoinbaseWallet();

      // Save the new wallet mapping
      walletMapping[email] = {
        walletAddress: wallet.address,
        createdAt: new Date().toISOString(),
      };

      // Write updated mapping back to file
      fs.writeFileSync(
        WALLET_MAPPING_FILE,
        JSON.stringify(walletMapping, null, 2)
      );

      return NextResponse.json({
        success: true,
        data: walletMapping[email],
      });
    } catch (error) {
      console.error("Failed to create wallet:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create wallet" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Wallet operation failed:", error);
    return NextResponse.json(
      { success: false, error: "Wallet operation failed" },
      { status: 500 }
    );
  }
}

// Helper function to create a Coinbase wallet
async function createCoinbaseWallet() {
  // Configure Coinbase SDK
  Coinbase.configureFromJson({
    filePath: "C:\\Users\\asus\\Downloads\\cdp_api_key.json",
  });

  // Create new wallet
  const wallet = await Wallet.create({
    networkId: Coinbase.networks.BaseSepolia,
  });

  // Get default address
  const address = await wallet.getDefaultAddress();

  return {
    wallet: wallet.toString(),
    address: address.toString(),
  };
}
