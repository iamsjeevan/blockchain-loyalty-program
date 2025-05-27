#!/bin/bash

echo "--------------------------------------------------"
echo "Setting up Backend: Record Redemption Endpoint..."
echo "--------------------------------------------------"

# Ensure we are in the main project directory
# cd /path/to/your/blockchain-loyalty-program

if [ ! -d "backend/src/routes" ]; then
  echo "Error: 'backend/src/routes' directory not found. Please ensure backend is set up."
  exit 1
fi

cd backend

# 1. Update coffeeCoinRoutes.ts (or create a new loyaltyRoutes.ts if preferred)
# For simplicity, we'll add to coffeeCoinRoutes.ts for now.
echo "Updating src/routes/coffeeCoinRoutes.ts to add /record-redemption route..."

# We need to be careful when modifying existing files with bash.
# This approach will append the new route. A more robust method would be to parse and insert,
# or replace the whole file if we are sure of its previous state.
# Given the current state, appending and then adjusting server.ts should work.

# Create a temporary file for the new route
cat <<'EOL_NEW_ROUTE' > new_redemption_route.tmp
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

EOL_NEW_ROUTE

# Append the new route before the 'export default router;' line in coffeeCoinRoutes.ts
# This is a bit fragile; a more robust script would use a tool that can parse and modify JS/TS.
# For now, this common pattern works if 'export default router;' is the last significant line.
awk '/export default router;/ { print prev_line; prev_line="" } { if (prev_line != "") print prev_line; prev_line=$0 } END { if (prev_line != "") print prev_line }' src/routes/coffeeCoinRoutes.ts > tmp_coffeeCoinRoutes.ts
cat new_redemption_route.tmp >> tmp_coffeeCoinRoutes.ts
echo "" >> tmp_coffeeCoinRoutes.ts # Ensure a newline before export
echo "export default router;" >> tmp_coffeeCoinRoutes.ts
mv tmp_coffeeCoinRoutes.ts src/routes/coffeeCoinRoutes.ts
rm new_redemption_route.tmp

echo "src/routes/coffeeCoinRoutes.ts updated with /record-redemption route."
echo ""

# No changes needed to blockchainService.ts for this step, as the burn happens on frontend.
# No changes needed to server.ts if coffeeCoinRoutes are already mounted at /api/coffee-coin.

# Navigate back to project root
cd ..

echo ""
echo "-----------------------------------------------------------"
echo "Backend Record Redemption Endpoint Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Restart your backend server (cd backend && npm run dev)."
echo "   Watch for any errors on startup."
echo ""
echo "2. To test this new endpoint (e.g., using Postman or curl):"
echo "   - Method: POST"
echo "   - URL: http://localhost:3001/api/coffee-coin/record-redemption"
echo "   - Headers: "
echo "     - 'Content-Type: application/json'"
echo "     - 'Authorization: Bearer YOUR_PRIVY_AUTH_TOKEN' (Get this from frontend after logging in)"
echo "   - Body (raw JSON):"
echo "     { "
echo "       \"rewardId\": \"reward1_free_coffee\", "
echo "       \"pointsBurned\": \"25\", "
echo "       \"burnTransactionHash\": \"0x123abc_simulated_burn_hash_def456\" "
echo "     }"
echo ""
echo "   You will need a valid Privy Auth Token from your logged-in frontend user."
echo "   This endpoint currently just logs the data and returns a mock voucher code."
echo ""
echo "3. The NEXT major step will be to implement the actual 'burn' transaction"
echo "   on the FRONTEND using Privy's SDK when a user clicks 'Redeem'."
echo ""
echo "Git:"
echo "Once backend is restarted and you've conceptually tested (or prepared to test), commit:"
echo "  git add ."
echo "  git commit -m \"feat(backend): Add /record-redemption endpoint for post-burn processing\""
echo "  git push origin main"
echo "-----------------------------------------------------------"