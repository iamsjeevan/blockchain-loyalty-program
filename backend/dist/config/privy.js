"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_auth_1 = require("@privy-io/server-auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Ensure environment variables are loaded
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
if (!privyAppId || !privyAppSecret) {
    console.error('ERROR: Privy App ID or Secret is not defined in .env file.');
    // Optionally exit or throw error if running in a context where this is critical at startup
    // process.exit(1);
}
// Initialize Privy client - ensure credentials are provided
// Adding a check to handle potential undefined values if you want the app to start even if not set
// However, Privy features will not work. For production, these should always be set.
let privyClient = null;
if (privyAppId && privyAppSecret) {
    privyClient = new server_auth_1.PrivyClient(privyAppId, privyAppSecret);
}
else {
    console.warn("Privy client not initialized due to missing credentials. Auth features will be disabled.");
}
exports.default = privyClient;
//# sourceMappingURL=privy.js.map