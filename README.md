# Blockchain Identity Verification System

This project implements a blockchain-based identity verification system. It allows users to register their identity information securely on the blockchain and administrators to verify these identities.

## Features

- **Secure Identity Registration**: Users can register their identity information including name, date of birth, physical address, nationality, and ID number on the blockchain
- **Admin Verification System**: Dedicated admin interface for verifying submitted identities
- **Identity Status Tracking**: Real-time tracking of identity verification status
- **Smart Contract Based**: Powered by Ethereum smart contracts for secure and transparent verification

## Technical Architecture

### Smart Contract
- Written in Solidity ^0.8.19
- Implements identity registration and verification logic
- Includes ID number validation (16 characters)
- Maintains mapping of user addresses to identity information

### Frontend
- Built with React 18
- Uses ethers.js and web3.js for blockchain interaction
- Responsive UI with React Router for navigation

## Prerequisites

- Node.js and npm installed
- MetaMask or similar Web3 wallet
- Access to an Ethereum network (local or testnet)

## Setup

1. Clone the repository
2. Install dependencies:
```shell
npm install
```

## Development

To run the development environment:

```shell
npm run dev
```

To run smart contract tests:

```shell
npx hardhat test
```

## Usage

### For Users
1. Connect your Web3 wallet
2. Navigate to the registration page
3. Fill in your identity information
4. Submit for verification

### For Administrators
1. Connect with admin wallet
2. Access the admin dashboard
3. Review pending verifications
4. Approve or reject identity submissions

## Security Features

- Smart contract access control
- Admin-only verification functions
- Secure identity data storage on blockchain
- ID number validation
