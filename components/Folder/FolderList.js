// FolderList.js
import React, { useState, useEffect, useContext, useRef } from "react";
import FolderItem from "./FolderItem";
import { useRouter } from "next/router";
import FolderItemSmall from "./FolderItemSmall";
import { useFolderActions } from "../Folder/UseFolderActions"
import { app } from "../../firebase/firebase";
import { getFirestore, collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import FolderPasswordModal from './FolderPasswordModal'; // Import your password modal component
import { ShowToastContext } from "../../context/ShowToastContext";


function FolderList({ folderList, fileList, onFolderDeleted, isBig = true, folder }) {
  const { togglePinned } = useFolderActions();
  const [localFolderList, setLocalFolderList] = useState(folderList); // Renamed state variable to avoid conflict
  const [sortedFolders, setSortedFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState();
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showArrows, setShowArrows] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const db = getFirestore(app);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  const handleDropdownToggle = (folderId) => {
    setActiveDropdownId(activeDropdownId === folderId ? null : folderId);
  };
  const router = useRouter();

  useEffect(() => {
    // Update the localFolderList state when folderList prop changes
    setLocalFolderList(folderList);
  }, [folderList]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "Folders")),
      (snapshot) => {
        const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocalFolderList(folders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching folders: ", error);
      }
    );

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    const sorted = localFolderList.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      } else if (!a.pinned && b.pinned) {
        return 1;
      }
    });
    setSortedFolders(sorted);
  }, [localFolderList]);




  const openShareModal = (folder, e) => {
    e.stopPropagation();
    setIsShareModalOpen(true); // Add this line to set the state
  };


  const onFolderClick = (index, item) => {
    if (item.locked) {
      // If the folder is locked, show the password modal
      setSelectedFolder(item);
      setShowPasswordModal(true);
    } else {
      // If the folder is not locked, navigate as before
      setActiveFolder(index);
      router.push({
        pathname: "/folder/" + item.id,
        query: {
          name: item.name,
          id: item.id,
        },
      });
    };
  }

  const onPasswordSubmit = async (enteredPassword) => {
    if (!selectedFolder) {
      console.error('No folder has been selected for password verification.');
      setPasswordError('No folder selected.'); // Set error message
      return;
    }

    // Fetch the folder's details from Firestore to get the password
    const folderRef = doc(db, "Folders", selectedFolder.id);
    const folderSnap = await getDoc(folderRef);

    if (folderSnap.exists()) {
      const folderData = folderSnap.data();

      // Check if the entered password matches the folder's password
      if (enteredPassword === folderData.password) {
        // Correct password, navigate to the folder
        setShowPasswordModal(false);
        setActiveFolder(selectedFolder);
        router.push({
          pathname: "/folder/" + selectedFolder.id,
          query: {
            name: selectedFolder.name,
            id: selectedFolder.id,
          },
        });
      } else {
        // Incorrect password, set error message
        setShowToastMsg('Incorrect password. Please try again.');
      }
    } else {
      // Failed to fetch folder data, set error message
      setShowToastMsg('Failed to fetch folder data.');
    }
  };


  // Clear the error message when the modal is closed
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPasswordError(''); // Clear any error messages
  };

  // Clear the error message when the user starts to type a new password
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(''); // Clear the error message
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

  const [currentPage, setCurrentPage] = useState(1);
  const foldersPerPage = 5; // Set the number of folders per page
  const totalPages = Math.ceil(folderList.length / foldersPerPage);

  // Calculate the folders to be displayed on the current page
  useEffect(() => {
    const indexOfLastFolder = currentPage * foldersPerPage;
    const indexOfFirstFolder = indexOfLastFolder - foldersPerPage;
    setSortedFolders(localFolderList.slice(indexOfFirstFolder, indexOfLastFolder));
  }, [localFolderList, currentPage, foldersPerPage]);


  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageNumber = 5; // Adjust based on how many page numbers to show before truncating

    // Push Prev button
    pageNumbers.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
      >
        Prev
      </button>
    );

    // Add the first page
    if (currentPage > 1) {
      pageNumbers.push(
        <button key={1} className="pagination-number" onClick={() => setCurrentPage(1)}>
          1
        </button>
      );
    }

    // Truncation for the left side
    if (currentPage > 3) {
      pageNumbers.push(<div key="left-ellipsis" className="pagination-ellipsis">...</div>);
    }

    // Current page
    pageNumbers.push(
      <button key={currentPage} className="pagination-number active">
        {currentPage}
      </button>
    );

    // Truncation for the right side
    if (currentPage < totalPages - 2) {
      pageNumbers.push(<div key="right-ellipsis" className="pagination-ellipsis">...</div>);
    }

    // Add the last page
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button key={totalPages} className="pagination-number" onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    // Push Next button
    pageNumbers.push(
      <button
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
      >
        Next
      </button>
    );

    return pageNumbers;
  };


  return (
    <div className="p-5 mt-5 bg-[#171717] rounded-lg h-[12rem]">
      {isBig && (
        <h2 className="text-17px font-bold items-center">
          Recent Folders
        </h2>
      )}

      {folderList.length === 0 ? ( // Check if there are no folders
        <div className="flex flex-col items-center justify-center">
          <img src='/NoFolder.png' alt="Empty Folder" className="w-[200px] h-[100px]" />
          <p className="text-gray-400 text-sm">You have not uploaded any folder yet</p>
          <p className="text-gray-500 text-xs">Please click that Add button</p>
        </div>
      ) : (
        <>
          {isBig ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 m-3">
              {sortedFolders.map((item, index) => {
                const filesForFolder = Array.isArray(fileList) ? fileList.filter(file => file.parentFolderId === item.id) : [];
                return (
                  <div key={item.id}
                    onDoubleClick={() => onFolderClick(index, item)} // Changed to onDoubleClick
                  >
                    {/* Changed key to item.id for uniqueness */}
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 m-1">

              {folderList.map((item, index, setBreadcrumbs) => (
                <div key={index}
                  onClick={() => onFolderClick(index, item)}
                >
                  <FolderItemSmall key={item.id} folder={item} setBreadcrumbs={setBreadcrumbs} // Pass setBreadcrumbs down to FolderItemSmall
                  />
                </div>
              ))}
            </div>
          )}

          {folderList.length > 0 && ( // Only show pagination if there are folders
            <div className="flex justify-center space-x-3 mt-4">
              {renderPagination()}
            </div>
          )}
          {showPasswordModal && (
            <FolderPasswordModal
              show={showPasswordModal}
              onClose={() => setShowPasswordModal(false)}
              onSubmit={onPasswordSubmit}
              folderId={selectedFolder?.id}
              isUnlocking={true} // You're always unlocking in this context
              onIncorrectPassword={() => { /* handle incorrect password */ }}
              isPasswordIncorrect={false} // You will need to manage this state based on actual password verification
              passwordError={null} // Set the error message if the password is incorrect
            />
          )}
        </>
      )}
    </div>
  );
}

export default FolderList;