import React, { useState } from 'react';
import { doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/router';
import { app } from "../../firebase/firebase";
import Image from 'next/image';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsStarFill, BsStar } from 'react-icons/bs';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useFolderActions } from "../Folder/UseFolderActions";
import { useNotifications } from '../../context/NotificationContext';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { FaDownload, FaTrash, FaShare } from "react-icons/fa6";
import { TbRestore } from "react-icons/tb";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { IoIosColorPalette } from "react-icons/io";


function FolderItem({ folder, isTrash, onRestore, onDeleteForever, onToggleDropdown, isDropdownActive, onFolderDeleted, onFolderRenamed, onFolderStarToggled }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const db = getFirestore(app)


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

  //   const handleDelete = () => {
  //     deleteFolder(folder, onFolderDeleted);
  // };

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

  const handleLockClick = async (e) => {
    // Prevent default behavior if necessary
    e?.preventDefault();

    onToggleDropdown && onToggleDropdown(null); // Hide the dropdown
    const password = prompt("Set a password for this folder:");
    if (password) {
      // Assuming lockFolder function updates the folder status in the database
      await lockFolder(folder, password); // Pass the folder and password to the lock function
      // setShowToastMsg(`Folder "${folder.name}" locked successfully!`);
      addNotification('folder', {
        src: './folder.png', // Path to your folder icon
        message: `Folder "${folder.name}" is locked now.`,
        name: folder.name,
        isFolder: true,
        isLocked: true
      });
    }
  };

  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlockClick = async () => {
    const password = prompt("Enter password to unlock:");
    if (password === folder.password) {
      // Assuming unlockFolder function updates the folder status in the database
      await unlockFolder(folder); // Pass the folder to the unlock function
      // setShowToastMsg(`Folder "${folder.name}" unlocked successfully!`);
      addNotification('folder', {
        src: './folder.png', // Path to your folder icon
        message: `Folder "${folder.name}" is unlocked now.`,
        name: folder.name,
        isFolder: true,
        isUnlocked: true
      });
    } else {
      alert('Incorrect password.');
    }
  };
  const navigateToFolder = async () => {
    router.push(`./`);
  };


  const { deleteFolder, toggleStarred, downloadFolderAsZip, renameFolder, lockFolder, unlockFolder } = useFolderActions();

  // Event handlers for each action
  // const dropdownActions = isTrash ? (
  //   <>
  //     <DropdownItem key="test1">Test Item 1</DropdownItem>
  //     <DropdownItem key="test2">Test Item 2</DropdownItem>
  //   </>
  // ) : (
  //   <>
  //      <DropdownItem key="test1">Test Item 1</DropdownItem>
  //      <DropdownItem key="test2">Test Item 2</DropdownItem>
  //   </>
  // );
  const [showColorOptions, setShowColorOptions] = useState(false);

  // Function to toggle color options visibility
  const toggleColorOptions = () => {
    setShowColorOptions(!showColorOptions);
  };

  return (
    <div className={`relative w-full flex flex-col justify-center items-center h-[120px] ...`} onClick={navigateToFolder}>
      {/* Dropdown button */}
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
              onClick={folder.locked ? handleUnlockClick : handleLockClick}
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

      <div>
        <Image src='/folder.png' alt='folder' width={40} height={40} />
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
      </div>
    </div>
  );
}
export default FolderItem;
