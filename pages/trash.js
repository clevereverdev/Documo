import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, onSnapshot, doc, deleteDoc, setDoc, where } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import FolderItem from "@/Folder/FolderItem"; // Make sure this path is correct
import SearchBar from "@/Search";
import { app } from "../firebase/firebase";

export default function Trash() {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [deletedFolders, setDeletedFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const db = getFirestore(app);

  useEffect(() => {
    // Fetch deleted files
    const filesQuery = query(collection(db, "deleted_files"));
    const unsubscribeFiles = onSnapshot(filesQuery, (querySnapshot) => {
      const files = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'file' }));
      setDeletedFiles(files);
    });

    // Fetch deleted folders
    const foldersQuery = query(collection(db, "deleted_folders"));
    const unsubscribeFolders = onSnapshot(foldersQuery, (querySnapshot) => {
      const folders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'folder' }));
      setDeletedFolders(folders);
    });

    return () => {
      unsubscribeFiles();
      unsubscribeFolders();
    };
  }, [db]);

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };
  // Add state for search terms specific to folders and files
  const [searchTermFolders, setSearchTermFolders] = useState('');
  const [searchTermFiles, setSearchTermFiles] = useState('');

  // ... useEffect hooks ...

  const handleSearchFolders = (term) => {
    setSearchTermFolders(term.toLowerCase());
  };

  const handleSearchFiles = (term) => {
    setSearchTermFiles(term.toLowerCase());
  };

  // Filter folders and files separately
  const filteredFolders = searchTermFolders
    ? deletedFolders.filter(folder => folder.name.toLowerCase().includes(searchTermFolders))
    : deletedFolders;

  const filteredFiles = searchTermFiles
    ? deletedFiles.filter(file => file.name.toLowerCase().includes(searchTermFiles))
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

      const restoreFolder = async (folder) => {
        // Reference to the document in the 'deleted_files' collection
        const folderRef = doc(db, "deleted_folders", folder.id.toString());
        
        // Reference to the document in the 'files' collection (if moving it back)
        const restoredFolderRef = doc(db, "Folders", folder.id.toString());
      
        try {
          // Remove from 'deleted_files' and add back to 'files' collection
          await deleteDoc(folderRef);  // Delete from 'deleted_files'
          await setDoc(restoredFolderRef, {
            ...folder,
            deleted: false, // Set deleted to false
            deletedAt: null, // Optionally remove the 'deletedAt' field
          });
      
          // Optionally update the local state to remove the file from the list
          setDeletedFiles(prevFolders => prevFolders.filter(f => f.id !== folder.id));
      
          // Show success message
          console.log(`${folder.name} has been restored.`);
          // Add any user notification logic here
        } catch (error) {
          console.error("Error restoring file: ", error);
          // Display error message to user
          // Add any user notification logic here
        }
      };
    
      const deleteFolderForever = async (folder) => {
       // If you're using a 'deleted_files' collection, reference that
        // Otherwise, it's just the 'files' collection
        const folderRef = doc(db, "deleted_folders", folder.id.toString());
        try {
          await deleteDoc(folderRef);
          console.log(`${folder.name} has been permanently deleted.`);
          // Show a toast or snackbar message here if you wish
        } catch (error) {
          console.error("Error deleting folder forever: ", error);
          // Handle the error, maybe show a message to the user
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
    
      

  return (
    <Layout>
      <div className="m-5">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='m-4'>
        <h2 className='text-[18px] font-Payton mb-4'>Deleted Folders</h2>
        {/* Render the deleted folders here */}
        {filteredFolders.map((folder, index) => (
         <FolderItem 
         key={folder.id}
         folder={folder}
         isTrash={true}
         onRestore={restoreFolder}
         onDeleteForever={deleteFolderForever}
       />
        ))}
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
