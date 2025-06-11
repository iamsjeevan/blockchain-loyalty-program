# Blockchain-Based Loyalty Program

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity">
  <img src="https://img.shields.io/badge/Hardhat-D6E52E?style=for-the-badge&logo=hardhat&logoColor=black" alt="Hardhat">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Privy-161616?style=for-the-badge&logo=privy&logoColor=white" alt="Privy">
</p>

This repository contains a full-stack, decentralized loyalty program built on the Ethereum blockchain. It showcases a complete **mint-on-purchase and burn-on-redemption lifecycle** for a custom ERC-20 token, `CoffeeCoin`.

The key innovation is the use of **Privy embedded wallets**, which abstracts away the complexities of Web3 for everyday users. Customers can create a wallet with just an email address, without needing to install MetaMask or manage seed phrases.

---

## 🏛️ Project Architecture & Token Flow

This project is a monorepo containing three distinct parts that work together. The core logic revolves around the `mint()` and `burn()` functions of the smart contract.

1.  **`smart-contracts/`**: The heart of the dApp.
    *   Contains the `CoffeeCoin.sol` ERC-20 token contract, which includes owner-only `mint(to, amount)` and `burnFrom(from, amount)` functions.
    *   Uses **Hardhat** for compiling, testing, and deploying the contract to the **Sepolia testnet**.

2.  **`backend/`**: A Node.js/Express server that acts as the secure contract owner.
    *   Securely holds the owner's private key to authorize minting and burning operations.
    *   Provides a REST API for the frontend to trigger blockchain transactions safely.

3.  **`frontend/`**: A modern React application that serves as the user interface for both customers and businesses.
    *   Integrates **Privy** for seamless, email-based wallet creation and user authentication.
    *   Allows users to view their CoffeeCoin balance and initiate reward redemptions.

### User Journey & Token Lifecycle

1.  **Purchase & Minting:** A customer buys coffee. The point-of-sale system calls the backend API. The server, as the contract owner, then calls the `mint()` function on the smart contract, creating new `CoffeeCoin` and sending them directly to the customer's Privy wallet address.
2.  **Redemption & Burning:** The customer decides to redeem a reward (e.g., a free coffee) on the frontend. This calls a backend endpoint. The server validates the request and then calls the `burnFrom()` function on the smart contract, permanently removing the specified amount of `CoffeeCoin` from the customer's wallet.

---

## ✨ Key Features

*   **Mint-on-Purchase & Burn-on-Redeem:** A complete, auditable lifecycle for loyalty tokens.
*   **Owner-Controlled Minting:** The backend is the sole minter, preventing unauthorized token creation.
*   **User-Initiated Redemption (Burn):** Users can spend their tokens, which triggers the burn mechanism on the backend.
*   **Seamless User Onboarding:** **Privy** integration removes the need for users to have prior crypto knowledge or wallets like MetaMask.
*   **Secure, Decoupled Architecture:** The frontend never handles private keys; all sensitive operations are managed by the trusted backend.
*   **Full dApp Experience:** From smart contract development to a user-friendly frontend, this project covers the entire dApp lifecycle.

---

## 🛠️ Tech Stack

| Area              | Technologies                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| **Smart Contract**| Solidity, Hardhat, Ethers.js, OpenZeppelin, Sepolia Testnet                     |
| **Backend**       | Node.js, Express, TypeScript, Ethers.js                                        |
| **Frontend**      | React, Vite, TypeScript, Tailwind CSS, shadcn/ui                               |
| **Web3 Auth**     | Privy (Embedded Wallets)                                                       |

---

## 🏁 Getting Started

This project is set up as a monorepo. You will need to run the `setup.sh` script to install dependencies for all packages.

### Prerequisites

*   Node.js (v18.x or later) and `npm`.
*   An [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) RPC URL for the Sepolia testnet.
*   A private key for an Ethereum account funded with Sepolia ETH.
*   A [Privy](https://www.privy.io/) App ID.

### Setup and Installation

1.  **Clone the Repository:**
    ```sh
    git clone https://github.com/iamsjeevan/blockchain-loyalty-program.git
    cd blockchain-loyalty-program
    ```

2.  **Run the Setup Script:**
    This script navigates into each directory (`smart-contracts`, `backend`, `frontend`) and runs `npm install`.
    ```sh
    chmod +x setup.sh
    ./setup.sh
    ```

### Configuration

You will need to create `.env` files for each part of the application.

1.  **Smart Contracts (`smart-contracts/.env`):**
    ```
    SEPOLIA_RPC_URL="YOUR_SEPOLIA_RPC_URL"
    PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
    ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
    ```

2.  **Backend (`backend/.env`):**
    ```
    SEPOLIA_RPC_URL="YOUR_SEPOLIA_RPC_URL"
    PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY" # This should be the contract owner's key
    CONTRACT_ADDRESS="DEPLOYED_COFFEE_COIN_CONTRACT_ADDRESS"
    PRIVY_APP_ID="YOUR_PRIVY_APP_ID"
    PRIVY_APP_SECRET="YOUR_PRIVY_APP_SECRET"
    ```

3.  **Frontend (`frontend/.env.local`):**
    ```
    VITE_PRIVY_APP_ID="YOUR_PRIVY_APP_ID"
    VITE_API_BASE_URL="http://localhost:3001/api"
    ```

### Running the Application

1.  **Deploy the Smart Contract:**
    Navigate to the `smart-contracts` directory and run the deployment script.
    ```sh
    cd smart-contracts
    npx hardhat run scripts/deployCoffeeCoin.ts --network sepolia
    ```
    Take note of the deployed contract address and update your `.env` files.

2.  **Start the Backend Server:**
    In a new terminal, navigate to the `backend` directory.
    ```sh
    cd backend
    npm run dev
    ```

3.  **Start the Frontend:**
    In another new terminal, navigate to the `frontend` directory.
    ```sh
    cd frontend
    npm run dev
    ```
    The application will be running at `http://localhost:5173`.

---

## 📧 Contact

Jeevan S. - [iamsjeevan@gmail.com](mailto:iamsjeevan@gmail.com)

Project Link: [https://github.com/iamsjeevan/blockchain-loyalty-program](https://github.com/iamsjeevan/blockchain-loyalty-program)
