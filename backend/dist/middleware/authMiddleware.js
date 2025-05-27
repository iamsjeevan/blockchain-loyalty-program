"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const privy_1 = __importDefault(require("../config/privy"));
function isWallet(account) {
    return account && account.type === 'wallet' && typeof account.address === 'string';
}
const authenticateUser = async (req, res, next) => {
    if (!privy_1.default) {
        console.error("Privy client is not initialized. Cannot authenticate user.");
        res.status(500).json({ error: 'Authentication service not configured.' });
        return; // Ensure void return after response
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
        return; // Ensure void return after response
    }
    const authToken = authHeader.substring(7);
    try {
        const verifiedClaims = await privy_1.default.verifyAuthToken(authToken);
        const user = await privy_1.default.getUser(verifiedClaims.userId);
        if (!user) {
            console.warn(`User not found for Privy DID: ${verifiedClaims.userId}`);
            res.status(404).json({ error: 'User not found' });
            return; // Ensure void return after response
        }
        let foundWalletData = undefined;
        if (user.wallet &&
            user.wallet.chainType === 'ethereum' &&
            parseInt(String(user.wallet.chainId), 10) === 11155111 &&
            user.wallet.walletClientType === 'privy') {
            const primaryWallet = user.wallet;
            foundWalletData = {
                address: primaryWallet.address,
                chainId: primaryWallet.chainId,
                walletType: primaryWallet.walletClientType,
            };
        }
        else {
            const sepoliaWalletFromAccounts = user.linkedAccounts.find((acc) => isWallet(acc) &&
                acc.chainType === 'ethereum' &&
                parseInt(String(acc.chainId), 10) === 11155111 &&
                acc.walletClientType === 'privy');
            if (sepoliaWalletFromAccounts) {
                foundWalletData = {
                    address: sepoliaWalletFromAccounts.address,
                    chainId: sepoliaWalletFromAccounts.chainId,
                    walletType: sepoliaWalletFromAccounts.walletClientType,
                };
            }
        }
        req.user = {
            privyDid: user.id,
            privyUser: user,
            wallet: foundWalletData,
        };
        if (req.user && !req.user.wallet) {
            console.warn(`User ${req.user.privyDid} does not have a linked Sepolia embedded wallet that was found.`);
        }
        next(); // Call next for successful progression
    }
    catch (error) {
        console.error('Authentication error details:', error);
        let errorMessage = 'Unauthorized: Invalid token or authentication failure.';
        if (error.message) {
            if (error.message.includes('decode') || error.message.includes('signature')) {
                errorMessage = 'Unauthorized: Invalid token format or signature.';
            }
            else if (error.message.includes('expired')) {
                errorMessage = 'Unauthorized: Token has expired.';
            }
        }
        res.status(401).json({ error: errorMessage, details: error.message });
        return; // Ensure void return after response
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=authMiddleware.js.map