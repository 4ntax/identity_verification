import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import IdentityContract from '../artifacts/contracts/IdentityVerification.sol/IdentityVerification.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          // Initialize provider for local Hardhat network
          const provider = new ethers.BrowserProvider(window.ethereum, {
            name: 'localhost',
            chainId: 31337
          });
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          
          const signer = await provider.getSigner();
          setWeb3(provider);

          // Use local contract address (update this after deploying to local network)
          const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
          
          // Create contract instance with specific overrides
          const contractInstance = new ethers.Contract(
            contractAddress,
            IdentityContract.abi,
            signer
          ).connect(signer);

          // Initialize contract instance without custom gas settings
          // Let ethers handle gas estimation automatically
          
          setContract(contractInstance);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

          setLoading(false);
        } else {
          throw new Error('Please install MetaMask!');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initWeb3();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', setAccount);
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        web3,
        account,
        contract,
        loading,
        error
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};