"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const coffeeCoinRoutes_1 = __importDefault(require("./routes/coffeeCoinRoutes")); // Import CoffeeCoin routes
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// --- Public Routes ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});
// --- CoffeeCoin Specific Routes (mostly public for now for reading data) ---
app.use('/api/coffee-coin', coffeeCoinRoutes_1.default);
// --- Protected Routes (require authentication) ---
app.get('/api/user/me', authMiddleware_1.authenticateUser, (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: 'Successfully authenticated!',
            privyDid: req.user.privyDid,
            wallet: req.user.wallet,
        });
    }
    else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
    // A small delay to let blockchainService log its initialization
    setTimeout(() => {
        // This ensures that blockchainService attempts to initialize after server.ts starts.
        // In a more complex app, service initialization might be handled differently.
        require('./services/blockchainService');
    }, 100);
});
//# sourceMappingURL=server.js.map