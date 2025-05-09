import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles/styles.css';

const AdminVerification = ({ contract }) => {
  const [pendingIdentities, setPendingIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchPendingIdentities();
  }, [contract]);

  const fetchPendingIdentities = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all registered events
      const registeredFilter = contract.filters.IdentityRegistered();
      const registeredEvents = await contract.queryFilter(registeredFilter);

      // Get all verified events
      const verifiedFilter = contract.filters.IdentityVerified();
      const verifiedEvents = await contract.queryFilter(verifiedFilter);

      // Create a set of verified addresses
      const verifiedAddresses = new Set(
        verifiedEvents.map(event => event.args.user.toLowerCase())
      );

      // Filter and map registered events to get pending identities
      const pending = [];
      for (const event of registeredEvents) {
        const address = event.args.user.toLowerCase();
        if (!verifiedAddresses.has(address)) {
          try {
            const identity = await contract.getIdentity(address);
            pending.push({
              address,
              name: identity.name,
              dateOfBirth: new Date(identity.dateOfBirth * 1000).toLocaleDateString(),
              physicalAddress: identity.physicalAddress,
              nationality: identity.nationality,
              idNumber: identity.idNumber,
              registrationDate: new Date(event.block.timestamp * 1000).toLocaleString()
            });
          } catch (err) {
            console.error(`Error fetching identity for ${address}:`, err);
          }
        }
      }

      setPendingIdentities(pending);
    } catch (err) {
      setError('Failed to fetch pending identities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (address) => {
    try {
      setVerifying(true);
      setError('');

      const tx = await contract.verifyIdentity(address);
      await tx.wait();

      // Remove the verified identity from the pending list
      setPendingIdentities(prev => 
        prev.filter(identity => identity.address.toLowerCase() !== address.toLowerCase())
      );

      // Refresh the list
      await fetchPendingIdentities();
    } catch (err) {
      setError(`Failed to verify identity: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="admin-verification loading">Loading pending identities...</div>;
  }

  return (
    <div className="admin-verification">
      <h2>Pending Identity Verifications</h2>
      {error && <div className="error-message">{error}</div>}
      
      {pendingIdentities.length === 0 ? (
        <div className="no-pending">No pending identities to verify</div>
      ) : (
        <div className="pending-list">
          {pendingIdentities.map((identity) => (
            <div key={identity.address} className="identity-card">
              <div className="identity-header">
                <h3>{identity.name}</h3>
                <span className="registration-date">
                  Registered: {identity.registrationDate}
                </span>
              </div>
              
              <div className="identity-details">
                <p><strong>Address:</strong> {identity.address}</p>
                <p><strong>Date of Birth:</strong> {identity.dateOfBirth}</p>
                <p><strong>Physical Address:</strong> {identity.physicalAddress}</p>
                <p><strong>Nationality:</strong> {identity.nationality}</p>
                <p><strong>ID Number:</strong> {identity.idNumber}</p>
              </div>

              <button
                onClick={() => handleVerify(identity.address)}
                disabled={verifying}
                className="verify-button"
              >
                {verifying ? 'Verifying...' : 'Verify Identity'}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchPendingIdentities}
        className="refresh-button"
        disabled={loading}
      >
        Refresh List
      </button>
    </div>
  );
};

export default AdminVerification;