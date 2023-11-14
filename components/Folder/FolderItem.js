import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsFillPencilFill, BsStarFill, BsStar } from 'react-icons/bs';
import { FaDownload } from 'react-icons/fa';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useFolderActions } from "../Folder/UseFolderActions";



function FolderItem({ folder, isTrash, onRestore, onDeleteForever, onToggleDropdown, isDropdownActive, onFolderDeleted, onFolderRenamed, onFolderStarToggled }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const toggleDropdown = (e) => {
    e.stopPropagation();
    onToggleDropdown(folder.id);
  };

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

  const handleLockClick = (e) => {
    // Prevent default behavior if necessary
    e?.preventDefault();
  
    onToggleDropdown && onToggleDropdown(null); // Hide the dropdown
    const password = prompt("Set a password for this folder:");
    if (password) {
      lockFolder(folder, password); // Update the lock status without redirecting
      
    }
  };

  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlockClick = async () => {
    const password = prompt("Enter password to unlock:");
    onToggleDropdown(null); // Hide the dropdown
    if (password === folder.password) {
      unlockFolder(folder);
      setIsUnlocked(true); // Set the folder as unlocked
      alert('Folder is unlocked.');
    } else {
      alert('Incorrect password.');
    }

  };
  const navigateToFolder = async () => {
    router.push(`./`);
  };


  const { deleteFolder, toggleStarred, downloadFolderAsZip, renameFolder, lockFolder, unlockFolder } = useFolderActions();

  // Event handlers for each action
  const dropdownActions = isTrash ? (
    <>
      <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={() => onRestore(folder)}>
        <span>Restore</span>
      </div>
      <div className="text-red-500 hover:bg-red-300 rounded-xl text-sm my-2 p-1" onClick={() => onDeleteForever(folder)}>
        <span>Delete Forever</span>
      </div>
    </>
  ) : (
    <>
      <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={handleToggleStarred}>
        {folder.starred ? <BsStarFill /> : <BsStar />} Starred
      </div>
      <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={handleDownload}>
        <FaDownload /> Download
      </div>
      <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={folder.locked ? handleUnlockClick : handleLockClick}>
        {folder.locked ? "Unlock" : "Lock"}
      </div>
      <div className='hover:bg-slate-800 rounded-xl text-sm my-2 p-1' onClick={handleRenameClick}>
        <BsFillPencilFill /> Rename
      </div>
      <div className="text-red-500 hover:bg-red-300 rounded-xl text-sm my-4 p-1 mt-1" onClick={(e) => handleDeleteClick(e, folder)}>
        <DeleteOutlinedIcon className="text-red-500" /> Delete folder
      </div>
    </>
  );

  return (
    <div className={`relative w-full flex flex-col justify-center items-center h-[120px] ...`} onClick={navigateToFolder}>
      {/* Dropdown button */}
      <div className="absolute top-0 right-0 m-2" style={{ zIndex: 1000 }}>
        <button onClick={toggleDropdown} className="flex items-center ...">
          <AiOutlineInfoCircle className="text-gray-300 text-2xl" />
        </button>
        {isDropdownActive && (
          <div className='absolute left-0 top-full bg-black w-[180px] h-[270px] rounded-xl' style={{ zIndex: 1000 }}>
            <div className='text-lg font-semibold border-b border-gray-700 pb-2 px-2'>
              Actions
              {dropdownActions}
            </div>
          </div>
        )}
      </div>

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
