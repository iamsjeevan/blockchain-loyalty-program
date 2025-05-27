import { Router, Request, Response, NextFunction } from 'express'; // Added NextFunction
import {
  getTokenName,
  getTokenSymbol,
  getTotalSupply,
  getCoffeeCoinBalance,
} from '../services/blockchainService';
import { ethers } from 'ethers';

const router = Router();

// Define an async handler type for cleaner code
type AsyncRouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>;

const handleInfo: AsyncRouteHandler = async (req, res) => {
  try {
    const name = await getTokenName();
    const symbol = await getTokenSymbol();
    res.json({ name, symbol });
  } catch (error) {
    console.error('Error in /info route:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
};

const handleTotalSupply: AsyncRouteHandler = async (req, res) => {
  try {
    const totalSupply = await getTotalSupply();
    res.json({ totalSupply: totalSupply.toString() });
  } catch (error) {
    console.error('Error in /total-supply route:', error);
    res.status(500).json({ error: 'Failed to fetch total supply' });
  }
};

const handleBalance: AsyncRouteHandler = async (req, res) => {
  const { userAddress } = req.params;
  if (!ethers.isAddress(userAddress)) {
    res.status(400).json({ error: 'Invalid user address format.' });
    return;
  }
  try {
    const balance = await getCoffeeCoinBalance(userAddress);
    res.json({ userAddress, balance: balance.toString() });
  } catch (error: any) {
    console.error(`Error in /balance/${userAddress} route:`, error);
    if (error.message && error.message.includes('Invalid user address provided.')) {
        res.status(400).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
};

// --- Get token info ---
router.get('/info', handleInfo);
router.get('/total-supply', handleTotalSupply);
router.get('/balance/:userAddress', handleBalance);


// --- Example Mint Route (Commented) ---
/*
const handleMint: AsyncRouteHandler = async (req, res) => {
  // ... implementation ...
  // Ensure all paths call res.json or res.status.json and then return
};
router.post('/mint', handleMint);
*/

export default router;