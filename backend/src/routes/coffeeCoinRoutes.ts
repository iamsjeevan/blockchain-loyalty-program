import { Router, Request, Response } from 'express';
import {
  getTokenName,
  getTokenSymbol,
  getTotalSupply,
  getCoffeeCoinBalance,
  mintCoffeeCoins // Import mintCoffeeCoins
} from '../services/blockchainService';
import { authenticateUser } from '../middleware/authMiddleware'; // For protecting the mint route
import { ethers } from 'ethers';
const router = Router();
// --- Public Read Routes ---
router.get('/info', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const name = await getTokenName();
    const symbol = await getTokenSymbol();
    return res.json({ name, symbol });
  } catch (error) {
    console.error('Error in /info route:', error);
    return res.status(500).json({ error: 'Failed to fetch token info' });
  }
});
router.get('/total-supply', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const totalSupply = await getTotalSupply();
    return res.json({ totalSupply: totalSupply.toString() });
  } catch (error) {
    console.error('Error in /total-supply route:', error);
    return res.status(500).json({ error: 'Failed to fetch total supply' });
  }
});
router.get('/balance/:userAddress', async (req: Request, res: Response): Promise<Response | void> => {
  const { userAddress } = req.params;
  if (!ethers.isAddress(userAddress)) {
    return res.status(400).json({ error: 'Invalid user address format.' });
  }
  try {
    const balance = await getCoffeeCoinBalance(userAddress);
    return res.json({ userAddress, balance: balance.toString() });
  } catch (error: any) {
    console.error(`Error in /balance/${userAddress} route:`, error);
    if (error.message && error.message.includes('Invalid user address provided')) { // Match exact error message
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to fetch balance' });
  }
});
/// backend/src/routes/coffeeCoinRoutes.ts
// ...
router.post('/earn-points', authenticateUser, async (req: Request, res: Response): Promise<Response | void> => {
  // Now expect the full req.user object with wallet details from the updated middleware
  // The `req.user` type should be declared globally or imported if it's complex
  const userFromRequest = (req as any).user; // Use 'as any' for simplicity here, or proper typing
  if (!userFromRequest || !userFromRequest.wallet?.address) {
    return res.status(401).json({ error: 'User not authenticated or user wallet address not found by backend.' });
  }
  
  const recipientAddress = userFromRequest.wallet.address;
  const { pointsToEarn } = req.body;
  // ... (rest of your pointsToEarn validation and minting logic) ...
  if (typeof pointsToEarn === 'undefined') { /* ... */ }
  let amountBigInt: bigint;
  try { amountBigInt = BigInt(pointsToEarn); if (amountBigInt <= 0n) { /* ... */ } }
  catch (e) { /* ... */ }
  console.log(`BACKEND: /earn-points for user ${userFromRequest.privyDid}, wallet ${recipientAddress}, amount ${amountBigInt}`);
  try {
    const txHash = await mintCoffeeCoins(recipientAddress, amountBigInt);
    const newBalance = await getCoffeeCoinBalance(recipientAddress);
    return res.status(200).json({ 
      message: `${amountBigInt} CoffeeCoins successfully minted!`, 
      transactionHash: txHash, 
      recipientAddress, 
      newBalance: newBalance.toString() 
    });
  } catch (error: any) {
    console.error('Error in /earn-points (mint) route:', error);
    return res.status(500).json({ error: `Failed to mint CoffeeCoins: ${error.message || 'Unknown server error'}` });
  }
});
// ...
export default router;
// --- Protected Route for Recording a Redemption ---
// This endpoint is called by the frontend AFTER a successful on-chain burn transaction.
router.post('/record-redemption', authenticateUser, async (req: Request, res: Response): Promise<Response | void> => {
  // The 'authenticateUser' middleware ensures req.user exists if token is valid
  const userFromRequest = (req as any).user; // Or use proper typing if req.user is strongly typed globally

  if (!userFromRequest || !userFromRequest.privyDid) {
    return res.status(401).json({ error: 'User not authenticated or Privy DID not found.' });
  }
  
  const { rewardId, pointsBurned, burnTransactionHash } = req.body;

  if (!rewardId || typeof pointsBurned === 'undefined' || !burnTransactionHash) {
    return res.status(400).json({ error: 'Missing rewardId, pointsBurned, or burnTransactionHash in request body.' });
  }

  let pointsBurnedBigInt: bigint;
  try {
    pointsBurnedBigInt = BigInt(pointsBurned);
    if (pointsBurnedBigInt <= 0n) {
      return res.status(400).json({ error: 'Points burned must be positive.' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid pointsBurned format. Must be a number string.' });
  }

  console.log(`Backend: /record-redemption request for user ${userFromRequest.privyDid}`);
  console.log(`  Reward ID: ${rewardId}`);
  console.log(`  Points Burned: ${pointsBurnedBigInt}`);
  console.log(`  Burn Tx Hash: ${burnTransactionHash}`);
  console.log(`  User Wallet (if available from middleware): ${userFromRequest.wallet?.address || 'N/A'}`);

  // TODO: In a real application:
  // 1. Validate the rewardId against available rewards.
  // 2. Verify the burnTransactionHash on the blockchain to confirm the burn actually happened
  //    and was for the correct amount and by this user (or from their wallet). This is crucial for security.
  // 3. Store the redemption details in your database (e.g., which user redeemed what reward, when, txHash).
  // 4. Potentially issue a unique voucher code for the user to claim the reward.
  // 5. Handle any errors during this process.

  // For this demo, we'll just simulate success.
  const voucherCode = `COFFEE-${rewardId.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // After successful redemption, the frontend will likely re-fetch the user's CoffeeCoin balance.
  // We can also return the new balance if we were to fetch it here again.
  // For now, just confirming recording.
  
  return res.status(200).json({ 
    message: `Redemption for '${rewardId}' successfully recorded.`,
    rewardId,
    pointsBurned: pointsBurnedBigInt.toString(),
    burnTransactionHash,
    voucherCode, // Example voucher code
    // newBalance: "TODO" // Could fetch and return new balance
  });
});


export default router;
