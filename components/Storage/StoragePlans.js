// StoragePlans.js
import React, { useState } from 'react';
import StoragePayment from './StoragePayment'; // Assume this component exists

const plans = [
  { name: 'Basic', price: '0.99', storage: '2MB' },
  { name: 'Plus', price: '4.99', storage: '5GB' },
  { name: 'Best', price: '9.99', storage: '15GB' },
  { name: 'Pro', price: '19.99', storage: '500GB' }
];

const StoragePlans = ({ onClose, onStorageUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Function to handle selection of a plan
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan); // Set the selected plan and open the payment details
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

  // const onClose = () => {
  //   setSelectedPlan(null);
  // };
  

  return (
    <div style={{
      position: 'fixed',
      top: '1%',
      left: 0,
      right: 0,
      width: '100%',
      margin: 'auto',
      height: '100vh',
      backgroundColor: '#36454F',
      zIndex: 1000,
      overflowY: 'auto',
      borderRadius: '40px 40px 0 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: '2rem',
    }}>
      <button className='bg-white rounded-full p-2 w-12 h-12 text-2xl' onClick={onClose}>✕</button>
      <h1 className='text-center text-white text-3xl font-bold mb-6'>New Storage Plans</h1>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '1200px',
      }}>
        {plans.map((plan, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            margin: '1rem',
            padding: '1rem',
            width: 'calc(25% - 2rem)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h2>{plan.name}</h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${plan.price}/mo*</p>
            <p>{plan.storage} Storage</p>
            <button style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              margin: '10px 0',
              borderRadius: '5px',
              cursor: 'pointer',
              
            }}
            onClick={() => handleSelectPlan(plan)}
            >
              Select
            </button>
          </div>
        ))}
      </div>
      {selectedPlan && (
        <StoragePayment
          selectedPlan={selectedPlan}
          onUpdateStorage={(storageSize) => {
            onStorageUpdate(storageSize);
            setSelectedPlan(null); // Close payment details after updating storage
          }}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};

export default StoragePlans;
