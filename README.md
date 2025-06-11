# Blockchain-Based Loyalty Program

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity">
  <img src="https://img.shields.io/badge/Hardhat-D6E52E?style=for-the-badge&logo=hardhat&logoColor=black" alt="Hardhat">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Privy-161616?style=for-the-badge&logo=privy&logoColor=white" alt="Privy">
</p>

This repository contains a full-stack, decentralized loyalty program built on the Ethereum blockchain. It demonstrates how businesses can reward customers with custom ERC-20 tokens ("CoffeeCoin") for their purchases, creating an engaging and transparent rewards system.

The key innovation is the use of **Privy embedded wallets**, which abstracts away the complexities of Web3 for everyday users. Customers can create a wallet with just an email address, without needing to install MetaMask or manage seed phrases.

---

## 🏛️ Project Architecture

This project is a monorepo containing three distinct parts that work together to create the full application experience:

1.  **`smart-contracts/`**: The core of the dApp.
    *   Contains the `CoffeeCoin.sol` ERC-20 token contract.
    *   Uses **Hardhat** for compiling, testing, and deploying the contract to the **Sepolia testnet**.

2.  **`backend/`**: A Node.js/Express server that acts as a secure intermediary.
    *   Manages administrative tasks like minting new tokens.
    *   Communicates with the deployed smart contract using **Ethers.js**.
    *   Provides a REST API for the frontend to interact with the blockchain indirectly.

3.  **`frontend/`**: A modern React application that serves as the user interface.
    *   Built with **Vite**, **TypeScript**, and **Tailwind CSS**.
    *   Integrates **Privy** for seamless, email-based wallet creation and user authentication.
    *   Allows users to view their CoffeeCoin balance and rewards.

 
*(A simple diagram showing Frontend -> Backend -> Smart Contract would be great here!)*

---

## ✨ Key Features

*   **ERC-20 Loyalty Token:** A custom `CoffeeCoin` token built on the standard OpenZeppelin ERC-20 implementation.
*   **Seamless User Onboarding:** **Privy** integration allows users without any crypto knowledge to participate easily.
*   **Secure Admin Operations:** The backend server holds the owner's private key, ensuring that minting operations are secure and not exposed on the client side.
*   **Monorepo Structure:** A clean, organized codebase with separate packages for each part of the application.
*   **Full dApp Experience:** From smart contract deployment to a user-friendly frontend, this project covers the entire dApp lifecycle.

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