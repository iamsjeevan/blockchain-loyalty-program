"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Added NextFunction
const blockchainService_1 = require("../services/blockchainService");
const ethers_1 = require("ethers");
const router = (0, express_1.Router)();
const handleInfo = async (req, res) => {
    try {
        const name = await (0, blockchainService_1.getTokenName)();
        const symbol = await (0, blockchainService_1.getTokenSymbol)();
        res.json({ name, symbol });
    }
    catch (error) {
        console.error('Error in /info route:', error);
        res.status(500).json({ error: 'Failed to fetch token info' });
    }
};
const handleTotalSupply = async (req, res) => {
    try {
        const totalSupply = await (0, blockchainService_1.getTotalSupply)();
        res.json({ totalSupply: totalSupply.toString() });
    }
    catch (error) {
        console.error('Error in /total-supply route:', error);
        res.status(500).json({ error: 'Failed to fetch total supply' });
    }
};
const handleBalance = async (req, res) => {
    const { userAddress } = req.params;
    if (!ethers_1.ethers.isAddress(userAddress)) {
        res.status(400).json({ error: 'Invalid user address format.' });
        return;
    }
    try {
        const balance = await (0, blockchainService_1.getCoffeeCoinBalance)(userAddress);
        res.json({ userAddress, balance: balance.toString() });
    }
    catch (error) {
        console.error(`Error in /balance/${userAddress} route:`, error);
        if (error.message && error.message.includes('Invalid user address provided.')) {
            res.status(400).json({ error: error.message });
        }
        else {
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
exports.default = router;
//# sourceMappingURL=coffeeCoinRoutes.js.map