import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import IdentityRegistrationForm from './IdentityRegistrationForm';
import AdminVerification from './AdminVerification';
import TransactionHistory from './TransactionHistory';
import AdminRoute from './AdminRoute';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import '../styles/styles.css';

const Dashboard = () => {
  const { contract, loading, error } = useContext(Web3Context);

  if (loading) {
    return <div className="dashboard-loading">Loading Web3...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Register
        </NavLink>

        <NavLink 
          to="/admin" 
          className={({ isActive }) => 
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Admin
        </NavLink>
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          History
        </NavLink>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route 
            path="/" 
            element={<IdentityRegistrationForm contract={contract} />} 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminVerification contract={contract} />
              </AdminRoute>
            } 
          />
          <Route 
            path="/history" 
            element={<TransactionHistory />} 
          />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;