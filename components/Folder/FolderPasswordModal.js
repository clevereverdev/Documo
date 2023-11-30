import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaTimes, FaUserAlt } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { PiFileLock } from "react-icons/Pi";
import { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";

function FolderPasswordModal({ show, onClose, onSubmit, isUnlocking, onIncorrectPassword, isPasswordIncorrect, passwordError, folderId }) {
  const [password, setPassword] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [folder, setFolder] = useState(null); // Initialize with null or an appropriate default value
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [error, setError] = useState('');
  const [inputShake, setInputShake] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetCode, setResetCode] = useState(new Array(6).fill(''));
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState('request'); // 'request', 'enterCode', 'newPassword'
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const [showForgotPasswordInput, setShowForgotPasswordInput] = useState(false); // Track if the input should be shown
  const [showError, setShowError] = useState(false);

  const db = getFirestore(app);

  const handleForgotPasswordClick = async () => {
    setShowError(false); // Hide any previous error messages
    try {
      const userEmail = await fetchUserEmail(userIdentifier);
      if (userEmail) {
        const generatedResetCode = generateResetCode();
        setResetCode(generatedResetCode); // Store the code temporarily in the state
        const emailSent = await sendResetCodeByEmail(userEmail, generatedResetCode);
        if (emailSent) {
          setResetStep('enterCode'); // Move to the step where the user enters the code
          console.log('CODE IS:',generatedResetCode)
        } else {
          setError("Failed to send reset code to email.");
          setShowError(true); // Hide any previous error messages

        }
      } else {
        setError("Incorrect Email or Password");
        setShowError(true); // Hide any previous error messages

      }
    } catch (error) {
      setError("Error processing request.");
      setShowError(true); // Hide any previous error messages

    }
  };

  const handleResetCodeSubmit = async () => {
    setShowError(false); // Hide any previous error messages
    if (resetCodeInput === resetCode) {
      setResetStep('newPassword'); // Move to the step where the user can enter a new password
    } else {
      setError("Incorrect reset code.");
      setShowError(true); // Show error message

    }
  };


  const handleNewPasswordSubmit = async () => {
    setShowError(false);
    try {
        // Ensure folderId is available
        if (!folderId) {
            console.error("Folder ID is not available");
            setError("Folder ID is unavailable");
            setShowError(true);
            return;
        }

        // Use folderId to reference the folder
        const folderRef = doc(db, "Folders", folderId);
        await updateDoc(folderRef, {
            password: newPassword,
        });

        setShowToastMsg("Password updated successfully.");
        onClose(); // Close the modal
    } catch (error) {
        console.error("Error updating password:", error);
        setError("Failed to update password.");
        setShowError(true);
    }
};
const handleSubmit = async () => {
  setError('');
  setInputShake(false);

  if (isUnlocking) {
      if (folder && password !== folder.password) {
          setError('Wrong password.');
          onIncorrectPassword(); // Trigger the shake effect
          // Keep the modal open. Do not close here.
      } else {
          onSubmit(password, isUnlocking); // Submit the correct password
          setTimeout(() => onClose(), 1000); // Close the modal after a delay
      }
  } else {
      if (password !== verifyPassword) {
          setError('Passwords do not match.');
          onIncorrectPassword(); // Trigger the shake effect
          // Keep the modal open. Do not close here.
      } else {
          onSubmit(password, isUnlocking); // Submit the new password
          setTimeout(() => onClose(), 1000); // Close the modal after a delay
      }
  }
};











  async function fetchUserEmail(usernameOrEmail) {
    // Determine if the provided identifier is an email
    const isEmail = usernameOrEmail.includes("@");
  
    try {
      if (isEmail) {
        // Query for a user document by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", usernameOrEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // If the email is unique, there should only be one document
          const userEmail = querySnapshot.docs[0].data().email;
          console.log("Fetched user email by email:", userEmail); // Log the fetched email
          return userEmail;
        }
      } else {
        // Query for a user document by username
        const userDocRef = doc(db, "users", usernameOrEmail);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userEmail = userDoc.data().email;
          console.log("Fetched user email by username:", userEmail); // Log the fetched email
          return userEmail;
        }
      }
  
      // If no user is found, log an error
      console.error("No user found with identifier:", usernameOrEmail);
      return null;
    } catch (error) {
      console.error("Error fetching user email:", error);
      return null;
    }
  }
  
  
  
  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  
  const sendResetCodeByEmail = async (email, resetCode) => {
    setShowError(false); // Hide any previous error messages
    const emailDetails = {
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`
    };
  
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailDetails),
      });
      const data = await response.json();
      return data.success; // Assuming your API returns a success status
    } catch (error) {
      console.error('Error sending reset code:', error);
      return false;
    }
  };
  
    if (!show) return null;
    const shakeClass = isPasswordIncorrect ? "shake-effect" : "";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center`}>
    <div className="modal-content bg-[#201c1c] p-5 rounded-2xl shadow-lg z-50 relative w-[450px] h-[450px]">
      <div className="flex flex-col items-center m-3">
        <div className="absolute text-sm flex items-center justify-center top-4 right-4 hover:bg-gray-700 h-6 w-6 rounded-full">
          <FaTimes onClick={onClose} className="text-gray-400 cursor-pointer" />
        </div>
        <div className="text-gray-300 text-lg font-bold m-2">
      {isUnlocking ? 'Unlock Folder' : 'Keep your Folder locked'}
      <div className="text-xs text-gray-400">Your privacy is our first priority</div>
        </div>
        {passwordError && <div className="text-red-500">{passwordError}</div>}
        {showError && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {isUnlocking ? (
<>
  {resetStep === 'request' && !showForgotPasswordInput && (
    <div className={`relative`}>
     <span className="absolute top-5 left-12">
            <FaLock className="text-gray-400" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={'Enter password to unlock'}
            className={`ml-[35px] font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white mb-4 pr-10 ${shakeClass}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            className="absolute top-5 right-10 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
                <button className="text-blue-400 cursor-pointer ml-[220px] mb-2" onClick={() => setShowForgotPasswordInput(true)}>Forgot Password?</button>
          </div>
            )}

            {resetStep === 'enterCode' && (
              <>
             <div className="relative mb-4">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <MdOutlinePassword className="text-gray-400 cursor-pointer" />
      </span>
      <input
        type="text"
        placeholder="Enter reset code"
        className="w-80 ml-[35px]font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 rounded-2xl outline-none focus:border-white pr-10" /* Adjusted classes */
        value={resetCodeInput}
        onChange={(e) => setResetCodeInput(e.target.value)}
      />
    </div>
    <div className="flex space-x-4">
      <button 
        className="w-80 rounded-2xl bg-[#1F51FF] text-white p-4 transform transition-transform hover:bg-[#4169E1]"
        onClick={handleResetCodeSubmit}
      >
        Submit Code
      </button>
    </div>
  </>
)}

{resetStep === 'newPassword' && (
  <>
      <span className="absolute top-[112px] left-[83px]">
        <RiLockPasswordFill className="text-gray-400 cursor-pointer" />
      </span>
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter new password"
        className="ml-[5px] font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white mb-4 pr-10"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
       <div
            className="absolute top-[110px] right-[75px] cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
     
    <div className="flex space-x-4">
      <button
        className="w-80 rounded-2xl bg-[#1F51FF] text-white p-4 transform transition-transform hover:bg-[#4169E1]"
        onClick={handleNewPasswordSubmit}
      >
        Set New Password
      </button>
    </div>
  </>
)}

            {showForgotPasswordInput && resetStep === 'request' && (
             <>
             <div className="relative mb-4">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <FaUserAlt className="text-gray-400 cursor-pointer" />
      </span>
      <input
        type="text"
        placeholder="Enter Email or Username"
        className="w-80 ml-[35px]font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 rounded-2xl outline-none focus:border-white pr-10" /* Adjusted classes */
        value={userIdentifier}
        onChange={(e) => setUserIdentifier(e.target.value)}
        />
    </div>
    <div className="flex space-x-4">
      <button 
        className="w-80 rounded-2xl bg-[#1F51FF] text-white p-4 transform transition-transform hover:bg-[#4169E1]"
        onClick={handleForgotPasswordClick}
      >
       Send Code
      </button>
    </div>
  </>
            )}
          </>
        ) : (
          <>
            <div className="relative mt-3">
            <span className="absolute top-5 left-3">
              <FaLock className="text-gray-400" />
            </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Set a password"
                className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white mb-4 pr-10"                
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
            className="absolute top-5 right-10 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
            </div>

            <div className="relative">
            <span className="absolute top-5 left-3">
            <PiFileLock className="text-gray-400" />
            </span>
              <input
                type={showVerifyPassword ? 'text' : 'password'}
                placeholder="Verify password"
                className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white mb-4 pr-10"                
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
              <div
            className="absolute top-5 right-10 cursor-pointer"
            onClick={() => setShowVerifyPassword(!showVerifyPassword)}
          >
            {showVerifyPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
            </div>
          </>
        )}

{  (isUnlocking || (!isUnlocking && resetStep === 'request')) && !showForgotPasswordInput && (
          <div className="flex space-x-4">
            <button 
              className="w-80 rounded-2xl bg-[#1F51FF] text-white p-4 transform transition-transform hover:bg-[#4169E1]"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default FolderPasswordModal;
