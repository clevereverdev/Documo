import React, { useState, useEffect, useRef } from "react";
import { collection, getFirestore, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import FileItem from "@/File/FileItem";
import FolderItem from "@/Folder/FolderItem";
import { app } from "../firebase/firebase";
import Layout from "@/Sidebar";
import SearchBar from "@/Search";
import StorageView from '../components/Storage/StorageView';
import styles from "../styles/Home.module.css";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MdRestore } from "react-icons/md";
import { FaTrash } from "react-icons/fa6";

export default function Trash() {
  const [deletedItems, setDeletedItems] = useState([]);
  const [filteredDeletedItems, setFilteredDeletedItems] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

  useEffect(() => {
    const savedHistory = localStorage.getItem('deletedSearchHistory');
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    setSearchHistory(parsedHistory);
  }, []);

  const db = getFirestore(app);
  
  function getFileExtension(filename) {
    // This will extract the extension from the filename
    const match = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1] : 'file'; // return 'file' if no extension is found
  }

  useEffect(() => {
    const filesQuery = query(collection(db, "deleted_files"));
    const foldersQuery = query(collection(db, "deleted_folders"));

    const unsubscribeFiles = onSnapshot(filesQuery, (fileSnapshot) => {
      const files = fileSnapshot.docs.map(doc => {
        const data = doc.data();
        const extension = getFileExtension(data.name); // Extract the file extension
        return { ...data, id: doc.id, type: extension, pinned: false }; // Use the extracted extension
      });
      
      // Combine with folders (assuming folders are handled separately)
  const unsubscribeFolders = onSnapshot(foldersQuery, (folderSnapshot) => {
    const folders = folderSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      type: 'folder',
      pinned: false,
      imageUrl: '/folder.png', // Static image URL for folders
      size: 'Unknown' // Folders will always have 'Unknown' size
    }));
        
        // Combine and set starred items
        setDeletedItems([...files, ...folders]);
        setFilteredDeletedItems([...files, ...folders]);

      });
    });

    return () => {
      unsubscribeFiles();
      //unsubscribeFolders(); // Uncomment if necessary
    };
  }, [db]);


  // Define a search function for starred files
const searchDeletedItems = (searchTerm) => {
  let searchResult = [];
  if (searchTerm.trim() === '') {
    // If the search bar is empty, show all starred items
    searchResult = [...deletedItems];
  } else {
    // Filter the starredItems based on the search term
    searchResult = deletedItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  // Update the filtered starred items list
  setFilteredDeletedItems(searchResult);

  // Update search history if the term is not already in the history
  if (searchTerm && !searchHistory.includes(searchTerm)) {
    const newHistory = [searchTerm, ...searchHistory].slice(0, 5);
    updateSearchHistory(newHistory);
  }
};

  const updateSearchHistory = (newHistory) => {
    setSearchHistory(newHistory);
    localStorage.setItem('deletedSearchHistory', JSON.stringify(newHistory));
  };

  const restoreFile = async (file) => {
    const fileRef = doc(db, "deleted_files", file.id);
    const restoredFileRef = doc(db, "files", file.id);

    try {
      await deleteDoc(fileRef);
      await setDoc(restoredFileRef, { ...file, deleted: false, deletedAt: null });

      setDeletedItems(prevItems => prevItems.filter(f => f.id !== file.id));
      console.log(`${file.name} has been restored.`);
    } catch (error) {
      console.error("Error restoring file: ", error);
    }
  };

  const deleteFileForever = async (file) => {
    const fileRef = doc(db, "deleted_files", file.id);
    try {
      await deleteDoc(fileRef);
      console.log(`${file.name} has been permanently deleted.`);
      setDeletedItems(prevItems => prevItems.filter(f => f.id !== file.id));
    } catch (error) {
      console.error("Error deleting file forever: ", error);
    }
  };

  const restoreFolder = async (folder) => {
    const folderRef = doc(db, "deleted_folders", folder.id);
    const restoredFolderRef = doc(db, "Folders", folder.id);

    try {
      await deleteDoc(folderRef);
      await setDoc(restoredFolderRef, { ...folder, deleted: false, deletedAt: null });

      setDeletedItems(prevItems => prevItems.filter(f => f.id !== folder.id));
      console.log(`${folder.name} has been restored.`);
    } catch (error) {
      console.error("Error restoring folder: ", error);
    }
  };
  
  const deleteFolderForever = async (folder) => {
    try {
      const folderRef = doc(db, "deleted_folders", folder.id);
      await deleteDoc(folderRef);
  
      setDeletedItems(prevItems => prevItems.filter(f => f.id !== folder.id));
      console.log(`${folder.name} has been permanently deleted.`);
    } catch (error) {
      console.error("Error deleting folder forever: ", error);
    }
  };
  
  


      useEffect(() => {
        const autoDeleteOldFolders = async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Set to 30 days ago
          
            const oldFoldersQuery = query(
              collection(db, "deleted_folders"),
              where("deletedAt", "<=", thirtyDaysAgo)
            );
          
            const querySnapshot = await getDocs(oldFoldersQuery);
            const deletionPromises = [];
            querySnapshot.forEach((docSnapshot) => {
              deletionPromises.push(deleteDoc(docSnapshot.ref));
            });
          
            // Wait for all deletions to complete
            await Promise.all(deletionPromises);
            console.log('FOlders older than 30 days have been deleted.');
          };
          
          // Call the function to initiate the deletion process
          autoDeleteOldFolders().catch(console.error);
          
          
      }, [db])

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
    

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row min-h-[96vh] mb-[10px]"> {/* Add bottom margin */}
        
        <div className="flex-1 overflow-auto"> {/* Main content area flex item */}
          <div className="m-6">
            <SearchBar onSearch={searchDeletedItems} />
          </div>
          <div className='m-3'>
  <div className='m-2 rounded-b-2xl h-[600px]'>
    <h2 className='text-[25px] text-blue-400 font-bold mb-4'>Trash Items</h2>
  
    <div className='grid grid-cols-1 md:grid-cols-[min-content,4.9fr,2.4fr,1.5fr,0.8fr,0.2fr,auto] gap-6 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 mx-4 border-gray-600 text-gray-400'>
      <h2>#</h2>
      <h2>Name</h2>
      <h2>Date Modified</h2>
      <h2>Size</h2>
      <h2>Kind</h2>
      <h2>Action</h2>
    </div>
    {/* Render combined starred items (folders and files) */}
{filteredDeletedItems.length ? (
   filteredDeletedItems.map((item, index) => {
    const dateOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    const dateModified = item.deletedAt ? new Date(item.deletedAt.seconds * 1000).toLocaleDateString('en-US', dateOptions) : 'Unknown';
    const isFolder = item.type === 'folder';
  return isFolder ? (
    <div className='grid grid-cols-[min-content,4.2fr,2.1fr,1.2fr,0.9fr,1fr,auto] gap-6 text-sm items-center p-2 hover:bg-[#343434] rounded-md' key={item.id}>
      <div className="text-center ml-2">{index + 1}</div>
      <div className="flex items-center">
        <img src="/folder.png"  width={35} height={35} className="flex justify-center items-center bg-gray-700 w-11 h-11 p-1 mr-2" alt="Folder" />
        <span>{item.name}</span>
      </div>
      <div className='mx-4'>{dateModified}</div>
      <div className='mx-3'>{item.size}</div>
      <div className='ml-8'>{item.type}</div>
      <div className="file-actions absolute right-[449px]">
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
                  onClick={() => restoreFolder(item)}
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
                  onClick={() => deleteFolderForever(item)}
                  textValue="DeleteForever"
                  >
                    
                  Delete Forever
                  <div className="text-xs text-red-400">
                    <span className='text-gray-400 font-bold'>{getTimeLeft(item.deletedAt)}</span>
                  </div>
                </DropdownItem>

              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
        
      </div>
    ) : (
      <FileItem 
        key={item.id}
        file={item}
        index={index + 1}
        isTrashItem={true}
        onRestore={() => restoreFile(item)}
        onDeleteForever={() => deleteFileForever(item)}
      />
    );
  })
) : (
      <div className='flex flex-col items-center justify-center text-gray-400 mt-[100px]'>
      <img src="/Trash.png" height="400" width="400" alt="No items" className='mb-4' />
      <div className="text-xl text-gray-200 font-Payton">Trash is empty</div>
      <div className="text-sm text-gray-400">Trash items will appear here and will be deleted automatically after 30 days.</div>
    </div>
  )}
</div>
</div>
</div>
<div className={styles.storage} style={{
            flex: 'none', // Ensures that this area doesn't grow or shrink
            width: '25rem', // Adjust the width as desired
            height: '47rem',
            background: 'linear-gradient(to top, #323232, #191919)',
            padding: '10px',
            borderRadius: '5px',
            borderTopLeftRadius: '20px',
            borderBottomLeftRadius: '20px',
          }}>
          <StorageView />
        </div>
  </div>
  </Layout>
  );
}