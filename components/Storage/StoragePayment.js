import React, { useState } from 'react';
import { doc, updateDoc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../firebase/firebase'; 
import { useAuth } from "../../firebase/auth"; // Import your useAuth hook

const StoragePayment = ({ selectedPlan, onUpdateStorage, onClose }) => {
  const { authUser } = useAuth();
  const db = getFirestore(app); // Make sure 'app' is your Firebase app instance

  const [cardInfo, setCardInfo] = useState({
    email: '',
    cardNumber: '',
    expirationDate: '',
    cvc: '',
    cardHolderName: '',
    country: 'United States',
    zip: ''
  });
  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({
    email: false,
    cardNumber: false,
    cardholdername: false,
    expDate: false,
    cvc: false,
    country: false,
    zip: false
  });

  const handlePurchase = async () => {
    // Check if all required fields are filled and the credit card number is valid
    if (isFormValid() && isCardNumberValid(cardInfo.cardNumber)) {
      const additionalStorageBytes = convertToBytes(selectedPlan.storage);
      onUpdateStorage(additionalStorageBytes);
      if (!authUser?.username) {
        console.error('No user id available to update storage plan.');
        alert('Unable to update the plan. User is not identified.');
        return;
      }
  
      const userDocRef = doc(db, 'users', authUser.username);
  
      try {
        // Check if the user's document exists
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          // If it doesn't exist, create it with the initial plan details
          await setDoc(userDocRef, {
              name: selectedPlan.name
          });
        } else {
          // If it exists, update the plan name within the plan subfield
          await updateDoc(userDocRef, {
            'plan.name': selectedPlan.name,
          });
        }
  
        console.log("User's plan updated successfully to:", selectedPlan.name);
        onClose(); // Close the payment details only after the update is successful
      } catch (error) {
        console.error("Error updating user's plan:", error);
        alert("Error updating the plan. Please try again.");
      }
    } else {
      alert("Please fill in all the required fields and enter a valid 16-digit credit card number.");
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

  // Function to check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = ['cardNumber', 'expirationDate', 'cvc', 'cardholdername', 'country', 'zip'];
    return requiredFields.every(fieldName => cardInfo[fieldName].trim() !== '');
  };

  // Function to validate the credit card number
  const isCardNumberValid = (cardNumber) => {
    const sanitizedCardNumber = cardNumber.replace(/\s+/g, ''); // Remove spaces
    return /^\d{16}$/.test(sanitizedCardNumber); // Check for exactly 16 digits
  };


  const handleChange = (event) => {
    const { name, value } = event.target;
    setCardInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));

    // Clear errors as the user types
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };
 

  const inputStyle = (name) => ({
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: `1px solid ${errors[name] ? 'red' : '#ddd'}`
  });


  // Handle the onBlur event to check if the input is empty
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };
  const isFieldTouched = (fieldName) => touched[fieldName];
  const isFieldEmpty = (fieldName) => isFieldTouched(fieldName) && !cardInfo[fieldName];

  const getBorderStyle = (fieldName) => ({
    border: `4px solid ${isFieldEmpty(fieldName) ? '#f44336' : '#ccc'}`,
    borderRadius: '4px',
  });

  const sectionStyle = {
    flex: 1,
    backgroundColor: 'white',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
  };

  const dividerStyle = {
    borderLeft: '1px solid #eee',
    boxShadow: '10px 0 8px -12px rgba(0, 0, 0, 0.5)',
  };

  const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    padding: '0.5rem', // Add some padding inside the border
    borderColor: 'black',
    borderWidth: '1px',
    borderStyle: 'solid',
    transition: 'transform 0.3s ease', // Transition for the hover effect
  };
  
  const featureItemHoverStyle = {
    transform: 'translateY(-5px)', // Adjust the Y translation to your liking
  };



  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      maxWidth: '1460px',
      height: '100vh',
      backgroundColor: '#212121',
      zIndex: 1000,
      overflowY: 'auto',
      borderTopLeftRadius: '40px',
      borderTopRightRadius: '40px',
      display: 'flex',
      flexDirection: 'row',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Selected Plan: <span className='bg-black rounded-md h-10 w-30 p-2 text-yellow-300 font-bold'>{selectedPlan.name}</span></h2>
        <p className='text-3xl font-Payton' style={{ color: '#555', marginBottom: '1rem' }}>Total Price</p>
        <p className='text-3xl font-Payton text-green-500'>${selectedPlan.price} <span className='text-sm font-Payton text-gray-500'>/ month</span></p>
        {/* Features container */}
      <div style={{
        border: '1px solid black',
        width: '350px',
        transition: 'transform 0.3s ease',
        ':hover': {
          transform: 'translateY(-5px)',
        },
        margin: '15px'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
      >
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {selectedPlan.features.map((feature, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem' }}>
              <span style={{ color: '#2196f3', marginRight: '0.5rem' }}>✔️</span>
              <span className='text-black'>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      </div>
      {/* Divider */}
      <div style={dividerStyle} />

      <div style={{ ...sectionStyle, backgroundColor: '#ffffff' }}>
        <h1 className='text-center mb-6'>Enter Payment Details</h1>
  
        {/* Payment form */}
        <form onSubmit={handlePurchase} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button type="button" className='flex justify-center items-center bg-black text-white p-3 w-[60%] mb-3 rounded-md text-lg'>
             <span className='font-Payton text-md'>Pay</span>
          </button>

          {/* Email */}
          <label className="w-[60%] text-left font-bold mt-2 text-[#757575]">Email</label>
        <div className="relative my-3 w-[60%]" style={{ border: getBorderStyle('email'), borderRadius: '4px' }}>
        <input
          type="email"
          name="email"
          placeholder={isFieldTouched('email') && !cardInfo.email ? '' : 'Email Address'}
          value={cardInfo.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`font-medium border bg-inherit ${isFieldEmpty('email') ? 'border-red-500 shadow-md' : 'border-[#374151] shadow-md' } pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
          style={{ transition: 'all 0.2s' }}
        />
        {isFieldEmpty('email') && (
          <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
        )}
      </div>


    <div className="w-[60%]">
    <label className="text-left font-bold mt-2 text-[#757575]">Payment Information</label>
    <div className="relative my-3" style={{ border: getBorderStyle('cardNumber'), borderRadius: '4px' }}>
      <input
        type="text"
        name="cardNumber"
        placeholder={isFieldTouched('cardNumber') && !cardInfo.cardNumber ? '' : '1234 1234 1234 1234'}
        value={cardInfo.cardNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        className={`font-medium border bg-transparent ${isFieldEmpty('cardNumber') ? 'border-red-500' : 'border-[#374151]'} pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
        style={{ transition: 'all 0.2s' }}
      />
      {isFieldEmpty('cardNumber') && (
        <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
      )}
    </div>
  </div>

  {/* Expiration Date and CVV */}
  <div className="w-[60%]">
    <div className="flex">
      {/* Expiration Date */}
      <div className="w-1/2 pr-2">
        <div className="relative my-3" style={{ border: getBorderStyle('expirationDate'), borderRadius: '4px' }}>
          <input
            type="text"
            name="expirationDate"
            placeholder={isFieldTouched('expirationDate') && !cardInfo.expirationDate ? '' : 'MM/YY'}
            value={cardInfo.expirationDate}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`font-medium border bg-transparent ${isFieldEmpty('expirationDate') ? 'border-red-500' : 'border-[#374151]'} pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
            style={{ transition: 'all 0.2s' }}
          />
          {isFieldEmpty('expirationDate') && (
            <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
          )}
        </div>
      </div>

      {/* CVV */}
      <div className="w-1/2 pl-2">
        <div className="relative my-3" style={{ border: getBorderStyle('cvc'), borderRadius: '4px' }}>
          <input
            type="text"
            name="cvc"
            placeholder={isFieldTouched('cvc') && !cardInfo.cvc ? '' : 'CVV'}
            value={cardInfo.cvc}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`font-medium border bg-transparent ${isFieldEmpty('cvc') ? 'border-red-500' : 'border-[#374151]'} pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
            style={{ transition: 'all 0.2s' }}
          />
          {isFieldEmpty('cvc') && (
            <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
          )}
        </div>
      </div>
    </div>
    </div>

    {/* Card Holder Name */}
    <label className="w-[60%] text-left font-bold mt-2 text-[#757575]">Cardholder name</label>
        <div className="relative my-3 w-[60%]" style={{ border: getBorderStyle('cardholdername'), borderRadius: '4px' }}>
        <input
          type="text"
          name="cardholdername"
          placeholder={isFieldTouched('cardholdername') && !cardInfo.cardholdername ? '' : 'Full Name on the card'}
          value={cardInfo.cardholdername}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`font-medium border bg-transparent ${isFieldEmpty('cardholdername') ? 'border-red-500 shadow-md' : 'border-[#374151] shadow-md' } pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
          style={{ transition: 'all 0.2s' }}
        />
        {isFieldEmpty('cardholdername') && (
          <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
        )}
      </div>
      {/* Country and ZIP */}
  <div className="w-[60%] mt-3">
    <div className="flex">
      {/* Country */}
      <div className="w-1/2 pr-2">
        <label className="text-left font-bold mt-2 text-[#757575]">Country</label>
        <select
          name="country"
          value={cardInfo.country}
          onChange={handleChange}
          required
          className={`font-medium border bg-transparent ${isFieldEmpty('country') ? 'border-red-500' : 'border-[#374151]'} pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
          style={{ transition: 'all 0.2s' }}
        >
          <option value="United States">United States</option>
          <option value="India">India</option>
          <option value="Canada">Canada</option>
        </select>
        {isFieldEmpty('country') && (
          <span className="absolute right-5 top-0 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
        )}
      </div>

      {/* ZIP */}
      <div className="w-1/2 pl-2">
        <label className="text-left font-bold mt-2 text-[#757575]">ZIP</label>
        <input
          type="text"
          name="zip"
          placeholder={isFieldTouched('zip') && !cardInfo.zip ? '' : 'ZIP Code'}
          value={cardInfo.zip}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`font-medium border bg-transparent ${isFieldEmpty('zip') ? 'border-red-500' : 'border-[#374151]'} pl-5 pr-2 w-[100%] py-4 rounded-md outline-0 hover:border-[#53B499] cursor-pointer`}
          style={{ transition: 'all 0.2s' }}
        />
        {isFieldEmpty('zip') && (
          <span className="absolute right-[173px] bottom-45 text-[#f44336] text-sm" style={{ marginTop: '2px' }}>REQUIRED</span>
        )}
      </div>
    </div>
  </div>

      </form>
      <button
          type="submit"
          className='bg-[#007bff] rounded-md w-[60%] p-4 text-white font-Payton m-5' 
          onClick={handlePurchase} // Trigger the handlePurchase function
          >
            Purchase
        </button>
      </div>
      
      <button className='rounded-md p-2 m-4 w-30 h-10 text-lg text-black bg-yellow-600 font-Payton flex items-center' onClick={onClose} style={{
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        border: 'none',
        cursor: 'pointer'
      }}>Back</button>
    </div>
  );
  };
  export default StoragePayment;
  

