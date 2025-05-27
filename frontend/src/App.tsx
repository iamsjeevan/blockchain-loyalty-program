import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import './App.css';

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
  // --- CORRECTED: getAccessToken is directly from usePrivy ---
  const { ready, authenticated, user, login, logout, linkEmail, getAccessToken } = usePrivy(); 
  const [backendUser, setBackendUser] = useState<AuthenticatedUserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [coffeeCoinBalance, setCoffeeCoinBalance] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{name: string, symbol: string} | null>(null);

  // This function now correctly uses getAccessToken from the hook
  const retrieveAuthToken = async (): Promise<string | null> => {
    if (!authenticated || !ready) { // Ensure user is authenticated and privy is ready
        console.warn("retrieveAuthToken: User not authenticated or Privy not ready.");
        setStatusMessage("User not authenticated or Privy not ready to issue token.");
        return null;
    }
    try {
      setStatusMessage("Attempting to get auth token (access token)...");
      // --- CORRECTED: Call getAccessToken() directly ---
      const token = await getAccessToken(); 
      
      if (!token) {
          console.warn("retrieveAuthToken: getAccessToken() returned null or undefined.");
          setStatusMessage("Failed to get access token from Privy.");
          return null;
      }
      console.log("retrieveAuthToken: Access token retrieved successfully.");
      setStatusMessage("Auth token retrieved successfully.");
      return token;
    } catch (e) {
      console.error("Error getting auth token (access token) from Privy:", e);
      setStatusMessage("Error encountered while getting auth token.");
      setError("Could not get authentication token.");
      return null;
    }
  };

  const fetchBackendUserData = async () => {
    setError(null);
    setBackendUser(null);
    setCoffeeCoinBalance(null);
    setStatusMessage("Preparing to fetch server data...");


    if (!authenticated || !ready) {
      setError('User not authenticated with Privy or Privy SDK not ready.');
      return;
    }

    // No need to check for 'user' object here for token, as getAccessToken comes from the hook
    const authToken = await retrieveAuthToken(); // Use the renamed function
    
    if (!authToken) {
      // retrieveAuthToken will have already set an error/status message
      console.error("Auth token is null, cannot fetch backend user data.");
      // setError might have been set by retrieveAuthToken, or set a generic one here if not.
      if (!error && !statusMessage?.includes("Failed")) { // Avoid overwriting specific error
        setError("Failed to obtain auth token for server request.");
      }
      return;
    }
    
    setStatusMessage("Auth token available. Fetching backend user data...");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to parse error response from backend.' }));
        throw new Error(errData.error || `Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      const data: AuthenticatedUserData = await response.json();
      setBackendUser(data);
      setStatusMessage("Backend user data fetched successfully!");
      if (data.wallet?.address) {
        fetchCoffeeCoinBalance(data.wallet.address);
      } else {
        setCoffeeCoinBalance("No wallet address from backend to fetch balance.");
      }
    } catch (e: any) {
      console.error("Error fetching backend user data:", e);
      setError(e.message || 'An unknown error occurred while fetching backend data.');
      setBackendUser(null);
    }
  };

  const fetchCoffeeCoinBalance = async (walletAddress: string) => {
    setStatusMessage(`Fetching CoffeeCoin balance for ${walletAddress}...`);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/coffee-coin/balance/${walletAddress}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to parse error response for balance.' }));
        throw new Error(errData.error || `Failed to fetch CoffeeCoin balance: ${response.status}`);
      }
      const data = await response.json();
      setCoffeeCoinBalance(data.balance);
      setStatusMessage("CoffeeCoin balance fetched.");
    } catch (e: any) {
      console.error("Error fetching CoffeeCoin balance:", e);
      setCoffeeCoinBalance('Error fetching balance.');
      setError(`Balance fetch error: ${e.message}`);
    }
  };

  const fetchTokenInformation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/coffee-coin/info`);
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
    fetchTokenInformation();
  }, []);

  const isLoginDisabled = !ready;
  const isLogoutDisabled = !ready || !authenticated;

  return (
    <div className="container">
      <h1>{tokenInfo ? `${tokenInfo.name} (${tokenInfo.symbol}) Rewards` : 'Loading Rewards Program...'}</h1>
      
      {statusMessage && <p style={{ color: 'blue' }}><i>Status: {statusMessage}</i></p>}
      {error && <p style={{ color: 'red' }}><b>Error: {error}</b></p>}

      {ready && authenticated && user ? (
        <div>
          <h2>Welcome!</h2>
          <p><strong>Privy User ID (DID):</strong> {user.id}</p>
          {user.wallet ? (
            <div>
              <p><strong>Primary Embedded Wallet (from Privy):</strong></p>
              <p style={{fontSize: '0.9em', wordBreak: 'break-all'}}>Address: {user.wallet.address}</p>
              <p style={{fontSize: '0.9em'}}>Chain ID: {user.wallet.chainId}</p>
              <p style={{fontSize: '0.9em'}}>Type: {user.wallet.walletClientType}</p>
            </div>
          ) : (
            <p>No primary embedded wallet found directly on Privy user object. Check linked accounts below.</p>
          )}
          
          <h3>Linked Accounts (from Privy):</h3>
          <ul>
            {user.linkedAccounts.map((account, index) => (
              <li key={index}>
                Type: <strong>{account.type}</strong>
                {account.type === 'wallet' && ` | Address: ${(account as any).address} | Chain: ${(account as any).chainId} (${(account as any).chainType}) | Wallet Type: ${(account as any).walletClientType}`}
                {account.type === 'email' && ` | Email: ${(account as any).address}`}
                {account.type === 'google' && ` | Subject: ${(account as any).subject} | Name: ${(account as any).name}`}
              </li>
            ))}
          </ul>
          <button onClick={logout} disabled={isLogoutDisabled}>Log Out</button>
          <hr />
          <button onClick={fetchBackendUserData} disabled={!authenticated}>Fetch My Server Data & Balance</button>
          {backendUser && (
            <div>
              <h3>Data from Server:</h3>
              <p>Message: {backendUser.message}</p>
              <p>Privy DID (verified by backend): {backendUser.privyDid}</p>
              {backendUser.wallet?.address ? (
                <div>
                  <p>Wallet Address (from backend): {backendUser.wallet.address}</p>
                  <p>CoffeeCoin Balance: <strong>{coffeeCoinBalance !== null ? coffeeCoinBalance : 'Loading...'}</strong></p>
                </div>
              ) : (
                <p>No Sepolia wallet found for user via backend OR backend data not fetched yet.</p>
              )}
            </div>
          )}
           {!user.email && (
              <button onClick={linkEmail} disabled={!ready}>Link Email</button>
            )}
        </div>
      ) : (
        <div>
          <p>Please log in to access your rewards.</p>
          <button onClick={login} disabled={isLoginDisabled}>Log In with Privy</button>
          <p><em>(Privy will show Email / Google login options)</em></p>
        </div>
      )}
    </div>
  );
}

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!privyAppId) {
    return (
      <div className="container">
        <h1>Configuration Error</h1>
        <p>Privy App ID is not set. Please check your <code>frontend/.env</code> file and ensure <code>VITE_PRIVY_APP_ID</code> is defined.</p>
      </div>
    );
  }
  
  const handleLoginSuccess = (user: any) => { 
    console.log(`User logged in successfully via App.tsx: ${user.id}`);
  };

  return (
    <PrivyProvider
      appId={privyAppId}
      onSuccess={handleLoginSuccess}
      config={{
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          // logo: 'YOUR_LOGO_URL_HERE',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false, 
          defaultChainId: 'eip155:11155111', // Sepolia
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
}

export default App;