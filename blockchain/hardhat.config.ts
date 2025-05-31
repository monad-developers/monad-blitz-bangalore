import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
import "hardhat-sourcify";

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY is missing in .env file");
}

// Extend the HardhatUserConfig interface to include sourcify
interface ExtendedHardhatUserConfig extends HardhatUserConfig {
  sourcify?: {
    enabled: boolean;
    apiUrl: string;
    browserUrl: string;
  };
}

const config: ExtendedHardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none",
        useLiteralContent: true,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;