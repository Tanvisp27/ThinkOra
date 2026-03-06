# ThinkOra

TrustChain Escrow System is a Decentralized Escrow Payment System designed to eliminate trust issues in online transactions. By leveraging Web3 smart contracts, it acts as an unbiased middleman that securely holds funds until both parties fulfill their end of the agreement.

## Core Mechanism

1. **Lock Funds:** * The Buyer creates an escrow contract.
   * The Buyer sets a specific deadline.
   * The Buyer deposits the cryptocurrency into the smart contract vault.

2. **Release Funds:**
   * Once the service/product is delivered, the Buyer confirms the delivery.
   * The Buyer manually triggers the release of funds to the Seller's wallet.

3. **Auto-Release (Deadline):**
   * If the Buyer goes silent after delivery and the agreed-upon deadline passes...
   * The smart contract will automatically release the locked funds to the Seller to prevent stolen labor.

## Tech Stack
* **Frontend:** Next.js, Tailwind CSS, ethers.js
* **Backend:** Hardhat, Solidity Smart Contracts
