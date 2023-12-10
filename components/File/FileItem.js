import moment from "moment";
import React, { useContext, useState, useEffect, useRef } from "react";
import { BsFillTrashFill, BsFillPencilFill, BsStarFill, BsStar } from 'react-icons/bs';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import { useNotifications } from '../../context/NotificationContext';
import { UserAvatarContext } from '../../context/UserAvatarContext';
import Image from 'next/image';
import { useFileActions, useFileRename } from "../File/UseFileActions";
import { onSnapshot } from "firebase/firestore";
import { MdOutlineDriveFileRenameOutline, MdRestore } from "react-icons/md";
import { FaDownload, FaTrash, FaShare, FaFilePdf, FaFileImage } from "react-icons/fa6";
import PasswordModal from './PasswordModal'; // Import the PasswordModal component
import ShareFileModal from 'components/File/ShareFileModel';
import { TiPin } from "react-icons/ti";
import { RiUnpinFill } from "react-icons/ri";
import { TbPinnedFilled } from "react-icons/tb";
import { HiLockClosed } from "react-icons/hi2";

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from "../../firebase/auth";
import { AiOutlinePrinter } from 'react-icons/ai'; // Import a printer icon for the print button

function FileItem({ file, onFileImageClick, onToggleStar, index, isTrashItem, onRestore, onDeleteForever, onRename, isSharedContext, togglePin }) {

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

  const [starred, setStarred] = useState(file.starred);

  const { userAvatar } = useContext(UserAvatarContext);
  const changeAvatar = (newAvatar) => {
    localStorage.setItem('userAvatar', newAvatar);
    setUserAvatar(newAvatar); // Update state
  };

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCode, setResetCode] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);


  const [key, setKey] = useState(0); // Added state to force re-render
  const [currentFile, setCurrentFile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Assuming file has properties like name and imageUrl
  const fileName = file ? file.name : 'No file selected'; // Default text if file is not provided
  const fileImage = file ? file.imageUrl : '/default.png'; // Path to a default image
  const [postUnlockAction, setPostUnlockAction] = useState(null);

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


  const handlePrintClick = (imageUrl) => {
    if (file.sensitive) {
      // Set action to 'printUnlock' for sensitive files when printing
      setCurrentAction('printUnlock');
      setShowPasswordModal(true);
    } else {
      printImage(imageUrl);
    }
  };
  

  const printImage = (imageUrl) => {
    const iframe = document.createElement('iframe');
    iframe.style.visibility = 'hidden';
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none'; // Remove the border for the iframe
  
    // Append the iframe to the document body
    document.body.appendChild(iframe);
  
    // Write the image and print script to the iframe document
    iframe.contentDocument.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            /* Styles to ensure the image is centered and retains its aspect ratio */
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain; /* This ensures the image is not stretched */
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" onload="window.print(); setTimeout(() => window.top.close(), 500);" />
        </body>
      </html>`
    );
  
    // Close the document to finish loading the page
    iframe.contentDocument.close();
  
    // Remove the iframe after printing
    iframe.onload = function() {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000); // Wait for a second before removing to ensure print dialogue appears
    };
  };

  // When submitting the password for printing
  const handlePrintPasswordSubmit = async (enteredPassword) => {
    setShowPasswordModal(false);
    if (enteredPassword === afile.password) {
      printImage(afile.imageUrl);
    } else {
      setShowToastMsg("Incorrect Password!");   
      console.log("Incorrect Password!") 
    }
  };
  
  

  const handlePrintSubmit = () => {
    // Call the passed onSubmit function with the entered password
    onSubmit(password);
  };
  const isImage = /\.(jpeg|png|gif|bmp|webp)$/i.test(file.name);

  
  
  
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
    //   // Check if the file is sensitive
    //   // if (file.sensitive) {
    //   //   console.log("File is sensitive, checking password...");
    //   //   // const enteredPassword = await promptForPassword(); // Implement this function as needed
    //   //   if (enteredPassword !== file.password) {
    //   //     alert("Incorrect password. You cannot share this file.");
    //   //     return;
    //   //   }
    
  
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
            senderUserName: authUser.username,
            sharedWith: userEmail, // Use the username instead of the email
            sensitive: false,
            pinned: false,
            password: null, // Remove sensitive information
            permission: permissionLevel,
            sharedAt: new Date(),
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
              senderUserName: authUser.username,
              permission: permissionLevel,
              sensitive: false,
              password: null, // Remove sensitive information
              pinned: false,
              sharedAt: new Date(),
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

// Define the path to the default image for unknown file types
const defaultFileImage = '/default.png';
// Map file extensions to corresponding images
const getFileImage = (extension) => {
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
};

  // Determine the image source based on the file extension
const fileExtension = file.name.toLowerCase().split('.').pop();
const imageSrc = getFileImage(fileExtension);
const displayImageSrc = ['pdf', 'zip', 'csv', 'txt', 'mp3'].includes(fileExtension)
  ? imageSrc
  : file.imageUrl; // Use the default image for unknown file types if file.imageUrl is not defined



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
    setCurrentAction('lock');
    setShowPasswordModal(true);
  };
  
  const handleUnlockClick = () => {
    setIsUnlocking(true);
    setCurrentAction('unlock');
    setShowPasswordModal(true);
  };
  
  // const handlePrintClick = () => {
  //   setCurrentAction('print');
  //   setShowPasswordModal(true);
  // };

  const handlePasswordSubmit = async (enteredPassword) => {
    setShowPasswordModal(false);
    if (isUnlocking) {
      await handleUnlock(enteredPassword);
    } else {
      await handleLock(enteredPassword);
    }
  };

  const handleLock = async (password) => {
    setShowPasswordModal(false);
    setCurrentAction(null);

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
    // Close the modal first, regardless of the outcome
    setShowPasswordModal(false);
    setCurrentAction(null);
  
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
  

// Add the pin icon click handler
const handlePinClick = (e) => {
  e.stopPropagation(); // Prevent triggering other click events
  togglePin(file);
};

const FileInfo = ({ file }) => (
  <div className="flex items-center justify-center space-x-2 m-2">
        <img src={displayImageSrc} alt="File" className="h-8 w-9 bg-gray-600 p-1 rounded-lg" />
    <span className="text-gray-400 text-center font-extrabold text-xs border-gray-600 border-2 rounded-md px-2 py-1.5">{truncateFileName(file.name)}</span>
  </div>
  
);

    // Conditional rendering logic
    let actionButtons;
    if (isTrashItem) {
      actionButtons = (
        <div className="file-actions">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center mr-5 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001]"
                
              >
                <MoreHorizIcon className="text-gray-300 text-2xl" />
                
                  
              </button>
            </DropdownTrigger>
            <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
              <DropdownSection title="Actions" showDivider>
                <DropdownItem
                  key="Restore"
                  shortcut="⌘R"
                  startContent={<MdRestore className={iconClasses} />}
                  className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                  onClick={() => onRestore(file)} // Only set isRenaming to true here
                  textValue="Restore"
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
                  onClick={() => onDeleteForever(file)}
                  textValue="DeleteForever"
                  >
                    
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
            
          >
            <MoreHorizIcon className="text-gray-300 text-2xl" />
            
             
           
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
              textValue="Rename"
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
              textValue="Download"
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
              textValue="Delete"
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
                <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001] relative">
  <div className="relative group flex items-center">
    <MoreHorizIcon className="text-gray-300 text-2xl"/>
  </div>
</button>




                </DropdownTrigger>
                <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
                  <DropdownItem className="!p-0" disabled>
                   <FileInfo file={file} />
                  </DropdownItem>
                  <DropdownSection title="Actions" showDivider>
    
                    <DropdownItem
                      key="Rename"
                      shortcut="⌘N"
                      startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
                      className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                      onClick={() => handleFileActionClick(file)} // Only set isRenaming to true here
                      textValue="Rename"
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
                key="pin"
                shortcut="⌘P"
                startContent={file.pinned ? <RiUnpinFill className={iconClasses} /> : <TiPin className={iconClasses} />}
                className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                onClick={() => togglePin(file)}
                textValue="pin"
                >
                {file.pinned ? 'Unpin' : 'Pin'}
                <div className="text-xs text-gray-500">
                  {file.pinned ? 'Unpin this file' : 'Pin this file'}
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
                      textValue="Share"
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
                        textValue="Unlock"
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
                        textValue="Lock"
                      >
                        Lock
                        <div className="text-xs text-gray-500">
                          Protect with lock
                        </div>
                      </DropdownItem>
                    )}
                    <DropdownItem
  key="Print Image"
  startContent={<AiOutlinePrinter className={iconClasses} />}
  onClick={() => isImage && handlePrintClick(file.imageUrl, file)} // Updated to use handlePrintClick
  className={!isImage ? 'opacity-50 cursor-not-allowed text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]' : 'text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]'}
  disabled={!isImage} // Disable the item if not an image
>
  Print Image
  <div className="text-xs text-gray-500">
    {isImage ? 'Print this image' : 'Not available for this file type'}
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
                      textValue="Delete"
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
                 <span className="text-sm text-gray-300 mb-1">{truncateFileName(file.name)}</span>
                  <div className='flex items-center'>
                    {file.pinned && (
                     <TbPinnedFilled className='text-black bg-[#3EA88B] rounded-full h-4 w-4 p-[1px] mr-1.5' style={{ fontSize: '13px' }}/>
                    )}
                    {isSensitive && (
                      <>
                     <HiLockClosed className='text-black bg-[#3EA88B] rounded-full h-4 w-4 p-[2px] mr-1.5' style={{ fontSize: '13px' }}/>
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
    onClose={() => {
      setShowPasswordModal(false);
      setCurrentAction(null);
    }}
    onSubmit={(enteredPassword) => {
      if (currentAction === 'printUnlock') {
        handlePrintPasswordSubmit(enteredPassword);
      } else if (currentAction === 'lock') {
        handleLock(enteredPassword);
      } else if (currentAction === 'unlock') {
        handleUnlock(enteredPassword);
      }
      setCurrentAction(null);
    }}
    isUnlocking={currentAction === 'unlock' || currentAction === 'printUnlock'}
    file={afile}
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
  errorMessage={errorMessage}
  />
 
        {/* {showResetModal && (
          <ResetModal
            show={showResetModal}
            onClose={() => setShowResetModal(false)}
            onResetSubmit={handleResetSubmit}
          />
        )} */}
      </>
    );

  }

  export default FileItem;
