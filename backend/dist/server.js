"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config(); // This will load from 'backend/.env'
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Simple test route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});
// TODO: Add routes for loyalty program (users, points, rewards)
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map