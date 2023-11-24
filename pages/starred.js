import React, { useState, useEffect, useRef } from "react";
import { collection, getFirestore, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import FileItem from "@/File/FileItem";
import FolderItem from "@/Folder/FolderItem";
import { app } from "../firebase/firebase";
import Layout from "@/Sidebar";
import SearchBar from "@/Search";
import StorageView from '../components/Storage/StorageView';
import styles from "../styles/Home.module.css";
import {Select, SelectItem, Avatar} from "@nextui-org/react";

export default function Starred() {
  const [starredItems, setStarredItems] = useState([]);
  const [filteredStarredItems, setFilteredStarredItems] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('starredSearchHistory');
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
    const filesQuery = query(collection(db, "files"), where("starred", "==", true));
    const foldersQuery = query(collection(db, "Folders"), where("starred", "==", true));

    const unsubscribeFiles = onSnapshot(filesQuery, (fileSnapshot) => {
      const files = fileSnapshot.docs.map(doc => {
        const data = doc.data();
        const extension = getFileExtension(data.name); // Extract the file extension
        return { ...data, id: doc.id, type: extension }; // Use the extracted extension
      });
      
      // Combine with folders (assuming folders are handled separately)
  const unsubscribeFolders = onSnapshot(foldersQuery, (folderSnapshot) => {
    const folders = folderSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      type: 'folder',
      imageUrl: '/folder.png', // Static image URL for folders
      size: 'Unknown' // Folders will always have 'Unknown' size
    }));
        
        // Combine and set starred items
        setStarredItems([...files, ...folders]);
        setFilteredStarredItems([...files, ...folders]);

      });
    });

    return () => {
      unsubscribeFiles();
      //unsubscribeFolders(); // Uncomment if necessary
    };
  }, [db]);


  // Define a search function for starred files
const searchStarredItems = (searchTerm) => {
  let searchResult = [];
  if (searchTerm.trim() === '') {
    // If the search bar is empty, show all starred items
    searchResult = [...starredItems];
  } else {
    // Filter the starredItems based on the search term
    searchResult = starredItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  // Update the filtered starred items list
  setFilteredStarredItems(searchResult);

  // Update search history if the term is not already in the history
  if (searchTerm && !searchHistory.includes(searchTerm)) {
    const newHistory = [searchTerm, ...searchHistory].slice(0, 5);
    updateSearchHistory(newHistory);
  }
};

  const updateSearchHistory = (newHistory) => {
    setSearchHistory(newHistory);
    localStorage.setItem('starredSearchHistory', JSON.stringify(newHistory));
  };
// Event handler for showing only files
// const showFilesOnly = () => {
//   console.log("Filtering for files, Items:", starredItems);
//   const files = starredItems.filter(item => item.type !== 'folder' && item.type !== 'Folder');
//   console.log("Filtered Files:", files);
//   setFilteredStarredItems(files);
// };

// // Event handler for showing only folders
// const showFoldersOnly = () => {
//   console.log("Filtering for folders, Items:", starredItems);
//   const folders = starredItems.filter(item => item.type === 'folder' || item.type === 'Folder');
//   console.log("Filtered Folders:", folders);
//   setFilteredStarredItems(folders);
// };

// New state for sorting

// Add this function inside your Starred.js component
const toggleStar = async (file) => {
  const fileRef = doc(db, "files", file.id);

  // Toggle the 'starred' property
  const newStarredStatus = !file.starred;
  await updateDoc(fileRef, {
    starred: newStarredStatus
  });

  // Update the local state to reflect the change
  const updateStarredItems = (items) => items.map(f => {
    if (f.id === file.id) {
      return { ...f, starred: newStarredStatus };
    }
    return f;
  });

  setStarredItems(prevItems => updateStarredItems(prevItems));
  setFilteredStarredItems(prevItems => updateStarredItems(prevItems));
};






  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[727px]" style={{ gap: '1rem', marginBottom: '2rem' }}> {/* Add bottom margin */}
        
        <div className="flex-1 overflow-auto"> {/* Main content area flex item */}
          <div className="m-6">
            <SearchBar onSearch={searchStarredItems} />
          </div>
          <div className='m-3'>
  <div className='m-2 rounded-b-2xl h-[600px]'>
    <h2 className='text-[25px] text-blue-400 font-bold mb-4'>Starred Items</h2>
  
    <div className='grid grid-cols-1 md:grid-cols-[min-content,3.9fr,1.8fr,1.2fr,1fr,1fr,auto] gap-6 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 mx-4 border-gray-600 text-gray-400'>
      <h2>#</h2>
      <h2>Name</h2>
      <h2>Date Modified</h2>
      <h2>Size</h2>
      <h2>Kind</h2>
      <h2>Action</h2>
    </div>
    {/* Render combined starred items (folders and files) */}
{filteredStarredItems.length ? (
  filteredStarredItems.map((item, index) => {
    const isFolder = item.type === 'Folder';
    const fileExtension = isFolder ? 'Folder' : item.name.split('.').pop(); // Extracts 'png' from "image.png"
    return isFolder ? (
      <FolderItem 
        key={item.id}
        index={index + 1}
        folder={item}
        name={item.name}
        dateModified={item.dateModified || 'Unknown'}
        kind={fileExtension}
      />
    ) : (
      <FileItem 
        key={item.id}
        index={index + 1}
        file={item}
        name={item.name}
        dateModified={item.dateModified}
        size={item.size}
        kind={fileExtension}
        onToggleStar={() => toggleStar(item)} // Pass the function here
        />
    );
      })
    ) : (
      <div className='flex flex-col items-center justify-center text-gray-400 mt-[100px]'>
        <img src="/starred.png" height="400" width="400" alt="No items" className='mb-4' />
        <div className="text-xl text-gray-200 font-Payton">No starred documents yet.</div>
        <div className="text-sm text-gray-400">Add Documents that you want to easily find later</div>
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