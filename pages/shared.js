import React, { useEffect, useState, useContext } from "react";
import Image from 'next/image'
import { collection, getFirestore, query, onSnapshot, where, doc, getDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import SearchBar from "@/Search";
import { app } from "../firebase/firebase";
import { useAuth } from "../firebase/auth";
import styles from "../styles/Home.module.css";
import StorageView from '../components/Storage/StorageView';
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { FaDownload, FaTrash } from "react-icons/fa6";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn, Tooltip } from "@nextui-org/react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ShowToastContext } from '../context/ShowToastContext';

export default function Shared() {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const db = getFirestore(app);
  const { authUser } = useAuth();
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  useEffect(() => {
    if (authUser) {
      const currentUserEmail = authUser.email;
  
      const sharedFilesQuery = query(
        collection(db, "shared_files"),
        where("sharedWith", "==", currentUserEmail)
      );
  
      const editorFilesQuery = query(
        collection(db, "files"),
        where("sharedWith", "array-contains", currentUserEmail)
      );
  
      const sharedFoldersQuery = query(
        collection(db, "shared_folders"),
        where("sharedWith", "==", currentUserEmail)
      );
  
      const editorFoldersQuery = query(
        collection(db, "Folders"),
        where("sharedWith", "array-contains", currentUserEmail)
      );
  
      const unsubscribeShared = onSnapshot(sharedFilesQuery, (sharedSnapshot) => {
        const sharedFilesData = [];
        sharedSnapshot.forEach((doc) => {
          if (doc.data().sharedWith === currentUserEmail && doc.data().sharedBy !== currentUserEmail) {
            sharedFilesData.push({ ...doc.data(), id: doc.id });
          }
        });
  
        const unsubscribeEditor = onSnapshot(editorFilesQuery, (editorSnapshot) => {
          const editorFilesData = [];
          editorSnapshot.forEach((doc) => {
            editorFilesData.push({ ...doc.data(), id: doc.id, isEditorCopy: true });
          });
  
          const unsubscribeSharedFolders = onSnapshot(sharedFoldersQuery, (sharedSnapshot) => {
            const sharedFoldersData = [];
            sharedSnapshot.forEach((doc) => {
              if (doc.data().sharedWith === currentUserEmail && doc.data().sharedBy !== currentUserEmail) {
                sharedFoldersData.push({ ...doc.data(), id: doc.id, isFolder: true, imageUrl: '/folder.png',  type: 'folder', size: 'Unknown' // Static image URL for folders
              });
              }
            });
  
            const unsubscribeEditorFolders = onSnapshot(editorFoldersQuery, (editorSnapshot) => {
              const editorFoldersData = [];
              editorSnapshot.forEach((doc) => {
                editorFoldersData.push({ ...doc.data(), id: doc.id, isEditorCopy: true, isFolder: true, imageUrl: '/folder.png',  type: 'folder', size: 'Unknown' // Static image URL for folders
              });
              });
  
              setSharedFiles([...sharedFilesData, ...editorFilesData, ...sharedFoldersData, ...editorFoldersData]);
            });
  
            return () => {
              unsubscribeEditorFolders();
            };
          });
  
          return () => {
            unsubscribeSharedFolders();
          };
        });
  
        return () => {
          unsubscribeEditor();
        };
      });
  
      return () => {
        unsubscribeShared();
      };
    }
  }, [db, authUser]);


  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredFiles = searchTerm
    ? sharedFiles.filter(file => file.name.toLowerCase().includes(searchTerm))
    : sharedFiles;

    // Handler for rename action click, it should set the renaming state
    const renameFolder = async (folderId, newName) => {
      try {
        // First, try to update the folder in the 'shared_folders' collection
        let folderRef = doc(db, "shared_folders", folderId);
        const folderDoc = await getDoc(folderRef);
        if (folderDoc.exists()) {
          await updateDoc(folderRef, { name: newName });
        } else {
          // If not found, try to update the folder in the 'Folders' collection
          folderRef = doc(db, "Folders", folderId);
          const folderDocFolders = await getDoc(folderRef);
          if (folderDocFolders.exists()) {
            await updateDoc(folderRef, { name: newName });
          } else {
            console.error("Folder not found in both collections");
            return;
          }
        }
    
        // Update the state or UI after successful rename
        setSharedFiles(prevFiles => prevFiles.map(file => file.id === folderId ? { ...file, name: newName } : file));
        setShowToastMsg(`Folder renamed to ${newName} successfully!`);
      } catch (error) {
        console.error("Error renaming folder:", error);
        setShowToastMsg('Error renaming folder.');

        // Handle rename error (e.g., show an error message to the user)
      }
    };
    

    const handleRenameClick = (folder) => {
      console.log("Rename clicked for folder ID:", folder.id);
      setEditingFolderId(folder.id);
      setNewFolderName(folder.name);
    };
    
    
    
    
    
    const handleDoubleClick = (folder) => {
      handleRenameClick(folder);
    };
    
    const handleChange = (e) => {
      setNewFolderName(e.target.value);
    };
    
    const handleSubmit = async (e, folderId) => {
      e.preventDefault();
      await renameFolder(folderId, newFolderName);
      console.log("Renaming completed");
      setEditingFolderId(null);
    };
  

    useEffect(() => {
      console.log("editingFolderId changed to:", editingFolderId);
    }, [editingFolderId]);
    
    

    
    

    const downloadFolderAsZip = async (folderId) => {
      let folderRef = doc(db, "shared_folders", folderId);
      let folderSnapshot = await getDoc(folderRef);
    
      if (!folderSnapshot.exists()) {
        // If not found in 'shared_folders', check in 'Folders' collection
        folderRef = doc(db, "Folders", folderId);
        folderSnapshot = await getDoc(folderRef);
        if (!folderSnapshot.exists()) {
          console.error("Folder not found in both collections!");
          return;
        }
      }
    
      const folderData = folderSnapshot.data();
      const filesQuery = query(collection(db, "files"), where("parentFolderId", "==", folderId));
      const querySnapshot = await getDocs(filesQuery);
    
      const zip = new JSZip();
      const folderZip = zip.folder(folderData.name);
    
      for (const fileDoc of querySnapshot.docs) {
        const fileData = fileDoc.data();
        const fileResponse = await fetch(fileData.url);
        const fileBlob = await fileResponse.blob();
        folderZip.file(fileData.name, fileBlob);
      }
    
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, `${folderData.name}.zip`);
        setShowToastMsg(`Folder  downloaded as "${folderData.name}.zip" successfully`);

      });
    };
    

  // Handler for delete action
  const deleteFolder = async (folderId) => {
    let folderRef = doc(db, "shared_folders", folderId);
    const folderSnapshot = await getDoc(folderRef);
  
    if (!folderSnapshot.exists()) {
      // If not found in 'shared_folders', check in 'Folders' collection
      folderRef = doc(db, "Folders", folderId);
      const folderSnapshotFolders = await getDoc(folderRef);
      if (!folderSnapshotFolders.exists()) {
        console.error("Folder not found in both collections!");
        return;
      } else {
        folderRef = doc(db, "Folders", folderId); // Update reference for deletion
      }
    }
  
    try {
      await deleteDoc(folderRef);
      setSharedFiles(prevFiles => prevFiles.filter(file => file.id !== folderId));
      setShowToastMsg(`Folder "${folderSnapshot.data().name}" deleted successfully!`);
    } catch (error) {
      setShowToastMsg("Error deleting folder:");
      console.error("Error deleting folder:", error);
    }
  };
  




    return (
      <Layout>
        <div className="flex flex-col lg:flex-row min-h-[96vh] max-w-[1250px] b-t-[20px] mb-[10px]"> {/* Add bottom margin */}
          
          <div className="flex-1 overflow-auto"> {/* Main content area flex item */}
            <div className="m-6">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className='m-3'>
    <div className='m-2 rounded-b-2xl h-[600px]'>
      <h2 className='text-[25px] text-blue-400 font-bold mb-4'>Shared Items</h2>
    
      <div className='grid grid-cols-1 md:grid-cols-[min-content,3.8fr,2.0fr,1.0fr,0.6fr,2.3fr,auto] gap-6 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 mx-4 border-gray-600 text-gray-400'>        <h2>#</h2>
        <h2>Name</h2>
        <h2>Date Modified</h2>
        <h2>Size</h2>
        <h2>Kind</h2>
        <h2>Action</h2>
        <h2>Shared By</h2>
      </div>
      {/* Render combined starred items (folders and files) */}
      {filteredFiles.length ? (
filteredFiles.map((item, index) => {
  console.log("Editing ID:", editingFolderId, "Item ID:", item.id); // Debugging line
  const isFolder = item.type === 'folder';
  const dateOptions = { year: 'numeric', month: 'short', day: '2-digit' };
  const dateModified = item.sharedAt ? new Date(item.sharedAt.seconds * 1000).toLocaleDateString('en-US', dateOptions) : 'Unknown';
  const fileExtension = isFolder ? 'folder' : item.name.split('.').pop(); // Extracts 'png' from "image.png"
  return isFolder ? (
    <div className='grid grid-cols-1 md:grid-cols-[min-content,1.7fr,0.9fr,0.6fr,1fr,1fr,auto] gap-6 text-[14px] items-center p-2 hover:bg-[#343434] rounded-md' 
    key={item.id}>
   <div className="text-center ml-2">{index + 1}</div>
  <div className="flex items-center">
    <Image src="/folder.png" width={35} height={35} className="flex justify-center items-center bg-gray-700 w-11 h-11 p-1 mr-2" alt="Folder" />
    <div>
    {editingFolderId === item.id ? (
        console.log("Showing input for folder ID:", item.id),

<form onSubmit={(e) => handleSubmit(e, item.id)}>
<input
  autoFocus
  value={newFolderName}
  onChange={handleChange}
/>
</form>
) : (
<span onDoubleClick={() => handleDoubleClick(item)}>
{item.name}
</span>
)}
  </div>
  </div>
    <div className=''>{dateModified}</div>
    <div className=''>{item.size}</div>
    <div className=''>{item.type}</div>

    <div className='absolute right-[450px] text-[15px]'>{item.senderUserName}</div>
    <div className="file-actions absolute right-[610px]">
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
        key="rename"
        shortcut="⌘N"
        startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
        className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
        onClick={() => handleRenameClick(item)}
        >
        Rename
        <div className="text-xs text-gray-500">Give a name</div>
      </DropdownItem>
<DropdownItem
key="download"
shortcut="⌘C"
startContent={<FaDownload className={iconClasses} />}
className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
onClick={() => downloadFolderAsZip(item.id)}
>
Download
<div className="text-xs text-gray-500">
Download in local
</div>
</DropdownItem>
</DropdownSection>
<DropdownSection title="Danger Zone" showDivider>
<DropdownItem
key="delete"
className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
color="danger"
shortcut="⌘D"
startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
onClick={() => deleteFolder(item.id)}
>
Delete
<div className="text-xs text-red-400">
Move to trash
</div>
</DropdownItem>
</DropdownSection>
  </DropdownMenu>
</Dropdown>
      </div>
    </div>
     ) : (
      <div className='flex flex-col-2 items-center hover:bg-[#343434] rounded-md group h-[60px] my-3'>
      <FileItem
        file={{ ...item, sensitive: false, password: '' }}
        index={index + 1}
        isSharedContext={true}
      />
    <div className='absolute right-[450px] text-[15px]'>{item.senderUserName}</div>
    </div>
  );
        })

      ) : (
        <div className='flex flex-col items-center justify-center text-gray-400 mt-[100px]'>
        <Image src="/Shared.png" height="400" width="400" alt="No items" className='mb-4' />
        <div className="text-xl text-gray-200 font-Payton">Files and Folders others shared with you</div>
        <div className="text-sm text-gray-400">Say goodbye to email attachments and say hello to real time collaboration</div>
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





/*
import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, onSnapshot, where, doc, getDoc, getDocs  } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import SearchBar from "@/Search";
import { app } from "../firebase/firebase";
import { useAuth } from "../firebase/auth";
import styles from "../styles/Home.module.css";
import StorageView from '../components/Storage/StorageView';

export default function Shared() {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const db = getFirestore(app);
  const { authUser } = useAuth();


  useEffect(() => {
    if (authUser) {
      const currentUserEmail = authUser.email;
  
      // Query for shared files from 'shared_files' collection
      const sharedFilesQuery = query(
        collection(db, "shared_files"),
        where("sharedWith", "==", currentUserEmail)
      );
  
      // Query for files shared with editor permission from 'files' collection
      const editorFilesQuery = query(
        collection(db, "files"),
        where("sharedWith", "array-contains", currentUserEmail)
      );
  
      const unsubscribeShared = onSnapshot(sharedFilesQuery, (sharedSnapshot) => {
        const sharedFilesData = [];
        sharedSnapshot.forEach((doc) => {
          if (doc.data().sharedWith === currentUserEmail && doc.data().sharedBy !== currentUserEmail) {
            sharedFilesData.push({ ...doc.data(), id: doc.id });
          }
        });
  
        // Query for editor files
        const unsubscribeEditor = onSnapshot(editorFilesQuery, (editorSnapshot) => {
          const editorFilesData = [];
          editorSnapshot.forEach((doc) => {
            editorFilesData.push({ ...doc.data(), id: doc.id, isEditorCopy: true });
          });
  
          // Combine and set shared files data
          setSharedFiles([...sharedFilesData, ...editorFilesData]);
        });
  
        return () => {
          unsubscribeEditor();
        };
      });
  
      return () => {
        unsubscribeShared();
      };
    }
  }, [db, authUser]);
  
  

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredFiles = searchTerm
    ? sharedFiles.filter(file => file.name.toLowerCase().includes(searchTerm))
    : sharedFiles;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[727px]" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div className="flex-1 overflow-auto">
          <div className="m-6">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className='m-3'>
            <div className='m-2 rounded-b-2xl h-[600px]'>
              <h2 className='text-[25px] text-blue-400 font-bold mb-4'>Shared</h2>
              <div className='grid grid-cols-1 md:grid-cols-[min-content,3.1fr,1.3fr,1.0fr,1fr,1fr,auto] gap-6 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 mx-4 border-gray-600 text-gray-400'>
                <h2>#</h2>
                <h2>Name</h2>
                <h2>Date Modified</h2>
                <h2>Size</h2>
                <h2>Kind</h2>
                <h2>Action</h2>
                <h2>Shared By</h2>
              </div>

              {filteredFiles.length ? (
                filteredFiles.map((file, index) => (
                  <div key={file.id} className='flex items-center hover:bg-[#343434] h-[60px] rounded-lg mt-2' >
                    <FileItem
                      file={{ ...file, sensitive: false, password: '' }}
                      index={index + 1}
                      isSharedContext={true}
                    />
                    <div className='mx-3'>{file.sharedBy}</div>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center text-gray-400 mt-[100px]'>
                  <img src="/Shared.png" height="400" width="400" alt="No items" className='mb-4' />
                  <div className="text-xl text-gray-200 font-Payton">Files and Folders others shared with you</div>
                  <div className="text-sm text-gray-400">Say goodbye to email attachments and say hello to real time collaboration</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.storage} style={{
              flex: 'none',
              width: '25rem',
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


*/