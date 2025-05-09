import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import '../styles/styles.css';

const TransactionHistory = () => {
  const { account, contract, web3 } = useContext(Web3Context);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account || !contract || !web3) return;
      try {
        setLoading(true);
        setError(null);

        // Get past events for identity registration and verification
        const registeredFilter = contract.filters.IdentityRegistered(account);
        const verifiedFilter = contract.filters.IdentityVerified(account);

        const [registeredEvents, verifiedEvents] = await Promise.all([
          contract.queryFilter(registeredFilter),
          contract.queryFilter(verifiedFilter)
        ]);

        // Combine all events
        const allEvents = [...registeredEvents, ...verifiedEvents];
        
        // Get transaction details for each event
        const txPromises = allEvents.map(async (event) => {
          const provider = web3;
          const [tx, receipt, block] = await Promise.all([
            provider.getTransaction(event.transactionHash),
            provider.getTransactionReceipt(event.transactionHash),
            provider.getBlock(event.blockNumber)
          ]);
          
          return {
            hash: event.transactionHash,
            type: event.event === 'IdentityRegistered' ? 'Registration' : 'Verification',
            timestamp: block.timestamp * 1000, // Convert to milliseconds
            status: receipt.status ? 'Success' : 'Failed',
            from: tx.from,
            to: tx.to,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: event.blockNumber
          };
        });

        const txDetails = await Promise.all(txPromises);
        setTransactions(txDetails.sort((a, b) => b.blockNumber - a.blockNumber));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchTransactions();
  }, [account, contract, web3]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
  };

  if (loading) {
    return (
      <div className="transaction-history">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={handleRefresh} className="refresh-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h2>Transaction History</h2>
        <button 
          onClick={handleRefresh} 
          className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="transaction-list">
        {transactions.length === 0 ? (
          <div className="no-transactions">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.hash} className="transaction-item">
              <div className="transaction-header">
                <div className="header-left">
                  <span className={`transaction-type ${tx.type.toLowerCase()}`}>{tx.type}</span>
                  <span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                  <span className="transaction-date">
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="header-right">
                  <span className="gas-info">Gas Used: {tx.gasUsed}</span>
                </div>
              </div>
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="label">Transaction Hash:</span>
                  <a 
                    href={`http://localhost:8545/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hash-link"
                  >
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="label">From:</span>
                  <a 
                    href={`http://localhost:8545/address/${tx.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-link"
                  >
                    {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="label">To:</span>
                  <a 
                    href={`http://localhost:8545/address/${tx.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-link"
                  >
                    {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="label">Block:</span>
                  <a 
                    href={`http://localhost:8545/block/${tx.blockNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block-link"
                  >
                    {tx.blockNumber}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="label">Gas Used:</span>
                  <span>{tx.gasUsed}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;