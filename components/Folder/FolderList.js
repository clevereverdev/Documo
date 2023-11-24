// FolderList.js
import React, { useState } from "react";
import FolderItem from "./FolderItem";
import { useRouter } from "next/router";
import FolderItemSmall from "./FolderItemSmall";


function FolderList({ folderList, fileList, onFolderDeleted, isBig = true }) {
  console.log("Folder list in FolderList component:", folderList);

  const [activeFolder, setActiveFolder] = useState();
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const handleDropdownToggle = (folderId) => {
    setActiveDropdownId(activeDropdownId === folderId ? null : folderId);
  };
  const router = useRouter();

  const onFolderClick = async (e, index, item) => {
    e.preventDefault();
    e.stopPropagation();

    // Only prompt for password if the folder is locked and not already unlocked
    if (item.locked && !item.isUnlocked) {
      const enteredPassword = prompt('This folder is locked. Enter the password:');
      if (enteredPassword !== item.password) {
        alert('Incorrect password.');
        return; // Do not navigate if the password is incorrect
      }
    }

    // Navigate to the folder
    setActiveFolder(index);
    router.push({
      pathname: "/folder/" + item.id,
      query: { name: item.name, id: item.id },
    });
  };

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

// ...

  return (
    <div className="p-5 mt-5 bg-[#171717] rounded-lg h-[12rem]">
      {isBig ? (
        <h2 className="text-17px font-bold items-center">
          Recent Folders
          <span className="float-right text-blue-400 font-normal text-[13px]">
            View All
          </span>
        </h2>
      ) : null}
      {isBig ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-4">
         {folderList.map((item, index) => {
      // Check if fileList is an array before calling .filter
      const filesForFolder = Array.isArray(fileList) ? fileList.filter(file => file.parentFolderId === item.id) : [];

            return (
                <div key={index} className="folder-item-clickable" onClick={(e) => onFolderClick(e, index, item)}>
                <FolderItem
                  folder={item}
                  fileList={filesForFolder}
                  onToggleDropdown={() => handleDropdownToggle(item.id)}
                  isDropdownActive={activeDropdownId === item.id}
                  isUnlocked={item.isUnlocked}
                  onFolderDeleted={onFolderDeleted}
                  onFolderRenamed={onFolderRenamed}
                  onFolderStarToggled={onFolderStarToggled}

                  // Include other props like isTrash, onRestore, onDeleteForever if needed
                />
              </div>
            );
          })}
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
