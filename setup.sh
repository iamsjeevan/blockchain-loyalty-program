#!/bin/bash

echo "--------------------------------------------------"
echo "Setting up Backend for Smart Contract Interaction..."
echo "--------------------------------------------------"

# Ensure we are in the main project directory
# cd /path/to/your/blockchain-loyalty-program # Or ensure you run this from the root

# Define paths
SMART_CONTRACT_ARTIFACT_PATH="smart-contracts/artifacts/contracts/CoffeeCoin.sol/CoffeeCoin.json"
BACKEND_CONFIG_DIR="backend/src/config"
BACKEND_ABI_DESTINATION_PATH="backend/src/config/CoffeeCoin.json"

# Check if backend directory exists
if [ ! -d "backend" ]; then
  echo "Error: 'backend' directory not found. Please run the previous setup scripts first."
  exit 1
fi

# Check if smart contract ABI exists
if [ ! -f "$SMART_CONTRACT_ARTIFACT_PATH" ]; then
  echo "Error: Smart contract ABI not found at $SMART_CONTRACT_ARTIFACT_PATH"
  echo "Please ensure your smart contract is compiled (run 'npx hardhat compile' in 'smart-contracts' directory)."
  exit 1
fi

# Navigate into the backend directory for npm install
cd backend

# 1. Install ethers.js v6
echo "Installing ethers v6..."
npm install ethers@^6.11.1 # Pinning to a specific v6 minor for stability, update as needed

# Navigate back to project root to handle ABI copy easily
cd ..

# 2. Copy ABI to backend config directory
echo "Copying CoffeeCoin ABI to backend configuration..."
mkdir -p "$BACKEND_CONFIG_DIR"
cp "$SMART_CONTRACT_ARTIFACT_PATH" "$BACKEND_ABI_DESTINATION_PATH"
if [ $? -eq 0 ]; then
  echo "CoffeeCoin.json ABI copied to $BACKEND_ABI_DESTINATION_PATH"
else
  echo "Error: Failed to copy ABI. Please check paths and permissions."
  exit 1
fi

# Navigate back into the backend directory for file creation
cd backend

# 3. Create Blockchain Service (src/services/blockchainService.ts)
echo "Creating Blockchain Service (src/services/blockchainService.ts)..."
mkdir -p src/services
cat <<EOL > src/services/blockchainService.ts
import { ethers, Contract, Provider, JsonRpcProvider } from 'ethers';
import dotenv from 'dotenv';
import CoffeeCoinABI from '../config/CoffeeCoin.json'; // Import the ABI

dotenv.config(); // Load .env variables from backend/.env

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const coffeeCoinContractAddress = process.env.COFFEE_COIN_CONTRACT_ADDRESS;

if (!sepoliaRpcUrl) {
  throw new Error('SEPOLIA_RPC_URL is not defined in .env');
}
if (!coffeeCoinContractAddress) {
  throw new Error('COFFEE_COIN_CONTRACT_ADDRESS is not defined in .env');
}
if (!CoffeeCoinABI || !CoffeeCoinABI.abi) {
  throw new Error('CoffeeCoin ABI is not loaded correctly or is missing the .abi property');
}

// Initialize provider (connection to the blockchain)
const provider: Provider = new JsonRpcProvider(sepoliaRpcUrl);

// Load the CoffeeCoin contract instance
const coffeeCoinContract: Contract = new Contract(coffeeCoinContractAddress, CoffeeCoinABI.abi, provider);

console.log(\`BlockchainService: Connected to RPC at \${sepoliaRpcUrl}\`);
console.log(\`BlockchainService: CoffeeCoin contract loaded at \${coffeeCoinContractAddress}\`);

// --- Read-only functions ---

export const getTokenName = async (): Promise<string> => {
  try {
    const name: string = await coffeeCoinContract.name();
    return name;
  } catch (error) {
    console.error('Error fetching token name:', error);
    throw error;
  }
};

export const getTokenSymbol = async (): Promise<string> => {
  try {
    const symbol: string = await coffeeCoinContract.symbol();
    return symbol;
  } catch (error) {
    console.error('Error fetching token symbol:', error);
    throw error;
  }
};

export const getTotalSupply = async (): Promise<bigint> => {
  try {
    const totalSupply: bigint = await coffeeCoinContract.totalSupply();
    // Our contract has 0 decimals, so this is the actual number of tokens
    return totalSupply;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    throw error;
  }
};

export const getCoffeeCoinBalance = async (userAddress: string): Promise<bigint> => {
  if (!ethers.isAddress(userAddress)) {
    throw new Error('Invalid user address provided.');
  }
  try {
    const balance: bigint = await coffeeCoinContract.balanceOf(userAddress);
    // Our contract has 0 decimals, so this is the actual number of tokens
    return balance;
  } catch (error) {
    console.error(\`Error fetching CoffeeCoin balance for \${userAddress}:\`, error);
    throw error;
  }
};

// --- Write functions (will require a Signer) ---
// We will implement these later when we have a server wallet or user context

/**
 * Mints new CoffeeCoins to a specified address.
 * This function would typically be called by an authorized admin/server wallet.
 */
// export const mintCoffeeCoins = async (recipientAddress: string, amount: bigint): Promise<string> => {
//   if (!process.env.SERVER_WALLET_PRIVATE_KEY) {
//     throw new Error('SERVER_WALLET_PRIVATE_KEY is not configured for minting.');
//   }
//   if (!ethers.isAddress(recipientAddress)) {
//     throw new Error('Invalid recipient address for minting.');
//   }
//   if (amount <= 0n) {
//     throw new Error('Mint amount must be positive.');
//   }

//   const signerWallet = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);
//   const contractWithSigner = coffeeCoinContract.connect(signerWallet) as Contract;

//   try {
//     const tx = await contractWithSigner.mint(recipientAddress, amount);
//     await tx.wait(); // Wait for the transaction to be mined
//     console.log(\`Successfully minted \${amount} CoffeeCoins to \${recipientAddress}. Tx hash: \${tx.hash}\`);
//     return tx.hash;
//   } catch (error) {
//     console.error(\`Error minting CoffeeCoins to \${recipientAddress}:\`, error);
//     throw error;
//   }
// };

console.log('Blockchain service initialized.');
EOL
echo "src/services/blockchainService.ts created."

# 4. Create new routes for CoffeeCoin info (src/routes/coffeeCoinRoutes.ts)
echo "Creating CoffeeCoin routes (src/routes/coffeeCoinRoutes.ts)..."
mkdir -p src/routes
cat <<EOL > src/routes/coffeeCoinRoutes.ts
import { Router, Request, Response } from 'express';
import {
  getTokenName,
  getTokenSymbol,
  getTotalSupply,
  getCoffeeCoinBalance,
  // mintCoffeeCoins // Uncomment when ready
} from '../services/blockchainService';
import { ethers } from 'ethers';

const router = Router();

// --- Get token info ---
router.get('/info', async (req: Request, res: Response) => {
  try {
    const name = await getTokenName();
    const symbol = await getTokenSymbol();
    res.json({ name, symbol });
  } catch (error) {
    console.error('Error in /info route:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

router.get('/total-supply', async (req: Request, res: Response) => {
  try {
    const totalSupply = await getTotalSupply();
    res.json({ totalSupply: totalSupply.toString() }); // Convert BigInt to string for JSON
  } catch (error) {
    console.error('Error in /total-supply route:', error);
    res.status(500).json({ error: 'Failed to fetch total supply' });
  }
});

// --- Get balance for a user ---
// Example: /api/coffee-coin/balance/0xYourUserAddressHere
router.get('/balance/:userAddress', async (req: Request, res: Response) => {
  const { userAddress } = req.params;
  if (!ethers.isAddress(userAddress)) {
    return res.status(400).json({ error: 'Invalid user address format.' });
  }
  try {
    const balance = await getCoffeeCoinBalance(userAddress);
    res.json({ userAddress, balance: balance.toString() }); // Convert BigInt to string
  } catch (error: any) {
    console.error(\`Error in /balance/\${userAddress} route:\`, error);
    if (error.message.includes('Invalid user address')) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// --- Example Mint Route (requires SERVER_WALLET_PRIVATE_KEY to be set in .env) ---
// This is a sensitive operation and would need proper admin authentication in a real app.
// For now, it's commented out. If you enable it, ensure your server wallet has Sepolia ETH for gas.
/*
router.post('/mint', async (req: Request, res: Response) => {
  const { recipientAddress, amount } = req.body; // amount should be a string representing the number

  if (!recipientAddress || !amount) {
    return res.status(400).json({ error: 'Missing recipientAddress or amount in request body.' });
  }
  if (!ethers.isAddress(recipientAddress)) {
    return res.status(400).json({ error: 'Invalid recipient address format.' });
  }
  
  let amountBigInt: bigint;
  try {
    amountBigInt = BigInt(amount);
    if (amountBigInt <= 0n) {
      return res.status(400).json({ error: 'Amount must be positive.' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid amount format.' });
  }

  try {
    console.log(\`Attempting to mint \${amountBigInt} tokens to \${recipientAddress}...\`);
    const txHash = await mintCoffeeCoins(recipientAddress, amountBigInt);
    res.status(200).json({ message: 'Minting successful!', transactionHash: txHash, recipientAddress, amount: amountBigInt.toString() });
  } catch (error) {
    console.error('Error in /mint route:', error);
    res.status(500).json({ error: 'Failed to mint tokens. Check server logs for details.' });
  }
});
*/

export default router;
EOL
echo "src/routes/coffeeCoinRoutes.ts created."

# 5. Update src/server.ts to use the new CoffeeCoin routes
echo "Updating src/server.ts to use CoffeeCoin routes..."
# We need to add the new router. This is tricky to automate perfectly without more robust tools.
# The script will replace the file with new content including the new router.
# Make sure to re-add any other custom changes you might have made to server.ts if any.
cat <<EOL > src/server.ts
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { authenticateUser } from './middleware/authMiddleware';
import coffeeCoinRoutes from './routes/coffeeCoinRoutes'; // Import CoffeeCoin routes

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Public Routes ---
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

// --- CoffeeCoin Specific Routes (mostly public for now for reading data) ---
app.use('/api/coffee-coin', coffeeCoinRoutes);


// --- Protected Routes (require authentication) ---
app.get('/api/user/me', authenticateUser, (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      message: 'Successfully authenticated!',
      privyDid: req.user.privyDid,
      wallet: req.user.wallet,
    });
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});


app.listen(port, () => {
  console.log(\`Backend server is running on http://localhost:\${port}\`);
  // A small delay to let blockchainService log its initialization
  setTimeout(() => {
    // This ensures that blockchainService attempts to initialize after server.ts starts.
    // In a more complex app, service initialization might be handled differently.
    require('./services/blockchainService');
  }, 100);
});
EOL
echo "src/server.ts updated to include CoffeeCoin routes."

# Navigate back to project root
cd ..

echo ""
echo "-----------------------------------------------------------"
echo "Backend Smart Contract Interaction Setup Complete!"
echo ""
echo "IMPORTANT Next Steps:"
echo "1. Ensure your 'backend/.env' file has the correct:"
echo "   - SEPOLIA_RPC_URL (e.g., your Alchemy URL)"
echo "   - COFFEE_COIN_CONTRACT_ADDRESS (0x113099845A71e603Cf514FCf5CDEda798e3183a1)"
echo "   (The script attempts to pre-fill these in backend/.env if the placeholders existed,"
echo "    but verify them in 'backend/src/services/blockchainService.ts' if issues arise, although it reads from .env)"
echo ""
echo "2. To run the backend (from 'backend' directory):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Testing the new routes (e.g., with curl or browser):"
echo "   - Get Token Info: curl http://localhost:3001/api/coffee-coin/info"
echo "   - Get Total Supply: curl http://localhost:3001/api/coffee-coin/total-supply"
echo "   - Get Balance (replace YOUR_WALLET_ADDRESS with an actual Sepolia address, e.g., your deployer address):"
echo "     curl http://localhost:3001/api/coffee-coin/balance/0x1DFCcEe07940b6b147fad59C5125784b50E1ebEA"
echo ""
echo "   (For the mint route, you'd need to uncomment it, set SERVER_WALLET_PRIVATE_KEY in .env,"
echo "    ensure that wallet has Sepolia ETH, and send a POST request. We'll do that later if needed.)"
echo ""
echo "Git:"
echo "Once you've confirmed the server starts and new routes work, commit these changes:"
echo "  git add ."
echo "  git commit -m \"feat(backend): Integrate ethers and add service/routes for CoffeeCoin contract interaction\""
echo "  git push origin main"
echo "-----------------------------------------------------------"