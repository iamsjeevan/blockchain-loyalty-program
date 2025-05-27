#!/bin/bash

echo "--------------------------------------------------"
echo "Setting up Basic React Frontend with Vite and Privy..."
echo "--------------------------------------------------"

# Ensure we are in the main project directory
# cd /path/to/your/blockchain-loyalty-program # Or ensure you run this from the root

# 1. Create the frontend directory using Vite (React with TypeScript)
if [ -d "frontend" ]; then
  echo "Frontend directory already exists. Please remove or rename it if you want a fresh setup."
  # exit 1 # Optionally exit
else
  echo "Creating React+TypeScript project in 'frontend' directory using Vite..."
  # npm create vite@latest <project-name> -- --template <template-name>
  # We need to handle the interactive prompts from 'npm create vite@latest'
  # For non-interactive, we might need a more complex approach or a template.
  # Let's try to provide input. User might need to confirm manually.
  npm create vite@latest frontend -- --template react-ts <<INPUT
# Prompts:
# √ Project name: ... frontend (already provided)
# √ Select a framework: » React
# √ Select a variant: » TypeScript
# If the above doesn't work non-interactively, user must run:
# npm create vite@latest frontend -- --template react-ts
# and select React then TypeScript.
INPUT
  echo "Vite project 'frontend' created."
fi

# Check if frontend project was created successfully
if [ ! -d "frontend" ] || [ ! -f "frontend/package.json" ]; then
    echo ""
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "Vite project creation might have failed or required manual interactive steps."
    echo "If the 'frontend' directory or 'frontend/package.json' was not created, please run manually:"
    echo "  npm create vite@latest frontend -- --template react-ts"
    echo "And choose 'React' then 'TypeScript'."
    echo "Then, navigate into 'frontend', run 'npm install', and then re-run this script (or apply steps manually)."
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    exit 1
fi


# Navigate into the frontend directory
cd frontend

# 2. Install dependencies (Vite does this, but let's ensure) and Privy SDK
echo "Ensuring dependencies are installed and adding Privy React SDK..."
npm install
npm install @privy-io/react-auth ethers@^6.11.1 # Using ethers v6

# 3. Create .env file for frontend with Privy App ID
echo "Creating .env file for frontend (frontend/.env)..."
cat <<EOL > .env
# Your Privy App ID (get this from the Privy Dashboard)
# IMPORTANT: This is a public App ID, safe to expose in frontend code.
VITE_PRIVY_APP_ID=YOUR_PRIVY_APP_ID_HERE

# Optional: Backend API URL
VITE_BACKEND_API_URL=http://localhost:3001/api
EOL
echo "frontend/.env created. IMPORTANT: Fill in your VITE_PRIVY_APP_ID."

# 4. Update App.tsx to include PrivyProvider and basic login UI
echo "Updating src/App.tsx for Privy integration..."
cat <<EOL > src/App.tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import './App.css'; // Assuming you have some basic styles

// Define the structure for user wallet info if needed
interface UserWallet {
  address: string;
  chainId?: string | number;
  walletType?: string;
}

// Define the structure for the authenticated user data from backend
interface AuthenticatedUserData {
  message: string;
  privyDid: string;
  wallet?: UserWallet;
}

function AppContent() {
  const { ready, authenticated, user, login, logout, linkEmail, linkGoogle } = usePrivy();
  const [backendUser, setBackendUser] = useState<AuthenticatedUserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coffeeCoinBalance, setCoffeeCoinBalance] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{name: string, symbol: string} | null>(null);

  // This is your Privy Auth Token. You will send this to your backend.
  const getAuthToken = async () => {
    try {
      const token = await user?.getIdToken(); // Or getAccessToken()
      return token;
    } catch (e) {
      console.error("Error getting auth token", e);
      return null;
    }
  };

  // Fetch data from your backend's protected route
  const fetchBackendUserData = async () => {
    if (!authenticated) {
      setBackendUser(null);
      setError('User not authenticated with Privy.');
      return;
    }

    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        setError("Could not retrieve auth token.");
        return;
      }

      const response = await fetch(\`\${import.meta.env.VITE_BACKEND_API_URL}/user/me\`, {
        headers: {
          'Authorization': \`Bearer \${authToken}\`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || \`Failed to fetch user data: \${response.status}\`);
      }
      const data: AuthenticatedUserData = await response.json();
      setBackendUser(data);
      setError(null); // Clear previous errors
      // If user has a wallet, fetch their CoffeeCoin balance
      if (data.wallet?.address) {
        fetchCoffeeCoinBalance(data.wallet.address);
      }
    } catch (e: any) {
      console.error("Error fetching backend user data:", e);
      setError(e.message || 'An unknown error occurred.');
      setBackendUser(null);
    }
  };

  const fetchCoffeeCoinBalance = async (walletAddress: string) => {
    try {
      const response = await fetch(\`\${import.meta.env.VITE_BACKEND_API_URL}/coffee-coin/balance/\${walletAddress}\`);
      if (!response.ok) {
        throw new Error('Failed to fetch CoffeeCoin balance');
      }
      const data = await response.json();
      setCoffeeCoinBalance(data.balance);
    } catch (e: any) {
      console.error("Error fetching CoffeeCoin balance:", e);
      setCoffeeCoinBalance('Error');
    }
  };

  const fetchTokenInformation = async () => {
    try {
      const response = await fetch(\`\${import.meta.env.VITE_BACKEND_API_URL}/coffee-coin/info\`);
      if (!response.ok) {
        throw new Error('Failed to fetch token info');
      }
      const data = await response.json();
      setTokenInfo(data);
    } catch (e: any) {
      console.error("Error fetching token info:", e);
    }
  };

  useEffect(() => {
    fetchTokenInformation(); // Fetch token info on component mount
  }, []);


  // Disable login button until Privy is ready
  const isLoginDisabled = !ready;
  // Disable logout button until Privy is ready or if not authenticated
  const isLogoutDisabled = !ready || !authenticated;

  return (
    <div className="container">
      <h1>{tokenInfo ? \`Welcome to \${tokenInfo.name} (\${tokenInfo.symbol}) Rewards!\` : 'CoffeeCoin Rewards'}</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {ready && authenticated ? (
        <div>
          <p>You are logged in!</p>
          {user && (
            <div>
              <p><strong>Privy User ID (DID):</strong> {user.id}</p>
              {user.wallet ? (
                <div>
                  <p><strong>Your Embedded Wallet Address (Sepolia):</strong> {user.wallet.address}</p>
                  <p><strong>Chain ID:</strong> {user.wallet.chainId}</p>
                </div>
              ) : (
                <p>No primary embedded wallet found directly on user object. Check linked accounts.</p>
              )}
               {/* Display all linked accounts */}
              <h3>Linked Accounts:</h3>
              <ul>
                {user.linkedAccounts.map((account, index) => (
                  <li key={index}>
                    Type: {account.type} 
                    {account.type === 'wallet' && \` | Address: \${(account as any).address} | Chain: \${(account as any).chainId} (\${(account as any).chainType}) | Wallet Type: \${(account as any).walletClientType}\`}
                    {account.type === 'email' && \` | Email: \${(account as any).address}\`}
                    {account.type === 'google' && \` | Subject: \${(account as any).subject} | Name: \${(account as any).name}\`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={logout} disabled={isLogoutDisabled}>Log Out</button>
          <hr />
          <button onClick={fetchBackendUserData} disabled={!authenticated}>Fetch My Backend User Data</button>
          {backendUser && (
            <div>
              <h3>Backend User Data:</h3>
              <p>Message: {backendUser.message}</p>
              <p>Privy DID (from backend): {backendUser.privyDid}</p>
              {backendUser.wallet ? (
                <div>
                  <p>Wallet Address (from backend): {backendUser.wallet.address}</p>
                  <p>CoffeeCoin Balance: {coffeeCoinBalance !== null ? coffeeCoinBalance : 'Loading...'}</p>
                </div>

              ) : (
                <p>No Sepolia wallet found for user via backend.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>Please log in to access your rewards.</p>
          <button onClick={login} disabled={isLoginDisabled}>Log In with Privy</button>
          <p><em>(Privy will show Email / Google login options)</em></p>
        </div>
      )}
       {!user?.email?.address && authenticated && (
          <button onClick={linkEmail} disabled={!ready}>Link Email</button>
        )}
        {/* Add other link methods if needed, e.g., linkGoogle, linkWallet, etc. */}
    </div>
  );
}

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!privyAppId) {
    return (
      <div>
        <h1>Configuration Error</h1>
        <p>Privy App ID is not set. Please check your <code>.env</code> file and ensure <code>VITE_PRIVY_APP_ID</code> is defined.</p>
      </div>
    );
  }
  
  const handleLogin = (user: any /* Privy User object */) => {
    console.log(\`User logged in: \${user.id}\`);
    // You can trigger backend calls or other actions here
  };

  return (
    <PrivyProvider
      appId={privyAppId}
      onSuccess={handleLogin} // Optional: callback when login is successful
      config={{
        // Customize Privy modal settings here
        loginMethods: ['email', 'google'], // Specify methods
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'YOUR_LOGO_URL_HERE', // Optional: replace with your logo URL
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // Or 'all-users'
          noPromptOnSignature: false, // If true, user is not prompted for SiWE for new wallets. Default false.
          // Specify which chain your dApp works with
          // For our loyalty program, we use Sepolia
          defaultChainId: 'eip155:11155111', // Sepolia chain ID
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
}

export default App;
EOL
echo "src/App.tsx updated."

# 5. Basic CSS for layout (src/App.css) - Optional but helpful
echo "Adding basic styles to src/App.css..."
cat <<EOL > src/App.css
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  min-height: 100vh;
  padding-top: 20px;
}

.container {
  background-color: #fff;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 700px;
  text-align: center;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 5px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

hr {
  margin: 20px 0;
  border: 0;
  border-top: 1px solid #eee;
}

input[type="text"], input[type="number"] {
  padding: 8px;
  margin: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  text-align: left;
  font-size: 0.9em;
}
EOL
echo "src/App.css updated."

# Navigate back to the project root
cd ..

echo ""
echo "--------------------------------------------------"
echo "Basic React Frontend Setup with Privy Complete!"
echo ""
echo "IMPORTANT Next Steps:"
echo "1. Navigate into the 'frontend' directory: cd frontend"
echo "2. CRITICAL: Open 'frontend/.env' and set your actual 'VITE_PRIVY_APP_ID'."
echo "   (You got this from your Privy dashboard)."
echo "3. Ensure your backend server is running (in another terminal: cd backend && npm run dev)."
echo "4. To run the frontend development server:"
echo "   npm run dev"
echo "5. Open your browser and go to the URL provided by Vite (usually http://localhost:5173)."
echo "   You should see the login button. Try logging in with Email or Google."
echo ""
echo "Git:"
echo "Once you've tested login and it looks good, commit these changes:"
echo "  git add ."
echo "  git commit -m \"feat(frontend): Initial React+Vite setup with Privy login and user display\""
echo "  git push origin main"
echo "--------------------------------------------------"