"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const privy_1 = __importDefault(require("../config/privy")); // Import our initialized client
// Type guard to check if a linked account is a WalletWithMetadata
function isWallet(account) {
    return account && account.type === 'wallet' && typeof account.address === 'string';
}
const authenticateUser = async (req, res, next) => {
    if (!privy_1.default) {
        console.error("Privy client is not initialized. Cannot authenticate user.");
        return res.status(500).json({ error: 'Authentication service not configured.' });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }
    const authToken = authHeader.substring(7); // Remove "Bearer " prefix
    try {
        const verifiedClaims = await privy_1.default.verifyAuthToken(authToken);
        const user = await privy_1.default.getUser(verifiedClaims.userId);
        if (!user) {
            console.warn(`User not found for Privy DID: ${verifiedClaims.userId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        // Find the embedded wallet for Sepolia (chain ID 11155111)
        // The `wallet` property on the User object is often the primary embedded wallet.
        let foundWallet = undefined;
        if (user.wallet && user.wallet.chainType === 'ethereum' && parseInt(String(user.wallet.chainId), 10) === 11155111 && user.wallet.walletClientType === 'privy') {
            foundWallet = user.wallet; // Cast if confident it's a full WalletWithMetadata
        }
        else {
            // Fallback: iterate through linkedAccounts if primary wallet isn't the one or not set as expected
            const sepoliaWalletFromAccounts = user.linkedAccounts.find((acc) => // Use type predicate
             isWallet(acc) &&
                acc.chainType === 'ethereum' &&
                parseInt(String(acc.chainId), 10) === 11155111 &&
                acc.walletClientType === 'privy'); // Ensure the result is typed correctly
            if (sepoliaWalletFromAccounts) {
                foundWallet = sepoliaWalletFromAccounts;
            }
        }
        req.user = {
            privyDid: user.id, // user.id is the Privy DID
            privyUser: user, // Store the full user object for flexibility
            wallet: foundWallet ? {
                address: foundWallet.address,
                chainId: foundWallet.chainId,
                walletType: foundWallet.walletClientType,
            } : undefined
        };
        if (!req.user.wallet) {
            console.warn(`User ${req.user.privyDid} does not have a linked Sepolia embedded wallet that was found.`);
            // Depending on your app's logic, you might deny access or handle this case
            // For now, we'll let it proceed but the wallet info will be undefined.
        }
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        console.error('Authentication error:', error.message || error);
        if (error.message && error.message.includes('decode')) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token format or signature.' });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token or authentication failure.' });
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=authMiddleware.js.map