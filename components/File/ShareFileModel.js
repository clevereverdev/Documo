// ShareFileModal.js
import React, { useState, useContext, useEffect } from 'react';
import { RiUserSharedFill } from "react-icons/ri";
import { useAuth } from "../../firebase/auth";
import { UserAvatarContext } from '../../context/UserAvatarContext';
import { FaEye, FaEyeSlash, FaLock, FaTimes } from "react-icons/fa";
import Image from 'next/image';

function ShareFileModal({ isOpen, onClose, onShare, file }) {
    const [shareWith, setShareWith] = useState('');
    const [permission, setPermission] = useState('viewer'); // Default to viewer
    const { authUser } = useAuth();
    const { userAvatar } = useContext(UserAvatarContext);
    const [key, setKey] = useState(0); // Added state to force re-render
    const [password, setPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSensitive, setIsSensitive] = useState(false); // Add this line
    const [inputShake, setInputShake] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showError, setShowError] = useState(false);

    const changeAvatar = (newAvatar) => {
    localStorage.setItem('userAvatar', newAvatar);
    setUserAvatar(newAvatar); // Update state
    };


    const handlePasswordSubmit = async () => {
      if (password === file.password) {
        setInputShake(false);
        setShowError(false);
        setIsPasswordVerified(true);
      } else {
        setErrorMessage("Incorrect password.");
        setShowError(true);
        setInputShake(true);
        setTimeout(() => setInputShake(false), 820); // the duration of the shake animation
      }
    };

  const handleSubmit = () => {
    console.log("Sharing with:", shareWith, "Permission:", permission);
      if (file.sensitive && !isPasswordVerified) {
          handlePasswordSubmit();
      } else {
          onShare(shareWith, permission, isPasswordVerified);
          onClose();
      }
  };
  // Reset the modal state when it's closed or opened
  useEffect(() => {
      if (!isOpen) {
          setShareWith('');
          setPassword('');
          setIsPasswordVerified(false);
          setErrorMessage('');
      }
      if (file) {
        setIsSensitive(file.sensitive);
    }
  }, [isOpen]);

  useEffect(() => {
    if (file) {
        setIsSensitive(file.sensitive);
        // Additional logic if needed when file is set
    }
}, [file]);


      useEffect(() => {
        setKey(prevKey => prevKey + 1);
      }, [userAvatar]);
    
    
    // Assuming file has properties like name and imageUrl
    const fileName = file ? file.name : 'No file selected'; // Default text if file is not provided
   // Define the path to the default image for unknown file types
// Define the path to the default image for unknown file types
const defaultFileImage = '/default.png';

// Map file extensions to corresponding images
const getFileImage = (extension) => {
    if (extension) {
      switch (extension.toLowerCase()) {
        case 'pdf':
          return '/pdf.png';
        case 'zip':
          return '/zip.png';
        case 'csv':
          return '/csv.png';
        case 'txt':
          return '/txt.png';
        case 'mp3':
          return '/mp3.png';
        default:
          return defaultFileImage; // Use the default image for unknown file types
      }
    }
    return defaultFileImage; // Use the default image if extension is undefined
  };

// Determine the image source based on the file extension
const fileExtension = file?.name?.toLowerCase()?.split('.')?.pop();
const imageSrc = getFileImage(fileExtension);
const displayImageSrc = ['pdf', 'zip', 'csv', 'txt', 'mp3'].includes(fileExtension)
  ? imageSrc
  : file?.imageUrl || defaultFileImage; // Use the default image for unknown file types if file.imageUrl is not defined
  
// File name length
const truncateFileName = (name, length = 35) => {
    if (name.length > length) {
      return `${name.substring(0, length)}...`;
    }
    return name;
  };

  if (!file) {
    return null; // Don't render if file is not available
  }
  

  return (
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
        <div className="modal-content bg-[#201c1c] p-5 rounded-2xl shadow-lg z-50 relative w-[450px] h-[500px] flex flex-col items-center">
          <div className="absolute text-sm flex items-center justify-center top-4 right-4 hover:bg-gray-700 h-6 w-6 rounded-full">
            <FaTimes onClick={onClose} className="text-gray-400 cursor-pointer" />
          </div>
  
          {file.sensitive && !isPasswordVerified ? (
          <div className={`flex flex-col items-center justify-center ${inputShake ? 'shake' : ''}`}>
          <img src='./Lockedshare.png' alt="Locked Share" className="rounded-full w-[200px] h-[160px]" />
<span className='text-[15px] text-white font-bold'><span className='text-red-500 font-bold font-Payton text-lg '>WARNING!!</span> Sharing sensitive files at your own risk.</span>
<span className='text-xs text-gray-400 mb-7'>Dont't expose confidential information to unauthorized access.</span>
          {/* Password input field */}
           {/* Container for input and icons */}
        <div className="relative w-80"> 
        <span className="absolute top-4 left-4">
                 <FaLock className="text-gray-400" />
             </span>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter file password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white mb-4 pr-10"
        />
        {/* Toggle password visibility */}
        <div
                 className="absolute top-4 right-4 cursor-pointer"
                 onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
        </div>
        </div>

         {/* Error message */}
         {file.sensitive && showError && <div className="text-red-500 m-7">{errorMessage}</div>}

        {/* Verify button */}
        <button className="w-80 rounded-2xl bg-[#3EA88B] text-white p-4 transform transition-transform hover:bg-[#53B499]"
        onClick={handlePasswordSubmit}>Confirm</button>
      </div>
    ) : (
            <>
              {/* Image and File Name */}
              <div className="flex items-center space-x-2 mb-4">
                <img src={displayImageSrc} alt="File" className="h-12 w-12 bg-gray-600 p-1 rounded-lg" />
                <span className="text-gray-300 font-bold text-lg">{truncateFileName(fileName)}</span>
              </div>
              <div className="text-gray-300 text-lg font-bold mb-2">
                <div className="text-xs text-gray-400">
                  <span className="font-Payton text-green-500 text-md">MAKE IT EASY!</span> Share with friends and family
                </div>
              </div>
  
              {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
  
              <div className="w-full flex flex-col items-center mt-[2px]">
                {/* Share with friends Text */}
                <div className="relative mt-2 flex flex-col items-center">
                  <span className="absolute top-5 left-5">
                    <RiUserSharedFill className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Add username or email"
                    value={shareWith}
                    onChange={(e) => setShareWith(e.target.value)}
                    className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white"
                  />
  
                  {/* User info and permission selector */}
                  <h2 className="font-bold text-white text-[13px] mt-3 mr-[200px]">People with access</h2>
                  <div className="flex items-start justify-between mt-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <Image src={userAvatar} width={40} height={40} alt="User Avatar" className="rounded-full" />
                      </div>
                      <div className="flex flex-col justify-center m-[-2px]">
                        <span className="font-bold text-md">{authUser.username} (you)</span>
                        <span className="text-gray-500 text-xs">{authUser.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center ml-20 mt-2">
                      <span className="text-gray-500 text-xs">Owner</span>
                    </div>
                  </div>
  
                  {/* General access info */}
                  <h2 className="font-bold text-white text-[13px] mt-4 mr-[230px]">General access</h2>
                  <div className="flex items-start justify-between mt-2">
                    <div className="flex-shrink-0 mr-3">
                      <img src="./share.png" width={45} height={45} alt="User Avatar" className="rounded-full" />
                    </div>
  
                    <div className="flex flex-col justify-center m-[-2px]">
                      <span className="font-bold text-md">Permission set-up</span>
                      <span className="text-gray-500 text-xs">Share with loved ones</span>
                    </div>
                    <div className="ml-7 mt-1">
                      <select
                        value={permission}
                        onChange={(e) => setPermission(e.target.value)}
                        className="select select-primary p-2 w-[90px]"
                      >
                        <option disabled>How you want to send?</option>
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>
                  </div>
                </div>
  
                {/* Buttons */}
                <div className="flex space-x-2 mt-8">
                  <button
                    className="w-40 rounded-2xl bg-[#3EA88B] text-white p-4 hover:bg-[#53B499]"
                    onClick={handleSubmit}
                  >
                    Share
                  </button>
                  <button
                    className="w-40 rounded-2xl bg-[#EE4B2B] text-white p-4 hover:bg-[#E97451]"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );  
}
export default ShareFileModal;
