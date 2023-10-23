import Layout from "@/Sidebar";
import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, where, onSnapshot } from "firebase/firestore";
import FileItem from "@/File/FileItem";
import { app } from "../firebase/firebase";
import SearchBar from "@/Search";

export default function Contact() {
  const [starredFiles, setStarredFiles] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const q = query(collection(db, "files"), where("starred", "==", true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ ...doc.data(), id: doc.id });
      });
      setStarredFiles(files);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [db]);
  return (
    <Layout>
    <div className="m-5">
      <SearchBar />
    </div>
    <div className='m-4'>
      <div 
        className='bg-[#171717] mx--1 my-5 p-5 rounded-2xl' 
        style={{ minHeight: '500px' }} // Set a minimum height here
      >
        <h2 className='text-[18px] font-Payton mb-4'>Starred Files</h2>
        <div className='grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'>
          <h2 className='ml-5'>Name</h2>
          <h2>Date Modified</h2>
          <h2>Size</h2>
          <h2>Kind</h2>
          <h2>Action</h2>
        </div>
        {starredFiles.length ? ( 
          starredFiles.map((file) => (
            <FileItem key={file.id} file={file} />
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











































