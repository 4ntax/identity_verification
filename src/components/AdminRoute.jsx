import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const AdminRoute = ({ children }) => {
  const { contract, account } = useContext(Web3Context);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (contract && account) {
          const adminAddress = await contract.admin();
          setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [contract, account]);

  if (loading) {
    return <div>Checking admin status...</div>;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
};

export default AdminRoute;