import moment from "moment";
import React, { useContext, useState, useEffect, useRef } from "react";
import { BsFillTrashFill, BsFillPencilFill, BsStarFill, BsStar } from 'react-icons/bs';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import defaultFileImage from '../../public/zip.png';
import { useNotifications } from '../../context/NotificationContext';
import { UserAvatarContext } from '../../context/UserAvatarContext';
import Image from 'next/image';
import { useFileActions, useFileRename } from "../File/UseFileActions";
import { onSnapshot } from "firebase/firestore";
import { MdOutlineDriveFileRenameOutline, MdRestore } from "react-icons/md";
import { FaDownload, FaTrash, FaShare } from "react-icons/fa6";
import PasswordModal from './PasswordModal'; // Import the PasswordModal component
import ShareFileModal from 'components/File/ShareFileModel';


import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from "../../firebase/auth";

function FileItem({ file, onFileImageClick, onToggleStar, index, isTrashItem, onRestore, onDeleteForever, onRename, isSharedContext }) {

  const db = getFirestore(app);
  const { authUser } = useAuth(); // Get the authenticated user
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const { addNotification } = useNotifications();
  const { deleteFile, toggleStar, downloadFile, renameFile, lockFile, unlockFile } = useFileActions();
  const { isRenaming, newName, handleRenameClick, handleNameChange, handleKeyDown, handleRenameSubmit } = useFileRename(file, async (file, newName) => {
    await renameFile(file, newName, (fileId, updatedName) => {
      if (onRename) {
        onRename(fileId, updatedName); // This should update the parent's state
        console.log("UPDATED NAME", updatedName)
      }
    });
  });

  const [isSensitive, setIsSensitive] = useState(file.sensitive);
  const [afile, setFile] = useState(file);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const handleEditClick = async (file) => {
    const content = await fetchFileContent(file);
    setEditableContent(content);
    setIsEditing(true);
  };

  // Function to save the edited content
  const handleSaveEdit = async () => {
    await saveFileEdit(file, editableContent);
    setIsEditing(false);
  };

  useEffect(() => {
    setStarred(file.starred);
  }, [file.starred]);
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

  useEffect(() => {
    let unsubscribe;
  
    if (file && file.id) {
      const fileRef = doc(db, "files", file.id.toString());
      unsubscribe = onSnapshot(fileRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedFile = docSnapshot.data();
          setIsSensitive(updatedFile.sensitive);
          setFile(updatedFile); // Update state with the new file data
        }
      });
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe when the component is unmounted
      }
    };
  }, [file, db]);
  
  // Function to handle the lock action


  // const handleLock = async (password) => {
  //   const password = prompt("Set a password for this file:");
  //   if (password) {
  //     try {
  //       const fileRef = doc(db, "files", file.id.toString());
  //       await updateDoc(fileRef, {
  //         password: password,
  //         sensitive: true
  //       });
  //       setIsSensitive(true);
  //       setFile(previousFile => ({ ...previousFile, password: password })); // Update the password in local state
  //       setShowToastMsg("File locked successfully.");
  //       addNotification('image', {
  //         src: displayImageSrc,
  //         message: `File ${file.name} is locked successfully.`,
  //         name: file.name,
  //         isFile: true,
  //         isLocked: true
  //     }, file.id);
  //     } catch (error) {
  //       console.error("Error locking file:", error);
  //       setShowToastMsg("Failed to lock file.");
  //     }
  //   }
  // };

  // const sendEmailNotification = async (emailDetails) => {
  //   try {
  //     const response = await fetch('/api/send-email', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(emailDetails),
  //     });
  //     const data = await response.json();
  //     console.log(data.message);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  // const sendResetCodeByEmail = async (email, resetCode) => {
  //   const emailDetails = {
  //     to: email,
  //     subject: 'Your Password Reset Code',
  //     text: `Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`
  //   };

  //   try {
  //     const response = await fetch('/api/send-email', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(emailDetails),
  //     });
  //     const data = await response.json();
  //     console.log(data.message);
  //     return data.success; // Assuming your API returns a success status
  //   } catch (error) {
  //     console.error('Error:', error);
  //     return false; // Indicate failure
  //   }
  // };

  // const handleUnlock = async (password) => {
  //   const enteredPassword = prompt("Enter password to unlock or type 'reset' to reset your password:");

  //   // Instead of comparing with file.password, use the afile.password 
  //   // because afile is your state that reflects real-time changes.
  //   if (enteredPassword === 'reset') {
  //     // ... reset logic ...
  //   } else if (enteredPassword === afile.password) {
  //     try {
  //       const fileRef = doc(db, "files", file.id.toString());
  //       await updateDoc(fileRef, {
  //         password: null,
  //         sensitive: false
  //       });
  //       setIsSensitive(false);
  //       setFile(previousFile => ({ ...previousFile, password: null })); // This updates the local state
  //       setShowToastMsg("File unlocked successfully.");
  //       addNotification('image', {
  //         src: displayImageSrc,
  //         message: `File ${file.name} is unlocked successfully.`,
  //         name: file.name,
  //         isFile: true,
  //         isUnlocked: true
  //     }, file.id);
  //     } catch (error) {
  //       console.error("Error unlocking file:", error);
  //       setShowToastMsg("Failed to unlock file.");
  //     }
  //   } else {
  //     // If the password doesn't match, it means the local state is not up to date or the entered password is wrong.
  //     alert("Incorrect password!");
  //   }
  // };

  // const handleResetSubmit = async (enteredCode, newPassword) => {
  //   if (enteredCode === resetCode) {
  //     // Update the password in Firestore
  //     const fileRef = doc(db, "files", file.id.toString());
  //     await updateDoc(fileRef, {
  //       password: newPassword,
  //     });
  //     setShowToastMsg("Password has been reset successfully.");
  //     setShowResetModal(false); // Close the modal
  //     setResetCode(null); // Clear the stored reset code
  //   } else {
  //     setShowToastMsg("Incorrect code entered.");
  //   }
  // };
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
const [shareWithUser, setShareWithUser] = useState('');
const [fileToShare, setFileToShare] = useState(null);
const [editorFileUnsubscribe, setEditorFileUnsubscribe] = useState(null); // Initialize editorFileUnsubscribe

const openShareModal = (file) => {
  console.log("Opening share modal for file:", file);
  setFileToShare(file);
  setIsShareModalOpen(true);
};
  

  async function checkUserExists(usernameOrEmail) {
    console.log("Checking user exists for:", usernameOrEmail);
    let userExists = false;
    let userEmail = null;

    const isEmail = usernameOrEmail.includes("@");

    if (isEmail) {
      // Query for a user document by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", usernameOrEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming the email field is unique, there should only be one document
        userExists = true;
        userEmail = querySnapshot.docs[0].data().email; // This should be the same as usernameOrEmail
      }
    } else {
      // Query for a user document by username
      const userDocRef = doc(db, "users", usernameOrEmail);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        userExists = true;
        userEmail = userDoc.data().email;
      }
    }

    return { userExists, userEmail };
  }

  const handleShareFile = async (file, usernameOrEmail, permissionLevel, loggedInUserEmail, userDisplayName) => {
    console.log("handleShareFile called with:", file, usernameOrEmail, permissionLevel);
  
    try {
      // Check if the file is sensitive
      if (file.sensitive) {
        console.log("File is sensitive, checking password...");
        const enteredPassword = await promptForPassword(); // Implement this function as needed
        if (enteredPassword !== file.password) {
          alert("Incorrect password. You cannot share this file.");
          return;
        }
      }
  
      // Check if the user exists
      const { userExists, userEmail } = await checkUserExists(usernameOrEmail); // Retrieve the username
  
      console.log("User check:", userExists, userEmail);
  
      if (userExists) {
        if (permissionLevel === 'viewer' && file.createdBy !== loggedInUserEmail) {
          console.log("Preparing to share a copy for viewer...");
  
          // Create a new document in shared_files with a snapshot of the file's data
          const viewerFileData = {
            ...file,
            sharedBy: file.createdBy,
            sharedWith: userEmail, // Use the username instead of the email
            sensitive: false,
            password: null, // Remove sensitive information
            permission: permissionLevel,
          };
  
          const viewerFileRef = doc(collection(db, "shared_files"));
          await setDoc(viewerFileRef, viewerFileData);
          console.log("Viewer file copy created:", viewerFileRef.id);
          setShowToastMsg("File shared successfully!");

        } else if (permissionLevel === 'editor') {
          console.log("Preparing to share original file with editor...");
          
          const fileRef = doc(db, "files", file.id.toString());
          if (userExists) {
            await updateDoc(fileRef, {
              sharedWith: arrayUnion(userEmail),
              sharedBy: file.createdBy,
            });
          } else {
            console.error("userDisplayName is undefined or null.");
            // Handle this case appropriately, e.g., show an error message.
          }
  
          // Listen for changes in the shared file
          const unsubscribeEditorFile = onSnapshot(fileRef, (docSnapshot) => {
            const updatedFileData = docSnapshot.data();
            // Update the shared file in the state or wherever it's displayed
            // This update should trigger a re-render with the latest data
          });
  
          // Store the unsubscribe function for later cleanup
          setEditorFileUnsubscribe(unsubscribeEditorFile);
  
          console.log("Original file shared with editor:", userEmail);
          setShowToastMsg("File shared successfully!");
        }
      } else {
        console.log("User does not exist.");
        setShowToastMsg("User does not exist.");
      }
    } catch (error) {
      console.error("Error in handleShareFile:", error);
      setShowToastMsg("An error occurred while sharing the file.");
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
  const handleUnstar = async () => {
    if (starred && onToggleStar) {
      await onToggleStar(file);
      setStarred(false); // Set starred to false regardless of its previous state
    }
  };



  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleLockClick = () => {
    setIsUnlocking(false);
    setShowPasswordModal(true);
  };

  const handleUnlockClick = () => {
    setIsUnlocking(true);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (enteredPassword) => {
    setShowPasswordModal(false);
    if (isUnlocking) {
      await handleUnlock(enteredPassword);
    } else {
      await handleLock(enteredPassword);
    }
  };

  const handleLock = async (password) => {
    if (password) {
      try {
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
          password: password,
          sensitive: true
        });
        setIsSensitive(true);
        setFile(previousFile => ({ ...previousFile, password: password }));
        setShowToastMsg("File locked successfully.");
        addNotification('image', {
          src: displayImageSrc,
          message: `File ${file.name} is locked successfully.`,
          name: file.name,
          isFile: true,
          isLocked: true
        }, file.id);
      } catch (error) {
        console.error("Error locking file:", error);
        setShowToastMsg("Failed to lock file.");
      }
    }
  };




  const handleUnlock = async (enteredPassword) => {
    if (enteredPassword === 'reset') {
      // ... reset logic ...
    } else if (enteredPassword === afile.password) {
      if (enteredPassword === afile.password) {
        try {
          const fileRef = doc(db, "files", file.id.toString());
          await updateDoc(fileRef, {
            password: null,
            sensitive: false
          });
          setIsSensitive(false);
          setFile(previousFile => ({ ...previousFile, password: null }));
          setShowToastMsg("File unlocked successfully.");
          addNotification('image', {
            src: displayImageSrc,
            message: `File ${file.name} is unlocked successfully.`,
            name: file.name,
            isFile: true,
            isUnlocked: true
          }, file.id);
        } catch (error) {
          console.error("Error unlocking file:", error);
          setShowToastMsg("Failed to unlock file.");
        }
      } else {
        alert("Incorrect password!");
      }
    };
  }

    // const handleUnlock = async (password) => {
    //   const enteredPassword = prompt("Enter password to unlock or type 'reset' to reset your password:");

    //   if (enteredPassword === 'reset') {
    //     // ... reset logic ...
    //   } else if (enteredPassword === afile.password) {
    //     try {
    //       const fileRef = doc(db, "files", file.id.toString());
    //       await updateDoc(fileRef, {
    //         password: null,
    //         sensitive: false
    //       });
    //       setIsSensitive(false);
    //       setFile(previousFile => ({ ...previousFile, password: null })); // This updates the local state
    //       setShowToastMsg("File unlocked successfully.");
    //       addNotification('image', {
    //         src: displayImageSrc,
    //         message: `File ${file.name} is unlocked successfully.`,
    //         name: file.name,
    //         isFile: true,
    //         isUnlocked: true
    //     }, file.id);
    //     } catch (error) {
    //       console.error("Error unlocking file:", error);
    //       setShowToastMsg("Failed to unlock file.");
    //     }
    //   } else {
    //     // If the password doesn't match, it means the local state is not up to date or the entered password is wrong.
    //     alert("Incorrect password!");
    //   }
    // };




    // Conditional rendering logic
    let actionButtons;
    if (isTrashItem) {
      actionButtons = (
        <div className="file-actions">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center mr-5 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001]"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <MoreHorizIcon className="text-gray-300 text-2xl" />
                {showTooltip && (
                  <div className="absolute top-[280px] right-[440px] transform -translate-x-1/2 -translate-y-full bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg z-[1001]">
                    More
                  </div>

                )}
              </button>
            </DropdownTrigger>
            <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
              <DropdownSection title="Actions" showDivider>
                <DropdownItem
                  key="Restore"
                  shortcut="⌘N"
                  startContent={<MdRestore className={iconClasses} />}
                  className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                  onClick={() => onRestore(file)} // Only set isRenaming to true here
                >
                  Restore
                  <div className="text-xs text-gray-500">
                    Restore
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="DeleteForever"
                  shortcut="⌘N"
                  startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
                  className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                  onClick={() => onDeleteForever(file)}>
                  Delete Forever
                  <div className="text-xs text-red-400">
                    <span className='text-gray-400 font-bold'>{getTimeLeft(file.deletedAt)}</span>
                  </div>
                </DropdownItem>

              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>

      );
    } else if (isSharedContext) {
      actionButtons = (
        <Dropdown>
        <DropdownTrigger>
          <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001]"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <MoreHorizIcon className="text-gray-300 text-2xl" />
            {showTooltip && (
              <div className="absolute top-[70px] left-3 transform -translate-x-1/2 -translate-y-full bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg z-10">
                More
              </div>

            )}
          </button>

        </DropdownTrigger>
        <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
          <DropdownSection title="Actions" showDivider>
            <DropdownItem
              key="Rename"
              shortcut="⌘N"
              startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              onClick={() => handleFileActionClick(file)} // Only set isRenaming to true here
            >
              Rename
              <div className="text-xs text-gray-500">
                Give a name
              </div>
            </DropdownItem>
            <DropdownItem
              key="Download"
              shortcut="⌘C"
              startContent={<FaDownload className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              onClick={() => downloadFile(file)}
            >
              Download
              <div className="text-xs text-gray-500">
                Download in local
              </div>
            </DropdownItem>
          </DropdownSection>
          <DropdownSection title="Danger zone">
            <DropdownItem
              key="Delete"
              className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              color="danger"
              shortcut="⌘D"
              startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
              onClick={() => deleteFile(file)}
            >
              Delete
              <div className="text-xs text-red-400">
                Move to trash
              </div>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    );

    } else {
      actionButtons = (
        <div className="file-actions group flex items-center justify-between">
          <div className="flex gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 mx-1">
            <Tooltip
              showArrow={false}
              content="Starred"
              placement="bottom"
              className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg"
            >
              <div className="icon-wrapper p-3 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600">
                {starred ? (
                  <BsStarFill className="icon-fill" onClick={handleUnstar} /> // Call handleUnstar here
                ) : (
                  <BsStar className="icon-outline" onClick={handleToggleStar} />
                )}
              </div>
            </Tooltip>
          </div>
          <Image src={userAvatar} width={30} height={30} alt="User Avatar" className="self-center ml-auto mx-1" />
          <div className="flex gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ position: 'relative', display: 'inline-block' }}>
            <Dropdown>
              <DropdownTrigger>
                <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001]"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <MoreHorizIcon className="text-gray-300 text-2xl" />
                  {showTooltip && (
                    <div className="absolute top-[70px] left-3 transform -translate-x-1/2 -translate-y-full bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg z-10">
                      More
                    </div>

                  )}
                </button>

              </DropdownTrigger>
              <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
                <DropdownSection title="Actions" showDivider>
                  <DropdownItem
                    key="Rename"
                    shortcut="⌘N"
                    startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
                    className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                    onClick={() => handleFileActionClick(file)} // Only set isRenaming to true here
                  >
                    Rename
                    <div className="text-xs text-gray-500">
                      Give a name
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Download"
                    shortcut="⌘C"
                    startContent={<FaDownload className={iconClasses} />}
                    className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                    onClick={() => downloadFile(file)}
                  >
                    Download
                    <div className="text-xs text-gray-500">
                      Download in local
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Share"
                    shortcut="⌘E"
                    showDivider
                    startContent={<FaShare className={iconClasses} />}
                    className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                    style={{ boxSizing: 'border-box' }}
                    // onClick={() => handleShareFile(file)}
                    onClick={() => openShareModal(file)}
                    >
                    Share
                    <div className="text-xs text-gray-500">
                      Share with friends
                    </div>
                  </DropdownItem>
                  {isSensitive ? (
                    <DropdownItem
                      key="Unlock"
                      shortcut="⌘E"
                      showDivider
                      startContent={<LockOpenIcon className={iconClasses} />}
                      className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                      style={{ boxSizing: 'border-box' }}
                      onClick={handleUnlockClick}
                    >
                      Unlock
                      <div className="text-xs text-gray-500">
                        Unlock it to see
                      </div>
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="Lock"
                      shortcut="⌘E"
                      showDivider
                      startContent={<LockIcon className={iconClasses} />}
                      className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                      style={{ boxSizing: 'border-box' }}
                      onClick={handleLockClick}
                    >
                      Lock
                      <div className="text-xs text-gray-500">
                        Protect with lock
                      </div>
                    </DropdownItem>
                  )}
                </DropdownSection>
                <DropdownSection title="Danger zone">
                  <DropdownItem
                    key="Delete"
                    className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                    color="danger"
                    shortcut="⌘D"
                    startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
                    onClick={() => deleteFile(file)}
                  >
                    Delete
                    <div className="text-xs text-red-400">
                      Move to trash
                    </div>
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>

          </div>
        </div>
      );
    }



    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-[min-content,3fr,1.5fr,1fr,1fr,auto] gap-4 text-gray-400 items-center m-2 p-2 py-2 hover:bg-[#343434] rounded-md group">
          <div>{index}</div> {/* Display the index here */}
          <div className="flex items-center gap--2">
            <div className="flex justify-center items-center bg-gray-700 w-11 h-11 p-1 mx-2" onClick={() => onFileImageClick(file)}>
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
                  <span className="truncate text-sm text-gray-300 mb-1">{file.name}</span>
                  <div className='flex justify-center items-center'>
                    {isSensitive && (
                      <>
                        <LockIcon className='text-black bg-[#1ED760] rounded-full h-5 w-5 p-[2px] mr-1.5' style={{ fontSize: '14px' }} />
                        <button className="flex justify-center items-center text-white text-[7.5px] cursor-default bg-gray-600 p-2 w-3 h-4 rounded-sm mr-1.5">S</button>
                        <span className='text-xs mr-1.5'>locked</span>
                      </>
                    )}
                  </div>
                </span>
              )}
            </div>
          </div>
          <div className="ml-5 text-sm">{moment(file.modifiedAt).format("MMM DD, YYYY")}</div>
          <div className="text-sm ml-3">{formatFileSize(file.size)}</div>
          <div className="ml-9 text-sm">{file.type || "Unknown"}</div>
          <div className="flex gap-2 cursor-pointer">
            {actionButtons}
          </div>
        </div>
        {showPasswordModal && (
  <PasswordModal
    show={showPasswordModal}
    onClose={() => setShowPasswordModal(false)}
    onSubmit={handlePasswordSubmit}
    isUnlocking={isUnlocking}
    file={afile} // Pass the file object to the modal
  />
)}
<ShareFileModal
  isOpen={isShareModalOpen}
  onClose={() => {
    setIsShareModalOpen(false);
    setFileToShare(null);
  }}
  onShare={(usernameOrEmail, permission) => {
    handleShareFile(fileToShare, usernameOrEmail, permission);
    setIsShareModalOpen(false);
  }}
  file={fileToShare}
/>





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
