// FolderList.js
import React, { useState, useEffect, useRef } from "react";
import FolderItem from "./FolderItem";
import { useRouter } from "next/router";
import FolderItemSmall from "./FolderItemSmall";
import { useFolderActions } from "../Folder/UseFolderActions"
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';


function FolderList({ folderList, fileList, onFolderDeleted, isBig = true }) {
  const { togglePinned } = useFolderActions();
  const [localFolderList, setLocalFolderList] = useState(folderList); // Renamed state variable to avoid conflict
  const [sortedFolders, setSortedFolders] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);


  const [activeFolder, setActiveFolder] = useState();
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const handleDropdownToggle = (folderId) => {
    setActiveDropdownId(activeDropdownId === folderId ? null : folderId);
  };
  const router = useRouter();

  useEffect(() => {
    // Update the localFolderList state when folderList prop changes
    setLocalFolderList(folderList);
  }, [folderList]);

  useEffect(() => {
    if (Array.isArray(folderList)) {
      const sorted = [...folderList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setSortedFolders(sorted);
      setShowArrows(sorted.length > 5); // Show both arrows when there are more than 5 folders
    }
  }, [folderList]);


  // const onFolderClick = async (e, index, item) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   // Only prompt for password if the folder is locked and not already unlocked
  //   if (item.locked && !item.isUnlocked) {
  //     const enteredPassword = prompt('This folder is locked. Enter the password:');
  //     if (enteredPassword !== item.password) {
  //       alert('Incorrect password.');
  //       return; // Do not navigate if the password is incorrect
  //     }
  //   }

  //   // Navigate to the folder
  //   setActiveFolder(index);
  //   router.push({
  //     pathname: "/folder/" + item.id,
  //     query: { name: item.name, id: item.id },
  //   });
  // };

  const onFolderRenamed = (folderId, newName) => {
    // Update the state of folderList with the new name
    const updatedFolders = folderList.map(folder => {
        if (folder.id === folderId) {
            return { ...folder, name: newName };
        }
        return folder;
    });
    setFolderList(updatedFolders); // Assuming you have a state called folderList
};

const onFolderStarToggled = (folderId, newStarStatus) => {
  // Update the state of folderList with the new star status
  const updatedFolders = folderList.map(folder => {
      if (folder.id === folderId) {
          return { ...folder, starred: newStarStatus };
      }
      return folder;
  });
  setFolderList(updatedFolders); // Assuming you have a state called folderList
};

// TOGGLE FOLDER
const handleTogglePinned = async (folder) => {
  try {
    await togglePinned(folder);
    
    // Update the localFolderList state
    const updatedFolders = localFolderList.map(f => {
      if (f.id === folder.id) {
        return { ...f, pinned: !f.pinned };
      }
      return f;
    });
    setLocalFolderList(updatedFolders);
  } catch (error) {
    console.error("Error toggling pinned status:", error);
  }
};

// CAROUSEL
const handleScrollLeft = () => {
  if (carouselIndex > 0) {
    setCarouselIndex(carouselIndex - 1);
  }
};

const handleScrollRight = () => {
  if (carouselIndex < sortedFolders.length - 5) {
    setCarouselIndex(carouselIndex + 1);
  }
};



return (
  <div className="p-5 mt-5 bg-[#171717] rounded-lg h-[12rem]">
    {isBig ? (
      <h2 className="text-17px font-bold items-center">
        Recent Folders
      </h2>
    ) : null}

    {isBig ? (
      <div className="relative">
      {showArrows && (
          <div className="absolute inset-y-0 flex items-center mt-20">
            
            <AiOutlineLeft
              className={`cursor-pointer bg-black rounded-full w-8 h-8 p-2 text-white ${carouselIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleScrollLeft}
              disabled={carouselIndex <= 0}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 m-3">
              {sortedFolders.slice(carouselIndex, carouselIndex + 5).map((item, index) => {
                const filesForFolder = Array.isArray(fileList) ? fileList.filter(file => file.parentFolderId === item.id) : [];
                return (
                  <div key={index} className="folder-item-clickable cursor-pointer" onClick={(e) => onFolderClick(e, index, item)}>
                    <FolderItem
                      folder={item}
                      fileList={filesForFolder}
                      onToggleDropdown={() => handleDropdownToggle(item.id)}
                      isUnlocked={item.isUnlocked}
                      onFolderDeleted={onFolderDeleted}
                      onFolderRenamed={onFolderRenamed}
                      onFolderStarToggled={onFolderStarToggled}
                      onTogglePinned={handleTogglePinned}
                    />
                  </div>
                );
              })}
            </div>
            <AiOutlineRight
              className={`cursor-pointer bg-black rounded-full w-8 h-8 p-2 text-white ${carouselIndex >= sortedFolders.length - 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleScrollRight}
              disabled={carouselIndex >= sortedFolders.length - 5}
            />
          </div>
        )}
      </div>
    ) : (
      <div>
        {folderList.map((item, index) => (
          <div key={item.id} onClick={() => onFolderClick(index, item)}>
            <FolderItemSmall folder={item} />
          </div>
        ))}
      </div>
    )}
  </div>
);

}

export default FolderList;