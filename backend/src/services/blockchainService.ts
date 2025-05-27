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

console.log(`BlockchainService: Connected to RPC at ${sepoliaRpcUrl}`);
console.log(`BlockchainService: CoffeeCoin contract loaded at ${coffeeCoinContractAddress}`);

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
    console.error(`Error fetching CoffeeCoin balance for ${userAddress}:`, error);
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
//     console.log(`Successfully minted ${amount} CoffeeCoins to ${recipientAddress}. Tx hash: ${tx.hash}`);
//     return tx.hash;
//   } catch (error) {
//     console.error(`Error minting CoffeeCoins to ${recipientAddress}:`, error);
//     throw error;
//   }
// };

console.log('Blockchain service initialized.');
