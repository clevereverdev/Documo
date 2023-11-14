import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, where, onSnapshot } from "firebase/firestore";
import FileItem from "@/File/FileItem";
import FolderItem from "@/Folder/FolderItem"; // Make sure this path is correct
import { app } from "../firebase/firebase";
import Layout from "@/Sidebar";
import SearchBar from "@/Search";

export default function Starred() {
  const [starredFiles, setStarredFiles] = useState([]);
  const [filteredStarredFiles, setFilteredStarredFiles] = useState([]);
  const [starredFolders, setStarredFolders] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('starredSearchHistory');
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    setSearchHistory(parsedHistory);
  }, []);

  const db = getFirestore(app);

  useEffect(() => {
    const filesQuery = query(collection(db, "files"), where("starred", "==", true));
    const foldersQuery = query(collection(db, "Folders"), where("starred", "==", true)); // Adjusted for "Folders" collection

    const unsubscribeFiles = onSnapshot(filesQuery, (querySnapshot) => {
      const files = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setStarredFiles(files);
      setFilteredStarredFiles(files); // Initialize with all starred files
    });

    const unsubscribeFolders = onSnapshot(foldersQuery, (querySnapshot) => {
      const folders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setStarredFolders(folders); // Set starred folders
    });

    return () => {
      unsubscribeFiles();
      unsubscribeFolders();
    };
  }, [db]);

  // Define a search function for starred files
  const searchStarredFiles = (searchTerm) => {
    if (searchTerm.trim() === '') {
      // If the search bar is empty, show all starred files
      setFilteredStarredFiles(starredFiles);
    } else {
      // Filter the starredFiles based on the search term
      const filteredFiles = starredFiles.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStarredFiles(filteredFiles);
    }
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
  
  return (
    <Layout>
    <div className="m-5">
    <SearchBar onSearch={searchStarredFiles} />
    </div>
    <div className='m-4'>
        <div className='bg-[#171717] mx--1 my-5 p-5 rounded-2xl' style={{ minHeight: '250px' }}>
          <h2 className='text-[18px] font-Payton mb-4'>Starred Folders</h2>
          {/* Render starred folders */}
          {starredFolders.map((folder, index) => (
            <FolderItem key={folder.id} folder={folder} index={index + 1} />
          ))}
        </div>
        </div>
    <div className='m-4'>
      <div 
        className='bg-[#171717] mx--1 my-5 p-5 rounded-2xl' 
        style={{ minHeight: '500px' }} // Set a minimum height here
      >
        <h2 className='text-[18px] font-Payton mb-4'>Starred Files</h2>
        <div className='grid grid-cols-1 md:grid-cols-[min-content,3fr,2fr,1fr,1fr,1fr,auto] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'>
          <h2>#</h2>
          <h2 className='ml-5'>Name</h2>
          <h2>Date Modified</h2>
          <h2>Size</h2>
          <h2>Kind</h2>
          <h2>Action</h2>
        </div>
        {filteredStarredFiles.length ? ( 
          filteredStarredFiles.map((file, index) => (
            <FileItem key={file.id} file={file} index={index + 1} />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center text-gray-400 mt-10' style={{ height: '100%' }}>
            <img src="/starred.png" height="200" width="200" alt="No files" className='mb-4' />
            <div className="text-xl text-gray-200 font-Payton">No starred files yet.</div>
            <div className="text-sm text-gray-400">Add files that you want to easily find later</div>
          </div>
        )}
      </div>
    </div>
  </Layout>
  );
}