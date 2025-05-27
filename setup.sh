#!/bin/bash

echo "--------------------------------------------------"
echo "Setting up Basic Node.js/Express.js Backend..."
echo "--------------------------------------------------"

# 1. Create the backend directory
if [ -d "backend" ]; then
  echo "Backend directory already exists. Skipping creation."
else
  mkdir backend
  echo "Backend directory created."
fi

# Navigate into the backend directory
cd backend

# 2. Initialize npm project (if not already)
if [ ! -f package.json ]; then
  echo "Initializing npm project for backend..."
  npm init -y
else
  echo "package.json already exists in backend. Skipping npm init."
fi

# 3. Install Express.js and other initial dependencies
echo "Installing Express, dotenv, and concurrently (for running dev scripts)..."
npm install express dotenv
npm install --save-dev typescript @types/express @types/node nodemon ts-node concurrently

# 4. Create tsconfig.json for the backend
echo "Creating tsconfig.json for backend..."
cat <<EOL > tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOL
echo "tsconfig.json created for backend."

# 5. Create basic directory structure
echo "Creating basic directory structure (src)..."
mkdir -p src/routes src/controllers src/services src/config

# 6. Create the .env file for the backend
# This will be ignored by the top-level .gitignore rule for '.env'
echo "Creating initial .env file for backend (backend/.env)..."
cat <<EOL > .env
NODE_ENV=development
PORT=3001

# Privy Credentials (Add your actual App ID and Secret once you have them)
# PRIVY_APP_ID=YOUR_PRIVY_APP_ID
# PRIVY_APP_SECRET=YOUR_PRIVY_APP_SECRET

# Blockchain Connection (already configured from smart contract part)
SEPOLIA_RPC_URL=${SEPOLIA_RPC_URL:-https://eth-sepolia.g.alchemy.com/v2/XNVDtE1TNSR6lRE0r_U1CPlrsNhkjvQ6}
COFFEE_COIN_CONTRACT_ADDRESS=${DEPLOYED_COFFEECOIN_ADDRESS_SEPOLIA:-0x113099845A71e603Cf514FCf5CDEda798e3183a1}

# Optional: A separate private key for the server if it needs to sign transactions
# e.g., for minting points on behalf of the retailer.
# Ensure this account is funded if it needs to pay gas.
# SERVER_WALLET_PRIVATE_KEY=YOUR_SERVER_WALLET_PRIVATE_KEY
EOL
echo "backend/.env file created."
echo "IMPORTANT: Remember to fill in actual values in backend/.env, especially for Privy."

# 7. Create an initial server entry point (src/server.ts)
echo "Creating initial server file (src/server.ts)..."
cat <<EOL > src/server.ts
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); // This will load from 'backend/.env'

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple test route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

// TODO: Add routes for loyalty program (users, points, rewards)

app.listen(port, () => {
  console.log(\`Backend server is running on http://localhost:\${port}\`);
});
EOL
echo "src/server.ts created."

# 8. Update package.json with scripts
# 8. Update package.json with scripts
echo "Updating package.json with dev, build, and start scripts..."
# This uses npm's built-in 'pkg' command which is safer for JSON manipulation
# Requires npm v7+ (usually bundled with Node.js 16+)
if npm pkg set scripts.dev="concurrently \"npx tsc --watch\" \"nodemon dist/server.js\"" && \
   npm pkg set scripts.build="npx tsc" && \
   npm pkg set scripts.start="node dist/server.js"
then
    echo "Added dev, build, and start scripts to package.json using 'npm pkg set'."
else
    echo "Failed to set npm scripts using 'npm pkg set'. This might be due to an older npm version."
    echo "Please add/update the scripts in backend/package.json manually:"
    echo "\"scripts\": {"
    echo "  \"dev\": \"concurrently \\\"npx tsc --watch\\\" \\\"nodemon dist/server.js\\\"\","
    echo "  \"build\": \"npx tsc\","
    echo "  \"start\": \"node dist/server.js\","
    echo "  \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"" # Keep or merge with existing test
    echo "}"
    echo "You might need to merge these with existing scripts."
fi

# Navigate back to the project root
cd .. # This should be here, after all operations within 'backend' are done.