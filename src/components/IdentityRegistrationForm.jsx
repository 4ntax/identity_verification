import React, { useState, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import '../styles/styles.css';

const IdentityRegistrationForm = () => {
  const { contract, account, web3 } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    physicalAddress: '',
    nationality: '',
    idNumber: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.dateOfBirth || !formData.physicalAddress || 
        !formData.nationality || !formData.idNumber) {
      setError('All fields are required');
      return false;
    }
    if (formData.idNumber.length !== 16) {
      setError('ID number must be exactly 16 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      // Convert date to Unix timestamp
      const dateTimestamp = Math.floor(new Date(formData.dateOfBirth).getTime() / 1000);

      // Call the contract method without additional gas settings
      const tx = await contract.registerIdentity(
        formData.name,
        dateTimestamp,
        formData.physicalAddress,
        formData.nationality,
        formData.idNumber
      );

      await tx.wait();

      setSuccess(true);
      // Reset form after successful registration
      setFormData({
        name: '',
        dateOfBirth: '',
        physicalAddress: '',
        nationality: '',
        idNumber: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register identity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-registration-form">
      <h2>Identity Registration</h2>
      {success && (
        <div className="success-message">
          Identity registered successfully!
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="physicalAddress">Physical Address</label>
          <textarea
            id="physicalAddress"
            name="physicalAddress"
            value={formData.physicalAddress}
            onChange={handleChange}
            placeholder="Enter your physical address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nationality">Nationality</label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="Enter your nationality"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="idNumber">ID Number</label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            placeholder="Enter your 16-character ID number"
            maxLength="16"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Identity'}
        </button>
      </form>
    </div>
  );
};

export default IdentityRegistrationForm;