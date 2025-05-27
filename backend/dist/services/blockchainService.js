"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoffeeCoinBalance = exports.getTotalSupply = exports.getTokenSymbol = exports.getTokenName = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const CoffeeCoin_json_1 = __importDefault(require("../config/CoffeeCoin.json")); // Import the ABI
dotenv_1.default.config(); // Load .env variables from backend/.env
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const coffeeCoinContractAddress = process.env.COFFEE_COIN_CONTRACT_ADDRESS;
if (!sepoliaRpcUrl) {
    throw new Error('SEPOLIA_RPC_URL is not defined in .env');
}
if (!coffeeCoinContractAddress) {
    throw new Error('COFFEE_COIN_CONTRACT_ADDRESS is not defined in .env');
}
if (!CoffeeCoin_json_1.default || !CoffeeCoin_json_1.default.abi) {
    throw new Error('CoffeeCoin ABI is not loaded correctly or is missing the .abi property');
}
// Initialize provider (connection to the blockchain)
const provider = new ethers_1.JsonRpcProvider(sepoliaRpcUrl);
// Load the CoffeeCoin contract instance
const coffeeCoinContract = new ethers_1.Contract(coffeeCoinContractAddress, CoffeeCoin_json_1.default.abi, provider);
console.log(`BlockchainService: Connected to RPC at ${sepoliaRpcUrl}`);
console.log(`BlockchainService: CoffeeCoin contract loaded at ${coffeeCoinContractAddress}`);
// --- Read-only functions ---
const getTokenName = async () => {
    try {
        const name = await coffeeCoinContract.name();
        return name;
    }
    catch (error) {
        console.error('Error fetching token name:', error);
        throw error;
    }
};
exports.getTokenName = getTokenName;
const getTokenSymbol = async () => {
    try {
        const symbol = await coffeeCoinContract.symbol();
        return symbol;
    }
    catch (error) {
        console.error('Error fetching token symbol:', error);
        throw error;
    }
};
exports.getTokenSymbol = getTokenSymbol;
const getTotalSupply = async () => {
    try {
        const totalSupply = await coffeeCoinContract.totalSupply();
        // Our contract has 0 decimals, so this is the actual number of tokens
        return totalSupply;
    }
    catch (error) {
        console.error('Error fetching total supply:', error);
        throw error;
    }
};
exports.getTotalSupply = getTotalSupply;
const getCoffeeCoinBalance = async (userAddress) => {
    if (!ethers_1.ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address provided.');
    }
    try {
        const balance = await coffeeCoinContract.balanceOf(userAddress);
        // Our contract has 0 decimals, so this is the actual number of tokens
        return balance;
    }
    catch (error) {
        console.error(`Error fetching CoffeeCoin balance for ${userAddress}:`, error);
        throw error;
    }
};
exports.getCoffeeCoinBalance = getCoffeeCoinBalance;
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
//# sourceMappingURL=blockchainService.js.map