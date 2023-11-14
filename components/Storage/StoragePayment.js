import React, { useState } from 'react';

const StoragePayment = ({ selectedPlan, onUpdateStorage, onClose }) => {
    const [cardInfo, setCardInfo] = useState({
      cardNumber: '',
      expirationDate: '',
      securityCode: '',
      country: 'United States',
      billingZip: ''
    });
  
    const handlePurchase = (event) => {
      event.preventDefault();
      // Check if the card number has 16 digits
      if(cardInfo.cardNumber.replace(/\s+/g, '').length === 16) {
        // Convert the selected plan's storage to bytes
        const additionalStorageBytes = convertToBytes(selectedPlan.storage);
        onUpdateStorage(additionalStorageBytes);
        onClose(); // Close the payment details
      } else {
        // Inform the user that the card number is invalid
        alert("Please enter a valid 16-digit credit card number.");
      }
    };
  
    // Utility function to convert storage string to bytes
    const convertToBytes = (storageString) => {
      const units = storageString.replace(/\d+/g, '');
      const value = parseFloat(storageString);
      const unitMultipliers = {
        'MB': 1024 ** 2,
        'GB': 1024 ** 3,
        // Add more units as needed
      };
      return value * (unitMultipliers[units] || 0);
    };
  
    // Update the state with the new card info
    const handleChange = (event) => {
      const { name, value } = event.target;
      setCardInfo(prevInfo => ({
        ...prevInfo,
        [name]: value
      }));
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        // Call handlePurchase here instead of onClick of the button
        handlePurchase();
      };



  return (
    <div style={{
      position: 'fixed',
      top: '5%',
      left: '5%',
      right: '5%',
      width: '90%',
      margin: 'auto',
      height: '90vh',
      backgroundColor: 'white',
      zIndex: 1000,
      overflowY: 'auto',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2rem',
    }}>
      <h1 className='text-center mb-6'>Enter Payment Details</h1>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Form fields go here */}
        <label htmlFor="cardNumber">Card number</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          required
          maxLength="19" // Including spaces for a typical 16-digit card format
          pattern="\d{4} \d{4} \d{4} \d{4}" // Simple pattern for a 16-digit card number with spaces
          value={cardInfo.cardNumber}
          onChange={handleChange} />
        
        {/* Submit button */}
        <button type="submit" style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          margin: '10px 0',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handlePurchase}>
          Purchase
        </button>
      </form>
      
      <button className='rounded-full p-2 w-12 h-12 text-2xl' onClick={onClose}>✕</button>
    </div>
  );
};

export default StoragePayment;
