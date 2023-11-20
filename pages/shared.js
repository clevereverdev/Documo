import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, onSnapshot, where } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import SearchBar from "@/Search";
import { app } from "../firebase/firebase";
import { useAuth } from "../firebase/auth";

export default function Shared() {
    const [sharedFiles, setSharedFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const db = getFirestore(app);
    const { authUser } = useAuth(); // Use useAuth() to get the authenticated user
  
    useEffect(() => {
      if (authUser) {
        const currentUserEmail = authUser.email; // Get the email from the authUser object
        const q = query(collection(db, "files"), where("sharedWith", "array-contains", currentUserEmail));
  
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const files = [];
          querySnapshot.forEach((doc) => {
            files.push({ ...doc.data(), id: doc.id });
          });
          setSharedFiles(files);
        });
  
        return () => unsubscribe();
      }
    }, [db, authUser]); // Include authUser in the dependency array
  

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredFiles = searchTerm
    ? sharedFiles.filter(file => file.name.toLowerCase().includes(searchTerm))
    : sharedFiles;

  // Add functionality for user actions on shared files here if needed

  return (
    <Layout>
      <div className="m-5">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='m-4'>
        <h2 className='text-[18px] font-Payton mb-4'>Shared Files</h2>
        <div className='grid grid-cols-1 md:grid-cols-[min-content,1.5fr,1fr,1fr,1fr,1fr,auto] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'>
          <h2>#</h2>
          <h2 className='ml-3'>Name</h2>
          <h2>Date Modified</h2>
          <h2>Size</h2>
          <h2>Kind</h2>
          <h2>Action</h2>
        </div>
        {filteredFiles.length ? (
          filteredFiles.map((file, index) => (
            <FileItem 
  key={file.id}
  file={{ ...file, sensitive: false, password: '' }} // Override sensitive and password properties
  index={index + 1}
  // You can pass additional props if needed for shared file actions
/>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center text-gray-400 mt-10'>
            <p>No shared files.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
