import { ethers, Contract, Provider, JsonRpcProvider, Wallet, TransactionResponse, TransactionReceipt } from 'ethers';
import dotenv from 'dotenv';
import CoffeeCoinABI from '../config/CoffeeCoin.json'; // Import the ABI

dotenv.config(); 

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const coffeeCoinContractAddress = process.env.COFFEE_COIN_CONTRACT_ADDRESS;
const serverWalletPrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY; // For minting

if (!sepoliaRpcUrl) {
  throw new Error('SEPOLIA_RPC_URL is not defined in .env');
}
if (!coffeeCoinContractAddress) {
  throw new Error('COFFEE_COIN_CONTRACT_ADDRESS is not defined in .env');
}
if (!CoffeeCoinABI || !CoffeeCoinABI.abi) {
  throw new Error('CoffeeCoin ABI is not loaded correctly or is missing the .abi property');
}

const provider: Provider = new JsonRpcProvider(sepoliaRpcUrl);
const coffeeCoinContract: Contract = new Contract(coffeeCoinContractAddress, CoffeeCoinABI.abi, provider);

// console.log(`BlockchainService: Connected to RPC at ${sepoliaRpcUrl}`);
// console.log(`BlockchainService: CoffeeCoin contract loaded at ${coffeeCoinContractAddress}`);

// --- Read-only functions ---
export const getTokenName = async (): Promise<string> => {
  try {
    return await coffeeCoinContract.name();
  } catch (error) { console.error('Error fetching token name:', error); throw error; }
};

export const getTokenSymbol = async (): Promise<string> => {
  try {
    return await coffeeCoinContract.symbol();
  } catch (error) { console.error('Error fetching token symbol:', error); throw error; }
};

export const getTotalSupply = async (): Promise<bigint> => {
  try {
    return await coffeeCoinContract.totalSupply();
  } catch (error) { console.error('Error fetching total supply:', error); throw error; }
};

export const getCoffeeCoinBalance = async (userAddress: string): Promise<bigint> => {
  if (!ethers.isAddress(userAddress)) {
    throw new Error('Invalid user address provided for balance check.');
  }
  try {
    return await coffeeCoinContract.balanceOf(userAddress);
  } catch (error) { console.error(`Error fetching CoffeeCoin balance for ${userAddress}:`, error); throw error; }
};

// --- Write functions (require a Signer) ---

/**
 * Mints new CoffeeCoins to a specified address.
 * This function is called by the backend using the SERVER_WALLET_PRIVATE_KEY.
 * The account associated with SERVER_WALLET_PRIVATE_KEY must be the owner of the CoffeeCoin contract
 * or have a minter role (for Option 1, it's the owner).
 */
export const mintCoffeeCoins = async (recipientAddress: string, amountInWholeTokens: bigint): Promise<string> => {
  if (!serverWalletPrivateKey) {
    console.error('SERVER_WALLET_PRIVATE_KEY is not configured for minting.');
    throw new Error('Minting service not configured: Missing server wallet private key.');
  }
  if (!ethers.isAddress(recipientAddress)) {
    throw new Error('Invalid recipient address for minting.');
  }
  if (amountInWholeTokens <= 0n) { // Our token has 0 decimals, so amount is whole tokens
    throw new Error('Mint amount must be positive.');
  }

  const signerWallet: Wallet = new Wallet(serverWalletPrivateKey, provider);
  const contractWithSigner: Contract = coffeeCoinContract.connect(signerWallet) as Contract;

  console.log(`Attempting to mint ${amountInWholeTokens} CoffeeCoins to ${recipientAddress} using wallet ${signerWallet.address}...`);

  try {
    // The 'amount' parameter for an ERC20 mint function typically expects the amount in the smallest unit (atomic units).
    // Since our CoffeeCoin has 0 decimals, amountInWholeTokens IS the amount in smallest units.
    const tx: TransactionResponse = await contractWithSigner.mint(recipientAddress, amountInWholeTokens);
    console.log(`Minting transaction sent. Hash: ${tx.hash}. Waiting for confirmation...`);
    
    const receipt: TransactionReceipt | null = await tx.wait(1); // Wait for 1 confirmation
    
    if (receipt && receipt.status === 1) {
      console.log(`Successfully minted ${amountInWholeTokens} CoffeeCoins to ${recipientAddress}. Tx confirmed: ${tx.hash}`);
      return tx.hash;
    } else {
      console.error(`Minting transaction failed or was reverted. Tx hash: ${tx.hash}`, receipt);
      throw new Error(`Minting transaction failed. Status: ${receipt?.status}. Tx hash: ${tx.hash}`);
    }
  } catch (error: any) {
    console.error(`Error during minting CoffeeCoins to ${recipientAddress}:`, error);
    // More detailed error logging
    if (error.reason) console.error("Reason:", error.reason);
    if (error.code) console.error("Code:", error.code);
    if (error.transaction) console.error("Transaction:", error.transaction);
    if (error.receipt) console.error("Receipt:", error.receipt);
    throw new Error(`Failed to mint tokens: ${error.reason || error.message || 'Unknown error'}`);
  }
};

// console.log('Blockchain service initialized with minting capability.');
