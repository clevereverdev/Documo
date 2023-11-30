import React, { useEffect, useState } from "react";
import { collection, getFirestore, query, onSnapshot, where, doc, getDoc, getDocs  } from "firebase/firestore";
import Layout from "@/Sidebar";
import FileItem from "@/File/FileItem";
import FolderItem from "@/Folder/FolderItem";
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
                sharedFoldersData.push({ ...doc.data(), id: doc.id, isFolder: true });
              }
            });
  
            const unsubscribeEditorFolders = onSnapshot(editorFoldersQuery, (editorSnapshot) => {
              const editorFoldersData = [];
              editorSnapshot.forEach((doc) => {
                editorFoldersData.push({ ...doc.data(), id: doc.id, isEditorCopy: true, isFolder: true });
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
  filteredFiles.map((item, index) => (
    <div key={item.id} className='flex items-center hover:bg-[#343434] h-[60px] rounded-lg mt-2' >
      {item.isFolder ? (
        <FolderItem
          folder={{ ...item, sensitive: false, password: '' }}
          index={index + 1}
          isSharedContext={true}
        />
      ) : (
        // Render file item
        <FileItem
          file={{ ...item, sensitive: false, password: '' }}
          index={index + 1}
          isSharedContext={true}
        />
      )}
      <div className='mx-3'>{item.sharedBy}</div>
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