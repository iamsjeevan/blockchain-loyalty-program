"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const privy_1 = __importDefault(require("../config/privy"));
// Type guard to check if a linked account is a WalletWithMetadata with necessary properties
function isMatchingSepoliaWallet(account) {
    if (account.type !== 'wallet')
        return false;
    const walletAccount = account; // Temporary cast to access wallet-specific fields
    return (typeof walletAccount.address === 'string' &&
        walletAccount.chainType === 'ethereum' &&
        parseInt(String(walletAccount.chainId), 10) === 11155111 && // Sepolia Chain ID
        walletAccount.walletClientType === 'privy');
}
const authenticateUser = async (req, res, next) => {
    if (!privy_1.default) {
        console.error("Privy client is not initialized. Cannot authenticate user.");
        res.status(500).json({ error: 'Authentication service not configured.' });
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
        return;
    }
    const authToken = authHeader.substring(7);
    try {
        const verifiedClaims = await privy_1.default.verifyAuthToken(authToken);
        const privyUserObject = await privy_1.default.getUser(verifiedClaims.userId); // Renamed to avoid confusion
        if (!privyUserObject) {
            console.warn(`User not found on backend for Privy DID: ${verifiedClaims.userId}`);
            res.status(404).json({ error: 'User not found by backend' });
            return;
        }
        let targetWalletForBackend = undefined;
        // 1. Check the primary `user.wallet` property provided by Privy
        if (privyUserObject.wallet && isMatchingSepoliaWallet(privyUserObject.wallet)) {
            targetWalletForBackend = {
                address: privyUserObject.wallet.address,
                chainId: String(privyUserObject.wallet.chainId), // Standardize to string
                walletType: privyUserObject.wallet.walletClientType,
            };
            console.log("Found matching Sepolia wallet in privyUserObject.wallet:", targetWalletForBackend);
        }
        else {
            // 2. If not found or not matching, check `linkedAccounts`
            const foundInLinked = privyUserObject.linkedAccounts.find(isMatchingSepoliaWallet);
            if (foundInLinked) {
                targetWalletForBackend = {
                    address: foundInLinked.address,
                    chainId: String(foundInLinked.chainId), // Standardize to string
                    walletType: foundInLinked.walletClientType,
                };
                console.log("Found matching Sepolia wallet in privyUserObject.linkedAccounts:", targetWalletForBackend);
            }
        }
        // Populate req.user for downstream route handlers
        req.user = {
            privyDid: privyUserObject.id,
            privyUser: privyUserObject, // Full Privy user object from backend
            wallet: targetWalletForBackend, // This will be undefined if no matching wallet was found
        };
        if (!req.user.wallet) {
            console.warn(`Backend: User ${req.user.privyDid} - No specific Sepolia embedded wallet found to forward to client response.`);
        }
        else {
            console.log(`Backend: Forwarding wallet for ${req.user.privyDid}:`, req.user.wallet);
        }
        next();
    }
    catch (error) {
        console.error('Backend Authentication error:', error.message || error);
        let errorMessage = 'Unauthorized: Invalid token or backend authentication failure.';
        if (error.message) {
            if (error.message.includes('decode') || error.message.includes('signature')) {
                errorMessage = 'Unauthorized: Invalid token format or signature (backend).';
            }
            else if (error.message.includes('expired')) {
                errorMessage = 'Unauthorized: Token has expired (backend).';
            }
        }
        res.status(401).json({ error: errorMessage, details: error.message });
        return;
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=authMiddleware.js.map