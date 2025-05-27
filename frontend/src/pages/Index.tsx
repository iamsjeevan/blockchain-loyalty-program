import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import MyRewardsPageUI from '../components/MyRewardsPage'; // Your presentational component

// Define the structure for user wallet info
interface UserWalletDisplay {
  address: string;
  chainId?: string | number; 
  walletType?: string;
  chainType?: string;
}

// Define the structure for the authenticated user data from backend
interface AuthenticatedBackendData {
  message: string;
  privyDid: string;
  wallet?: UserWalletDisplay; 
}

// Mock rewards data
const mockRewards = [
  { id: 'reward1', name: 'Free Artisan Espresso', pointsRequired: 25, description: 'Rich & Bold.', icon: 'Coffee' },
  { id: 'reward2', name: 'Gourmet Muffin - 50% Off', pointsRequired: 15, description: 'Freshly baked daily.', icon: 'Gift' },
  { id: 'reward3', name: '$2 Off Any Large Drink', pointsRequired: 20, description: 'Your choice, your discount.', icon: 'Coffee' },
  { id: 'reward4', name: 'Bag of House Blend Beans', pointsRequired: 75, description: 'Take the taste home (200g).', icon: 'Gift' },
  { id: 'pastry', name: 'Fresh Croissant', pointsRequired: 20, description: 'Buttery, flaky, and perfectly golden', icon: 'Coffee' },
  { id: 'cappuccino', name: 'Deluxe Cappuccino', pointsRequired: 30, description: 'Rich espresso with perfectly steamed milk foam', icon: 'Coffee' }
];

export default function Index() {
  const { ready, authenticated, user, login, logout, linkEmail, getAccessToken } = usePrivy();
  
  const [backendAuthData, setBackendAuthData] = useState<AuthenticatedBackendData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [coffeeCoinBalance, setCoffeeCoinBalance] = useState<string | null>(null);
  
  const [frontendUserSepoliaWallet, setFrontendUserSepoliaWallet] = useState<UserWalletDisplay | null>(null);
  const sepoliaChainIdForDisplay = '11155111'; // Our app's representation of Sepolia Chain ID

  useEffect(() => {
    if (authenticated && user && ready) {
      let identifiedWallet: UserWalletDisplay | null = null;
      const targetChainIdForApp = sepoliaChainIdForDisplay;

      console.log("Index (Rewards Logic): User authenticated. Processing user object:", JSON.parse(JSON.stringify(user))); // Log a clone for inspection

      // Function to check if a wallet object from Privy is our target embedded Sepolia wallet
      const isTargetWallet = (walletObj: any): boolean => {
        if (!walletObj || typeof walletObj.address !== 'string') {
            // console.log("DEBUG isTargetWallet: Wallet object invalid or no address", walletObj);
            return false;
        }
        
        const isPrivyEmbedded = walletObj.walletClientType === 'privy';
        const isEthereumType = walletObj.chainType === 'ethereum';
        
        // Log details of the wallet being checked
        // console.log(`DEBUG isTargetWallet: Checking wallet - Address: ${walletObj.address}, ClientType: ${walletObj.walletClientType}, ChainType: ${walletObj.chainType}, Reported ChainID: ${walletObj.chainId}`);

        if (isPrivyEmbedded && isEthereumType) {
            // If Privy creates an embedded EVM wallet and our defaultChainId in PrivyProvider is Sepolia,
            // we assume this wallet is the Sepolia one Privy manages for the user.
            // The 'chainId' property on the wallet object from Privy might be absent or in CAIP-2 format.
            // Our app will use `targetChainIdForApp` for consistency if this wallet is chosen.
            console.log(`DEBUG isTargetWallet: Wallet (Address: ${walletObj.address}) IS a Privy embedded Ethereum wallet.`);
            return true;
        }
        // console.log(`DEBUG isTargetWallet: Wallet (Address: ${walletObj.address}) is NOT a Privy embedded Ethereum wallet meeting criteria.`);
        return false;
      };

      // 1. Check user.wallet (Privy's primary embedded wallet property)
      if (user.wallet) { // Check if user.wallet exists
        console.log("Index (Rewards Logic): Checking primary user.wallet object...");
        if (isTargetWallet(user.wallet)) {
            identifiedWallet = {
              address: user.wallet.address,
              chainId: targetChainIdForApp, 
              walletType: user.wallet.walletClientType,
              chainType: user.wallet.chainType,
            };
            console.log("Index (Rewards Logic): Identified target wallet from user.wallet:", identifiedWallet);
        } else {
            console.log("Index (Rewards Logic): Primary user.wallet did not match target criteria.");
        }
      } else {
        console.log("Index (Rewards Logic): user.wallet is undefined or null.");
      }

      // 2. If not found in primary, iterate through `linkedAccounts`
      if (!identifiedWallet && user.linkedAccounts && user.linkedAccounts.length > 0) {
        console.log("Index (Rewards Logic): Target wallet not found in user.wallet. Checking linkedAccounts...");
        const linkedWalletFromAccounts = user.linkedAccounts.find(acc => acc.type === 'wallet' && isTargetWallet(acc));
        
        if (linkedWalletFromAccounts) {
          // Cast to any to access properties, as 'acc' is broadly typed initially
          const walletData = linkedWalletFromAccounts as any; 
          identifiedWallet = {
            address: walletData.address,
            chainId: targetChainIdForApp,
            walletType: walletData.walletClientType,
            chainType: walletData.chainType,
          };
          console.log("Index (Rewards Logic): Identified target wallet from user.linkedAccounts:", identifiedWallet);
        } else {
            console.log("Index (Rewards Logic): No matching wallet found in linkedAccounts either.");
        }
      }

      if (identifiedWallet) {
        setFrontendUserSepoliaWallet(identifiedWallet);
      } else {
        console.log("Index (Rewards Logic): FINAL: NO Privy embedded Ethereum wallet found matching criteria.");
        setFrontendUserSepoliaWallet(null);
      }
    } else {
      // Clear if not authenticated, user object not ready, or Privy not ready
      if (!authenticated && ready) console.log("Index (Rewards Logic): User not authenticated (Privy ready), clearing wallet.");
      if (!user && authenticated && ready) console.log("Index (Rewards Logic): Privy user object not available (authenticated and ready), clearing wallet.");
      if (!ready) console.log("Index (Rewards Logic): Privy not ready, clearing wallet.");
      setFrontendUserSepoliaWallet(null);
    }
  }, [authenticated, user, ready]); // Removed sepoliaChainIdForDisplay from deps, it's a constant within scope

  useEffect(() => {
    if (frontendUserSepoliaWallet?.address) {
      console.log(`Index (Rewards Logic): frontendUserSepoliaWallet.address is set to ${frontendUserSepoliaWallet.address}, fetching balance.`);
      fetchCoffeeCoinBalance(frontendUserSepoliaWallet.address);
    } else {
      // console.log("Index (Rewards Logic): frontendUserSepoliaWallet.address is null, clearing balance.");
      setCoffeeCoinBalance(null);
    }
  }, [frontendUserSepoliaWallet]);

  const retrieveAuthToken = async (): Promise<string | null> => {
    if (!authenticated || !ready) {
        // setStatusMessage("User not authenticated or Privy not ready."); // Can be noisy
        return null;
    }
    try {
      // setStatusMessage("Getting auth token...");
      const token = await getAccessToken();
      if (!token) {
          setStatusMessage("Failed to get auth token.");
          return null;
      }
      console.log("PRIVY AUTH TOKEN FOR POSTMAN:", token);
      // setStatusMessage("Auth token retrieved.");
      return token;
    } catch (e) {
      console.error("Error getting auth token:", e);
      setStatusMessage("Error getting auth token.");
      setError("Could not get authentication token.");
      return null;
    }
  };

  const verifyAuthenticationWithBackend = async () => {
    setError(null);
    setBackendAuthData(null);
    // setStatusMessage("Verifying session with server...");

    const authToken = await retrieveAuthToken();
    if (!authToken) { return; }
    
    try {
      const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;
      if (!backendApiUrl) throw new Error("VITE_BACKEND_API_URL not set");
      const response = await fetch(`${backendApiUrl}/user/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to parse server error.' }));
        throw new Error(errData.error || `Server auth verification failed: ${response.status}`);
      }
      const data: AuthenticatedBackendData = await response.json();
      setBackendAuthData(data);
      setStatusMessage("Server session verified!");
      // console.log("Index (Rewards Logic): Data from /api/user/me (backend):", data);
    } catch (e: any) {
      console.error("Error verifying server auth:", e);
      setError(e.message || 'Unknown error verifying server session.');
    }
  };

  const fetchCoffeeCoinBalance = async (walletAddress: string) => {
    if (!ethers.isAddress(walletAddress)) {
        setError("Invalid wallet address for balance check.");
        setCoffeeCoinBalance(null);
        return;
    }
    // setStatusMessage(`Fetching CoffeeCoin balance for ${walletAddress.substring(0,10)}...`);
    try {
      const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;
      if (!backendApiUrl) throw new Error("VITE_BACKEND_API_URL not set");
      const response = await fetch(`${backendApiUrl}/coffee-coin/balance/${walletAddress}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to parse balance error.' }));
        throw new Error(errData.error || `Failed to fetch balance: ${response.status}`);
      }
      const data = await response.json();
      if (typeof data.balance === 'undefined') {
        throw new Error("Invalid balance data from backend");
      }
      setCoffeeCoinBalance(data.balance);
      // setStatusMessage("CoffeeCoin balance fetched.");
    } catch (e: any) {
      console.error("Error fetching CoffeeCoin balance:", e);
      setCoffeeCoinBalance('Error');
      setError(`Balance Error: ${e.message}`);
    }
  };

  useEffect(() => {
    if (authenticated && user && ready) {
        verifyAuthenticationWithBackend();
    } else {
        setBackendAuthData(null); 
    }
  }, [authenticated, user, ready]);

  const handleRedeemClick = (rewardId: string) => {
    console.log(`Redeem clicked for reward ID: ${rewardId}`);
    const rewardToRedeem = mockRewards.find(r => r.id === rewardId);
    if (!rewardToRedeem) { setError("Selected reward not found."); return; }
    if (!frontendUserSepoliaWallet?.address) { setError("Loyalty wallet not identified. Cannot redeem."); return; }
    const currentBalance = coffeeCoinBalance ? parseInt(coffeeCoinBalance) : 0;
    if (currentBalance < rewardToRedeem.pointsRequired) {
      setError(`Not enough CoffeeCoins to redeem ${rewardToRedeem.name}. You need ${rewardToRedeem.pointsRequired}, have ${currentBalance}.`);
      return;
    }
    alert(`Redeem ${rewardToRedeem.name} for ${rewardToRedeem.pointsRequired} CFC - Full functionality (blockchain transaction) coming soon!`);
    // TODO: Implement actual burn transaction
  };

  const handleActualLinkEmail = async () => {
    if (!ready || !linkEmail) { setError("Privy not ready or email linking not available."); return; }
    try { await linkEmail(); } 
    catch(e:any) { console.error("Error initiating email link:", e); setError("Failed to start email linking."); }
  }

  if (!ready) {
    return <div className="page-container text-center py-10"><p>Loading Rewards Program...</p></div>;
  }

  if (!authenticated) {
    return (
      <div className="page-container text-center py-10">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">Welcome to CoffeeDelight Rewards!</h2>
        <p className="text-amber-700 mb-6">Please log in using the button in the navigation bar to view your CoffeeCoins and redeem exclusive treats.</p>
      </div>
    );
  }
  
  return (
    <MyRewardsPageUI
      coffeeCoinBalance={coffeeCoinBalance}
      walletAddress={frontendUserSepoliaWallet?.address || null}
      rewards={mockRewards}
      statusMessage={statusMessage}
      error={error}
      onRedeemClick={handleRedeemClick}
      onLinkEmail={user && !user.email ? handleActualLinkEmail : undefined}
    />
  );
}