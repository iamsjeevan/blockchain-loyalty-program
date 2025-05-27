#!/bin/bash

echo "--------------------------------------------------"
echo "Updating Hardhat Project for Sepolia Testnet..."
echo "--------------------------------------------------"

# 1. Update hardhat.config.ts for Sepolia
echo "Updating hardhat.config.ts for Sepolia..."
cat <<EOL > hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"; // Includes ethers, waffle, etc.
import "dotenv/config"; // To load .env variables

// Load environment variables
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (!PRIVATE_KEY) {
  console.warn("WARNING: PRIVATE_KEY is not set in .env file. Deployments to live networks will fail.");
}
if (!SEPOLIA_RPC_URL) {
  console.warn("WARNING: SEPOLIA_RPC_URL is not set in .env file. Connection to Sepolia will fail.");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24", // Ensure this matches or is compatible with your contract's pragma
  networks: {
    hardhat: { // Default local network for quick tests
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://rpc.sepolia.org", // Fallback public RPC, but .env is better
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111, // Chain ID for Sepolia
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY || ""
  },
  gasReporter: { // Optional: for tracking gas usage during tests
    enabled: process.env.REPORT_GAS === "true", // Enable by setting REPORT_GAS=true in .env
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY, // Optional: for USD conversion
    // token: "ETH", // Can specify MATIC for Polygon, ETH for Ethereum
  },
};

export default config;
EOL
echo "hardhat.config.ts updated for Sepolia."
echo ""

# The CoffeeCoin.sol contract and deployCoffeeCoin.ts script generally do not need changes
# for switching between EVM-compatible testnets like Amoy and Sepolia,
# as long as the constructor arguments and core logic are network-agnostic.

echo "--------------------------------------------------"
echo "Sepolia Update Complete!"
echo ""
echo "Next Steps (Manual):"
echo "1. IMPORTANT: Update your '.env' file in the 'smart-contracts' directory."
echo "   It should now contain:"
echo "   PRIVATE_KEY=your_actual_private_key_here"
echo "   SEPOLIA_RPC_URL=your_sepolia_rpc_url_from_infura_alchemy_or_public_one"
echo "   ETHERSCAN_API_KEY=your_etherscan_api_key_if_you_have_one"
echo ""
echo "   Example SEPOLIA_RPC_URL (public, might be rate-limited, prefer using Infura/Alchemy):"
echo "   SEPOLIA_RPC_URL=https://rpc.sepolia.org"
echo "   Or from Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY"
echo "   Or from Infura: https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
echo ""
echo "2. Ensure your deployer account (from PRIVATE_KEY) has Sepolia ETH for gas."
echo "   Use your known free Sepolia faucet."
echo ""
echo "3. Compile the contract (if you haven't or made changes):"
echo "   npx hardhat compile"
echo ""
echo "4. To deploy to Sepolia Testnet (after setting up .env and hardhat.config.ts):"
echo "   npx hardhat run scripts/deployCoffeeCoin.ts --network sepolia"
echo ""
echo "5. To verify your contract on Etherscan (Sepolia) after deployment:"
echo "   npx hardhat verify --network sepolia YOUR_DEPLOYED_CONTRACT_ADDRESS_ON_SEPOLIA \"YOUR_DEPLOYER_ADDRESS_USED_FOR_CONSTRUCTOR_ARG\""
echo "   (Replace placeholders with your actual deployed contract address and the deployer address)"
echo "--------------------------------------------------"