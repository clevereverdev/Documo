import React, { useState, useContext } from 'react';
import { getFirestore, doc, updateDoc, getDoc, collection, setDoc, arrayUnion } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/router';
import { app } from "../../firebase/firebase";
import Image from 'next/image';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsStarFill, BsStar } from 'react-icons/bs';
import { useFolderActions } from "../Folder/UseFolderActions";
import { useNotifications } from '../../context/NotificationContext';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import { MdOutlineDriveFileRenameOutline, MdRestore } from "react-icons/md";
import { FaDownload, FaTrash, FaShare } from "react-icons/fa6";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FolderPasswordModal from './FolderPasswordModal'; // Import the new component
import { ShowToastContext } from "../../context/ShowToastContext";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ShareFolderModal from './ShareFolderModal';
import { TiPin } from "react-icons/ti";
import { RiUnpinFill } from "react-icons/ri";


function FolderItem({ folder, isTrashItem, isSharedContext, onToggleDropdown, onRestore, onDeleteForever, onFolderDeleted, onFolderRenamed, onFolderStarToggled, onTogglePinned }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const db = getFirestore(app)
  const [showTooltip, setShowTooltip] = useState(false);



  const toggleDropdown = (e) => {
    e.stopPropagation();
    onToggleDropdown(folder.id);
  };
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const handleDeleteClick = async (e) => {
    e.stopPropagation(); // Prevent click event from bubbling up to the parent

    try {
      await deleteFolder(folder);
      onFolderDeleted(folder.id);
    } catch (error) {
      console.error("Error deleting folder:", error);
      // Handle error (e.g., show error notification)
    }
  };
  const handleToggleStarred = async (e) => {
    e.stopPropagation(); // Prevent click event from bubbling up
    try {
      await toggleStarred(folder);
      folder.starred = !folder.starred; // Toggle the starred status of the folder
      // Optionally inform the parent component about the change
      if (onFolderStarToggled) {
        onFolderStarToggled(folder.id, folder.starred);
      }
    } catch (error) {
      console.error("Error toggling folder star:", error);
      // Handle error (e.g., show error notification)
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation(); // Stop click event from bubbling up to parent elements
    downloadFolderAsZip(folder.id); // Call the function and pass the folder's ID
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await renameFolder(folder.id, newFolderName);
      setIsRenaming(false);
      folder.name = newFolderName; // Update the folder object's name
      // Optionally call a prop method to inform parent components about the change
      if (onFolderRenamed) {
        onFolderRenamed(folder.id, newFolderName);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      // Handle error (e.g., show error notification)
    }
  };
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);

  const handleRenameClick = (e) => {
    e.stopPropagation(); // Stop the event from propagating to parent elements
    setIsRenaming(true);
    onToggleDropdown && onToggleDropdown(null); // Hide the dropdown
  };

  const handleRenameChange = (e) => {
    e.stopPropagation(); // This will prevent the event from reaching any parent handlers
    setNewFolderName(e.target.value);
  };

  const { deleteFolder, toggleStarred, downloadFolderAsZip, renameFolder } = useFolderActions();

  const [showFolderPasswordModal, setShowFolderPasswordModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleLockClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsUnlocking(false);
    setShowFolderPasswordModal(true);
  };
  
  const handleUnlockClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsUnlocking(true);
    setShowFolderPasswordModal(true);
  };
  
const handlePasswordSubmit = (enteredPassword, isUnlockingFlag) => {
  if (isUnlockingFlag) {
    handleUnlock(enteredPassword);
  } else {
    handleLock(enteredPassword);
  }
};

function getTimeLeft(deletedAt) {
  const deletedAtDate = new Date(deletedAt.seconds * 1000);
  // Add 30 days to deletedAtDate
  deletedAtDate.setDate(deletedAtDate.getDate() + 30);

  // Current date and time
  const now = new Date();

  // Check if the current date and time have passed the deletedAtDate
  if (now > deletedAtDate) {
    return "folder deleted";
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

  
const handleLock = async (password) => {
  console.log("Inside handleLock with password:", password);

  if (password) {
    try {
      const folderRef = doc(db, "Folders", folder.id.toString());
      await updateDoc(folderRef, {
        password: password,
        locked: true
      });
      console.log("Current folder in handleLock:", folder);

      // Other folder properties update as needed
      setShowToastMsg(`Folder "${folder.name}" locked successfully.`);
      addNotification('folder', {
        src: './folder.png', // Adjust as needed
        message: `Folder "${folder.name}" is locked successfully.`,
        name: folder.name,
        isFolder: true,
        isLocked: true
      });
    } catch (error) {
      console.error("Error locking folder:", error);
      setShowToastMsg("Failed to lock folder.");
    }
  }
};
const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
const [passwordError, setPasswordError] = useState('');

const handleIncorrectPassword = () => {
  setIsPasswordIncorrect(true);
  setPasswordError("Password do not match");
  // Optionally, reset the state after a certain time period
  setTimeout(() => {
    setIsPasswordIncorrect(false);
    setPasswordError('');
  }, 3000); // reset after 3 seconds
};

const handleUnlock = async (enteredPassword) => {
  console.log("Entered Password:", enteredPassword); // Debug log
  console.log("Stored Password:", folder.password); // Debug log

  if (enteredPassword === folder.password) {
    try {
      const folderRef = doc(db, "Folders", folder.id.toString());
      await updateDoc(folderRef, {
        password: null,
        locked: false
      });
      // Update other folder properties as needed
      setShowToastMsg(`Folder "${folder.name}" unlocked successfully.`);
      addNotification('folder', {
        src: './folder.png', // Adjust as needed
        message: `Folder "${folder.name}" is unlocked now.`,
        name: folder.name,
        isFolder: true,
        isUnlocked: true
      });
    } catch (error) {
      console.error("Error unlocking folder:", error);
      setShowToastMsg("Failed to unlock folder.");
    }
  } else {
    handleIncorrectPassword();
  }
};

const navigateToFolder = async () => {
  router.push(`./`);
};


// SHARE FOLDER
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
const [shareWithUser, setShareWithUser] = useState('');
const [folderToShare, setFolderToShare] = useState(null);
const [editorFolderUnsubscribe, setEditorFolderUnsubscribe] = useState(null); // Initialize editorFoldereUnsubscribe

const openShareModal = (folder) => {
  console.log("Opening share modal for folder:", folder);
  setFolderToShare(folder);
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

  const handleShareFolder = async (folder, usernameOrEmail, permissionLevel, loggedInUserEmail, userDisplayName) => {
    console.log("handleSharefolder called with:", folder, usernameOrEmail, permissionLevel);
  
    try {
      // Check if the folder is sensitive
      if (folder.sensitive) {
        console.log("Folder is sensitive, checking password...");
        const enteredPassword = await promptForPassword(); // Implement this function as needed
        if (enteredPassword !== folder.password) {
          alert("Incorrect password. You cannot share this folder.");
          return;
        }
      }
  
      // Check if the user exists
      const { userExists, userEmail } = await checkUserExists(usernameOrEmail); // Retrieve the username
  
      console.log("User check:", userExists, userEmail);
  
      if (userExists) {
        if (permissionLevel === 'viewer' && folder.createBy !== loggedInUserEmail) {
          console.log("Preparing to share a copy for viewer...");
  
          // Create a new document in shared_folders with a snapshot of the folder's data
          const viewerFolderData = {
            ...folder,
            sharedBy: folder.createBy,
            sharedWith: userEmail, // Use the username instead of the email
            sensitive: false,
            password: null, // Remove sensitive information
            permission: permissionLevel,
          };
  
          const viewerFolderRef = doc(collection(db, "shared_folders"));
          await setDoc(viewerFolderRef, viewerFolderData);
          console.log("Viewer folder copy created:", viewerFolderRef.id);
          setShowToastMsg("Folder shared successfully!");

        } else if (permissionLevel === 'editor') {
          console.log("Preparing to share original folder with editor...");
          
          const folderRef = doc(db, "Folders", folder.id.toString());
          if (userExists) {
            await updateDoc(folderRef, {
              sharedWith: arrayUnion(userEmail),
              sharedBy: folder.createBy,
            });
          } else {
            console.error("userDisplayName is undefined or null.");
            // Handle this case appropriately, e.g., show an error message.
          }
  
          // Listen for changes in the shared folder
          const unsubscribeEditorFolder = onSnapshot(folderRef, (docSnapshot) => {
            const updatedFolderData = docSnapshot.data();
            // Update the shared folder in the state or wherever it's displayed
            // This update should trigger a re-render with the latest data
          });
  
          // Store the unsubscribe function for later cleanup
          setEditorFolderUnsubscribe(unsubscribeEditorFolder);
  
          console.log("Original folder shared with editor:", userEmail);
          setShowToastMsg("Folder shared successfully!");
        }
      } else {
        console.log("User does not exist.");
        setShowToastMsg("User does not exist.");
      }
    } catch (error) {
      console.error("Error in handleShareFolder:", error);
      setShowToastMsg("An error occurred while sharing the folder.");
    }
  };


let actionButtons;
  
  if (isTrashItem) {
    actionButtons = (
      <div className="folder-actions">
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
              onClick={() => onRestore(folder)} // Only set isRenaming to true here
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
              onClick={() => onDeleteForever(folder)}>
              Delete Forever
              <div className="text-xs text-red-400">
                <span className='text-gray-400 font-bold'>{getTimeLeft(folder.deletedAt)}</span>
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
            key="new"
            shortcut="⌘N"
            startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
            className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
            onClick={handleRenameClick} // Only set isRenaming to true here
          >
            Rename
            <div className="text-xs text-gray-500">
              Give a name
            </div>
          </DropdownItem>
          <DropdownItem
            key="copy"
            shortcut="⌘C"
            startContent={<FaDownload className={iconClasses} />}
            className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
            onClick={handleDownload}
          >
            Download
            <div className="text-xs text-gray-500">
              Download in local
            </div>
          </DropdownItem>
      
        </DropdownSection>
        <DropdownSection title="Danger zone">
          <DropdownItem
            key="delete"
            className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
            color="danger"
            shortcut="⌘D"
            startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
            onClick={(e) => handleDeleteClick(e, folder)}
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
      // Standard dropdown for normal context
      <div className="folder-actions">
       <Dropdown>
        <DropdownTrigger>
          <button onClick={toggleDropdown} className="absolute top-0 right-0 m-2 flex items-center z-10">
            <AiOutlineInfoCircle className="text-gray-300 text-2xl" />
          </button>
        </DropdownTrigger>
        <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
          <DropdownSection title="Actions" showDivider>
            <DropdownItem
              key="new"
              shortcut="⌘N"
              startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              onClick={handleRenameClick} // Only set isRenaming to true here
            >
              Rename
              <div className="text-xs text-gray-500">
                Give a name
              </div>
            </DropdownItem>
            <DropdownItem
              key="copy"
              shortcut="⌘C"
              startContent={<FaDownload className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              onClick={handleDownload}
            >
              Download
              <div className="text-xs text-gray-500">
                Download in local
              </div>
            </DropdownItem>

              <DropdownItem
              key="pin"
              shortcut="⌘P"
              startContent={folder.pinned ? <RiUnpinFill className={iconClasses} /> : <TiPin className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              onClick={() => onTogglePinned(folder)}
              >
              {folder.pinned ? 'Unpin' : 'Pin'}
              <div className="text-xs text-gray-500">
                {folder.pinned ? 'Unpin this folder' : 'Pin this folder'}
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
                    onClick={() => openShareModal(folder)}
                    >
                    Share
                    <div className="text-xs text-gray-500">
                      Share with friends
                    </div>
                  </DropdownItem>
            
            <DropdownItem
              key="Favorite"
              shortcut="⌘E"
              showDivider
              startContent={folder.starred ? <BsStarFill className={iconClasses} /> : <BsStar className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              style={{ boxSizing: 'border-box' }}
              onClick={handleToggleStarred}
            >
              {folder.starred ? 'Unstar' : 'Star'}
              <div className="text-xs text-gray-500">
                {folder.starred ? 'Remove from favorite' : 'Keep it in your favorite'}
              </div>
            </DropdownItem>

            <DropdownItem
              key="Privacy"
              shortcut="⌘P"
              showDivider
              startContent={folder.locked ? <LockOpenIcon className={iconClasses} /> : <LockIcon className={iconClasses} />}
              className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              style={{ boxSizing: 'border-box' }}
              onClick={(e) => folder.locked ? handleUnlockClick(e) : handleLockClick(e)}
              >
              {folder.locked ? 'Unlock' : 'Lock'}
              <div className="text-xs text-gray-500">
                {folder.locked ? 'Unlock it to see' : 'Lock it for safety'}
              </div>
            </DropdownItem>

          </DropdownSection>
          <DropdownSection title="Danger zone">
            <DropdownItem
              key="delete"
              className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
              color="danger"
              shortcut="⌘D"
              startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
              onClick={(e) => handleDeleteClick(e, folder)}
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
    );
  }

  
  return (
    <div className={`relative w-[120px] gap-4 flex flex-col justify-center items-center h-[120px] bg-gray-500 rounded-2xl`} onClick={navigateToFolder}>
      {/* Dropdown button */}
      <div className="folder-item">
      {actionButtons}
    </div>

      <div>
      <Image src='/folder.png' alt='folder' width={40} height={40} />
    {folder.pinned && (
      <div className="absolute top-0 left-0">
        {/* Replace with your actual pinned icon */}
        <TiPin className='text-4xl text-green-500' />
      </div>
    )}
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} className="flex flex-col items-center p-2">
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={handleRenameChange}
              onClick={(e) => e.stopPropagation()}
              className="input-styles"
            />
            <button type="submit" className="button-styles mt-2">Save</button>
          </form>
        ) : (
          <h2 className='line-clamp-2 text-[12px] text-center'>{folder.name}</h2>
        )}
{showFolderPasswordModal && (
  <FolderPasswordModal
    show={showFolderPasswordModal}
    onClose={() => setShowFolderPasswordModal(false)}
    onSubmit={handlePasswordSubmit}
    isUnlocking={isUnlocking}
    onIncorrectPassword={handleIncorrectPassword}
    isPasswordIncorrect={isPasswordIncorrect}   
    passwordError={passwordError} 
    folderId={folder.id}
    folder={folder} // Ensure this is the current folder object
  />
)}

<ShareFolderModal
  isOpen={isShareModalOpen}
  onClose={() => {
    setIsShareModalOpen(false);
    setFolderToShare(null);
  }}
  onShare={(usernameOrEmail, permission) => {
    handleShareFolder(folderToShare, usernameOrEmail, permission);
    setIsShareModalOpen(false);
  }}
  folder={folderToShare}
/>


      </div>
    </div>
  );
}
export default FolderItem;









// Event handlers for each action
  // const dropdownActions = isTrash ? (
  //   <>
  //     <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={() => onRestore(folder)}>
  //       <span>Restore</span>
  //     </div>
  //     <div className="text-red-500 hover:bg-red-300 rounded-xl text-sm my-2 p-1" onClick={() => onDeleteForever(folder)}>
  //       <span>Delete Forever</span>
  //     </div>
  //   </>
  // )

  // const handleLock = async (e) => {
  //   // Prevent default behavior if necessary
  //   e?.preventDefault();

  //   onToggleDropdown && onToggleDropdown(null); // Hide the dropdown
  //   const password = prompt("Set a password for this folder:");
  //   if (password) {
  //     // Assuming lockFolder function updates the folder status in the database
  //     await lockFolder(folder, password); // Pass the folder and password to the lock function
  //     // setShowToastMsg(`Folder "${folder.name}" locked successfully!`);
  //     addNotification('folder', {
  //       src: './folder.png', // Path to your folder icon
  //       message: `Folder "${folder.name}" is locked now.`,
  //       name: folder.name,
  //       isFolder: true,
  //       isLocked: true
  //     });
  //   }
  // };

  // const handleUnlock= async () => {
  //   const password = prompt("Enter password to unlock:");
  //   if (password === folder.password) {
  //     // Assuming unlockFolder function updates the folder status in the database
  //     await unlockFolder(folder); // Pass the folder to the unlock function
  //     // setShowToastMsg(`Folder "${folder.name}" unlocked successfully!`);
  //     addNotification('folder', {
  //       src: './folder.png', // Path to your folder icon
  //       message: `Folder "${folder.name}" is unlocked now.`,
  //       name: folder.name,
  //       isFolder: true,
  //       isUnlocked: true
  //     });
  //   } else {
  //     alert('Incorrect password.');
  //   }
  // };

