"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middleware/authMiddleware"); // Import our middleware
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
// --- Protected Routes (require authentication) ---
// This route will be protected by our Privy auth middleware
app.get('/api/user/me', authMiddleware_1.authenticateUser, (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: 'Successfully authenticated!',
            privyDid: req.user.privyDid,
            wallet: req.user.wallet,
            // You can add more user details here from req.user
        });
    }
    else {
        // This case should ideally not be reached if middleware is working,
        // but as a fallback.
        res.status(401).json({ error: 'User not authenticated' });
    }
});
// TODO: Add more loyalty program routes (users, points, rewards), many will be protected
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map