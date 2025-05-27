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
    console.error(`Error in /balance/${userAddress} route:`, error);
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
    console.log(`Attempting to mint ${amountBigInt} tokens to ${recipientAddress}...`);
    const txHash = await mintCoffeeCoins(recipientAddress, amountBigInt);
    res.status(200).json({ message: 'Minting successful!', transactionHash: txHash, recipientAddress, amount: amountBigInt.toString() });
  } catch (error) {
    console.error('Error in /mint route:', error);
    res.status(500).json({ error: 'Failed to mint tokens. Check server logs for details.' });
  }
});
*/

export default router;
