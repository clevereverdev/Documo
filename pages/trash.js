import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, onSnapshot } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import SearchBar from "@/Search";
import { app } from "../firebase/firebase";
import { doc, deleteDoc, setDoc, where, getDocs } from "firebase/firestore";

export default function Trash() {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const db = getFirestore(app);

  useEffect(() => {
    const q = query(collection(db, "deleted_files"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const files = [];
        querySnapshot.forEach((doc) => {
            files.push({ ...doc.data(), id: doc.id });
        });
        setDeletedFiles(files);
    });

    return () => unsubscribe();
  }, [db]);

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredFiles = searchTerm
    ? deletedFiles.filter(file => file.name.toLowerCase().includes(searchTerm))
    : deletedFiles;

    const restoreFile = async (file) => {
        // Reference to the document in the 'deleted_files' collection
        const fileRef = doc(db, "deleted_files", file.id.toString());
        
        // Reference to the document in the 'files' collection (if moving it back)
        const restoredFileRef = doc(db, "files", file.id.toString());
      
        try {
          // Remove from 'deleted_files' and add back to 'files' collection
          await deleteDoc(fileRef);  // Delete from 'deleted_files'
          await setDoc(restoredFileRef, {
            ...file,
            deleted: false, // Set deleted to false
            deletedAt: null, // Optionally remove the 'deletedAt' field
          });
      
          // Optionally update the local state to remove the file from the list
          setDeletedFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
      
          // Show success message
          console.log(`${file.name} has been restored.`);
          // Add any user notification logic here
        } catch (error) {
          console.error("Error restoring file: ", error);
          // Display error message to user
          // Add any user notification logic here
        }
      };
      
      const deleteFileForever = async (file) => {
        // If you're using a 'deleted_files' collection, reference that
        // Otherwise, it's just the 'files' collection
        const fileRef = doc(db, "deleted_files", file.id.toString());
        try {
          await deleteDoc(fileRef);
          console.log(`${file.name} has been permanently deleted.`);
          // Show a toast or snackbar message here if you wish
        } catch (error) {
          console.error("Error deleting file forever: ", error);
          // Handle the error, maybe show a message to the user
        }
      };

      useEffect(() => {
        const autoDeleteOldFiles = async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Set to 30 days ago
          
            const oldFilesQuery = query(
              collection(db, "deleted_files"),
              where("deletedAt", "<=", thirtyDaysAgo)
            );
          
            const querySnapshot = await getDocs(oldFilesQuery);
            const deletionPromises = [];
            querySnapshot.forEach((docSnapshot) => {
              deletionPromises.push(deleteDoc(docSnapshot.ref));
            });
          
            // Wait for all deletions to complete
            await Promise.all(deletionPromises);
            console.log('Files older than 30 days have been deleted.');
          };
          
          // Call the function to initiate the deletion process
          autoDeleteOldFiles().catch(console.error);
          
          
      }, [db])
      

  return (
    <Layout>
      <div className="m-5">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='m-4'>
        <h2 className='text-[18px] font-Payton mb-4'>Deleted Files</h2>
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
            file={file}
            index={index + 1}
            isTrashItem={true}
            onRestore={restoreFile}
            onDeleteForever={deleteFileForever}
/>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center text-gray-400 mt-10'>
            <p>No files in Trash.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
