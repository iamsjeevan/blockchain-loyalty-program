"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Added NextFunction
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const coffeeCoinRoutes_1 = __importDefault(require("./routes/coffeeCoinRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});
app.use('/api/coffee-coin', coffeeCoinRoutes_1.default);
// The authenticateUser middleware is async, but the final handler is sync. This is usually fine.
// The key is that authenticateUser itself must correctly match the expected middleware signature.
app.get('/api/user/me', authMiddleware_1.authenticateUser, (req, res) => {
    if (req.user) { // req.user is populated by authenticateUser middleware
        res.status(200).json({
            message: 'Successfully authenticated!',
            privyDid: req.user.privyDid,
            wallet: req.user.wallet,
        });
    }
    else {
        // This case should ideally not be reached if middleware correctly handles errors
        // or calls next() only on success.
        // However, if authenticateUser calls next() even after an issue where req.user isn't set,
        // this block might be hit. The middleware should ideally send error response itself.
        res.status(401).json({ error: 'User not authenticated or user data unavailable' });
    }
});
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
    setTimeout(() => {
        require('./services/blockchainService');
    }, 100);
});
//# sourceMappingURL=server.js.map