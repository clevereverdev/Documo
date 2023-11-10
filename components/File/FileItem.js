import moment from "moment";
import React, { useContext, useState, useEffect, useRef } from "react";
import { BsFillTrashFill, BsFillPencilFill, BsStarFill, BsStar } from 'react-icons/bs';
import { FaDownload } from 'react-icons/fa';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import defaultFileImage from '../../public/zip.png';
import { useNotifications } from '../../context/NotificationContext';
import { UserAvatarContext } from '../../context/UserAvatarContext';
import Image from 'next/image';
import { useFileActions, useFileRename } from "../File/UseFileActions";


import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from "../../firebase/auth";


function ResetModal({ show, onClose, onResetSubmit }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Reset Password</h2>
        <input
          type="text"
          placeholder="Enter the 6-digit code"
          value={enteredCode}
          onChange={(e) => setEnteredCode(e.target.value)}
          className='text-white'
        />
        <input
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className='text-white'
        />
        <button className='bg-white text-black' onClick={() => onResetSubmit(enteredCode, newPassword)}>Submit</button>
        <button className='bg-white text-black' onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}





function FileItem({ file, onFileImageClick, onToggleStar, index, isTrashItem, onRestore, onDeleteForever }) {

  const db = getFirestore(app);
  const { authUser } = useAuth(); // Get the authenticated user
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const { addNotification } = useNotifications();
  const { deleteFile, toggleStar, downloadFile, renameFile, lockFile, unlockFile } = useFileActions();
  const { isRenaming, newName, handleRenameClick, handleNameChange, handleKeyDown, handleRenameSubmit } = useFileRename(file, renameFile);
  const [starred, setStarred] = useState(file.starred);


  const { userAvatar } = useContext(UserAvatarContext);
  const changeAvatar = (newAvatar) => {
    localStorage.setItem('userAvatar', newAvatar);
    setUserAvatar(newAvatar); // Update state
  };

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCode, setResetCode] = useState(null);


  const [key, setKey] = useState(0); // Added state to force re-render
  const [currentFile, setCurrentFile] = useState(null);


  // Whenever the userAvatar changes, we change the key to force re-render
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [userAvatar]);



  const handleToggleStar = async () => {
    if (onToggleStar) {
      await onToggleStar(file);
      setStarred(!starred);
    }
  };

  const handleFileActionClick = (selectedFile) => {
    setCurrentFile(selectedFile);
    handleRenameClick();  // Move the handleRenameClick here after setting currentFile
  };


  // Function to handle the lock action
  const handleLock = async () => {
    // Prompt the user to set a password if it doesn't exist
    if (!file.password) {
      const password = prompt("Set a password for this file:");
      if (password) {
        try {
          // Save the password to the database
          const fileRef = doc(db, "files", file.id.toString());
          await updateDoc(fileRef, {
            password: password,
            sensitive: true // Mark the file as sensitive
          });
          setShowToastMsg("File locked successfully.");
          // Here you can update the local state to reflect the locked status
        } catch (error) {
          console.error("Error locking file:", error);
          setShowToastMsg("Failed to lock file.");
        }
      }
    } else {
      setShowToastMsg("File is already locked.");
    }
  };

  const sendEmailNotification = async (emailDetails) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailDetails),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendResetCodeByEmail = async (email, resetCode) => {
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
      console.log(data.message);
      return data.success; // Assuming your API returns a success status
    } catch (error) {
      console.error('Error:', error);
      return false; // Indicate failure
    }
  };

  const handleUnlock = async () => {
    const enteredPassword = prompt("Enter password to unlock or type 'reset' to reset your password:");

    if (enteredPassword === 'reset') {
      // Generate and send reset code via email
      const generatedResetCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResetCode(generatedResetCode); // Save the generated code in the state
      const emailSent = await sendResetCodeByEmail(authUser.email, generatedResetCode);
      if (emailSent) {
        setShowResetModal(true); // Show the reset modal
      } else {
        setShowToastMsg("Failed to send reset code. Please try again later.");
      }
    } else if (enteredPassword === file.password) {
      try {
        // Make sure file.id is a string, as Firestore expects a string path
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
          password: null,
          sensitive: false
        });
        console.log("File password is:", file.password);

        // Provide feedback to the user
        setShowToastMsg("File unlocked successfully.");

        // Refresh the file list or update state/context to reflect the change
      } catch (error) {
        console.error("Error unlocking file:", error);
        setShowToastMsg("Failed to unlock file.");
      }
    } else {
      alert("Incorrect password!");
    }
  };
  const handleResetSubmit = async (enteredCode, newPassword) => {
    if (enteredCode === resetCode) {
      // Update the password in Firestore
      const fileRef = doc(db, "files", file.id.toString());
      await updateDoc(fileRef, {
        password: newPassword,
      });
      setShowToastMsg("Password has been reset successfully.");
      setShowResetModal(false); // Close the modal
      setResetCode(null); // Clear the stored reset code
    } else {
      setShowToastMsg("Incorrect code entered.");
    }
  };




  // Format File Size
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 ** 2) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(2)} MB`;
    else return `${(size / 1024 ** 3).toFixed(2)} GB`;
  };

  // File name length
  const truncateFileName = (name, length = 25) => {
    if (name.length > length) {
      return `${name.substring(0, length)}...`;
    }
    return name;
  };

  // Map file extensions to corresponding images
  const getFileImage = (extension) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return '/pdf.png';
      case 'zip':
        return '/zip.png';
      default:
        return defaultFileImage; // Default image for unknown file types
    }
  };

  // Determine the image source based on the file extension
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const imageSrc = getFileImage(fileExtension);
  const displayImageSrc = ['pdf', 'zip'].includes(fileExtension)
    ? imageSrc
    : file.imageUrl;


  function getTimeLeft(deletedAt) {
    const deletedAtDate = new Date(deletedAt.seconds * 1000);
    // Add 30 days to deletedAtDate
    deletedAtDate.setDate(deletedAtDate.getDate() + 30);

    // Current date and time
    const now = new Date();

    // Check if the current date and time have passed the deletedAtDate
    if (now > deletedAtDate) {
      return "File deleted";
    } else {
      // Calculate the difference in milliseconds
      const timeDiff = deletedAtDate - now;

      // Convert milliseconds to days
      const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));



      if (daysLeft > 1) {
        return `${daysLeft} days left`;
      } else if (hoursLeft > 0) {
        return `${hoursLeft} hours left`;
      } else if (minutesLeft > 0) {
        return `${minutesLeft} minutes left`;
      } else {
        return `Less than a minute left`;
      }
    }
  }

  // Conditional rendering logic
  let actionButtons;
  if (isTrashItem) {
    actionButtons = (
      <div className="file-actions">
        <button className='bg-green-500 p-2 text-white rounded-lg mx-2 ' onClick={() => onRestore(file)}>Restore</button>
        <button className='bg-red-500 p-2 text-white rounded-lg' onClick={() => onDeleteForever(file)}>Delete Forever</button>
        <span className='text-blue-400 font-bold mx-2'>{getTimeLeft(file.deletedAt)}</span>
      </div>
    );
  } else {
    actionButtons = (
      <div className="file-actions group flex items-center justify-between">
        <div className="flex gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Tooltip
            showArrow={false}
            content="Starred"
            placement="bottom"
            className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg"
            arrowSize={0}
          >
            <div className="icon-wrapper p-3">
              {starred ? (
                <BsStarFill className="icon-fill" onClick={handleToggleStar} />
              ) : (
                <BsStar className="icon-outline" onClick={handleToggleStar} />
              )}
            </div>
          </Tooltip>
        </div>
        <Image src={userAvatar} width={30} height={30} alt="User Avatar" className="self-center ml-auto" />
        <div className="flex gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600">
                <MoreHorizIcon className="text-gray-300 text-2xl" />
              </button>
            </DropdownTrigger>
            <DropdownMenu className='bg-black w-[180px] h-[225px] rounded-xl'>
              <DropdownSection title="Actions" className='text-lg font-semibold border-b border-gray-700 pb-2 font-Payton'>
                <DropdownItem
                  className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1'
                  onClick={() => handleFileActionClick(file)} // Only set isRenaming to true here
                >
                  Rename
                </DropdownItem>
                <DropdownItem
                  className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1'
                  onClick={() => downloadFile(file)}
                >
                  Download
                </DropdownItem>
                {file.sensitive ? (
                  <DropdownItem
                    className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1'
                    onClick={handleUnlock}
                  >
                    <LockOpenIcon className="mr-2" /> Unlock
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1'
                    onClick={handleLock}
                  >
                    <LockIcon className="mr-2" /> Lock
                  </DropdownItem>
                )}
              </DropdownSection>
              <DropdownItem
                className="text-red-500 hover:bg-red-300 rounded-xl text-sm my-4 p-1 mt-1"
                onClick={() => deleteFile(file)}
              >
                Delete file
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  }



  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[min-content,3fr,1.5fr,1fr,1fr,auto] gap-4 text-gray-400 items-center m-2 p-3 py-3 hover:bg-[#2a2929] rounded-md group">
        <div>{index}</div> {/* Display the index here */}
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center bg-inherit w-8 h-8" onClick={() => onFileImageClick(file)}>
            <Image
              src={displayImageSrc}
              alt={file.name}
              width={35}
              height={35}
            />
          </div>
          <div>
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  padding: "0.2rem",
                  paddingLeft: "0.4rem",
                }}
              />
            ) : (
              <span onDoubleClick={handleRenameClick} className="flex flex-col">
                <span className="truncate text-sm text-gray-300">{file.name}</span>
                <div className='flex'>
                  {file.sensitive && (
                    <>
                      <LockIcon style={{ fontSize: '12', paddingTop: '1px', color: '#1ED760' }} />
                      <button className="flex justify-center items-center text-white text-[7.5px] cursor-default bg-gray-600 p-1 w-3 h-3 rounded-sm">S</button>
                      <span className='text-xs ml-1'>locked</span>
                    </>
                  )}
                </div>
              </span>
            )}
          </div>
        </div>
        <div className="ml-5 text-sm">{moment(file.modifiedAt).format("MMM DD, YYYY")}</div>
        <div className="text-sm">{formatFileSize(file.size)}</div>
        <div className="ml-4 text-sm">{file.type || "Unknown"}</div>
        <div className="flex gap-2 cursor-pointer">
          {actionButtons}
        </div>
      </div>

      {showResetModal && (
        <ResetModal
          show={showResetModal}
          onClose={() => setShowResetModal(false)}
          onResetSubmit={handleResetSubmit}
        />
      )}
    </>
  );

}

export default FileItem;