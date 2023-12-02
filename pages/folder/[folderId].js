import React, { useContext, useEffect, useState } from 'react'
import SearchBar from "@/Search";
import Layout from '@/Sidebar';
import styles from "../../styles/Home.module.css";
import { ParentFolderIdContext } from '../../context/ParentFolderIdContext';
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebase/firebase';
import { useAuth } from "../../firebase/auth";
import FolderList from '../../components/Folder/FolderList';
import { ShowToastContext } from '../../context/ShowToastContext';
import FileList from '@/File/FileList';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from 'next/router';
import { IoIosArrowBack } from "react-icons/io";
import { MdLocationPin } from "react-icons/md";
import { Tooltip } from "@nextui-org/react";
import StorageView from '../../components/Storage/StorageView';





function FolderDetails() {
  const router = useRouter();
  const { name, id } = router.query;
  const { authUser } = useAuth();
  const { parentFolderId, setParentFolderId }
    = useContext(ParentFolderIdContext)

  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  const [folderList, setFolderList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const { addNotification } = useNotifications();

  const db = getFirestore(app)

  useEffect(() => {
  setParentFolderId(id);
  if (id && authUser) {
    setFolderList([]);
    setFileList([]);
    getFolderList();
    getFileList();
  }
}, [id, authUser]); 

  const deleteFolder = async () => {
    try {
      await deleteDoc(doc(db, "Folders", id));
      setShowToastMsg('Folder Deleted!');
      addNotification('image', { src: './folder.png', message: 'Folder deleted successfully.' });
      router.back();
    } catch (error) {
      console.error("Error deleting folder: ", error);
      setShowToastMsg('Error deleting folder.');
      addNotification('error', { message: 'Error deleting folder.' });
    }
  };


  const getFolderList = async () => {
    setFolderList([]);
    const q = query(collection(db, "Folders"),
      where("createBy", '==', authUser.email),
      where("parentFolderId", "==", id));
    console.log("InFolderList")
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      setFolderList(folderList => ([...folderList, doc.data()]))
    });
  }

  //Maintain the state of the folders
  useEffect(() => {
    if (!id || !authUser) return;
  
    // Reference to the folders collection
    const q = query(collection(db, "Folders"),
      where("createBy", '==', authUser.email),
      where("parentFolderId", "==", id));
  
    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const folders = [];
      querySnapshot.forEach((doc) => {
        folders.push({ ...doc.data(), id: doc.id });
      });
      setFolderList(folders);
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [id, authUser]);
  

  const getFileList = async () => {
    setFileList([]);
    const q = query(collection(db, "files"),
      where("parentFolderId", '==', id),
      where("createdBy", '==', authUser.email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setFileList(fileList => ([...fileList, doc.data()]))
    });
  };

  useEffect(() => {
    if (!id || !authUser) return;
  
    // Set up a real-time listener for files
    const filesQuery = query(collection(db, "files"),
      where("parentFolderId", '==', id),
      where("createdBy", '==', authUser.email));
  
    const unsubscribeFiles = onSnapshot(filesQuery, (querySnapshot) => {
      const updatedFiles = [];
      querySnapshot.forEach((doc) => {
        updatedFiles.push({ ...doc.data(), id: doc.id });
      });
      setFileList(updatedFiles);
    });
  
    // Clean up the listener when the component unmounts
    return () => {
      unsubscribeFiles();
    };
  }, [id, authUser]);
  

    // Handler to navigate back to home
    const Dashboard = () => {
      router.push('/');
    };
  

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.home}>
          {/* Simple navigation without React context */}
          
          <SearchBar />
          
          <div className='flex items-center'>
          <Tooltip
        content="Go Back"
        placement="bottom"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
      >
          <div onClick={Dashboard} className="dashboard-link cursor-pointer font-bold text-xl my-7 text-white hover:bg-gray-700 opacity-85 rounded-full p-3 hover:text-yellow-400">
            Dashboard
          </div>
          </Tooltip>
         
          {<IoIosArrowBack className='mx-1'/>} 
          <h2 className='font-bold text-xl text-gray-400 px-3 italic hover:text-gray-200'>{name}</h2>(<MdLocationPin className='text-red-500'/>)
          </div>
          {folderList.length > 0 ? (
            <FolderList
              folderList={folderList}
              fileList={fileList}
              isBig={false}
            />
          ) : (
            <div className='flex flex-col justify-center items-center bg-[#242424] h-[200px] w-full mb-3 rounded-2xl'>
              <img src="/NoFolder.png" alt="No Folder" className='w-[300px] h-[150px]'/>
            <span className='text-gray-400 text-[16px]'>No Folder Found</span>
            <span className='text-gray-500 text-[12px] mb-3'>Drop folders using add folder button</span>
            </div>
          )}
          {fileList.length > 0 ? (
            <FileList fileList={fileList} />
          ) : (
            <div className='flex flex-col justify-center items-center bg-[#242424] h-[200px] w-full mb-3 rounded-2xl'>
              <img src="/NoFiles.webp" alt="No Folder" className='w-[100px] h-[100px] mt-[200px]'/>
            <span className='text-gray-400 text-[16px]'>No Files Found</span>
            <span className='text-gray-500 text-[12px] mb-3'>Drop files using add files button</span>
            </div>
          )}
          

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

export default FolderDetails

 {/* <svg xmlns="http://www.w3.org/2000/svg"
              onClick={() => deleteFolder()}
              fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor"
              className="w-5 h-5 float-right text-red-500
           hover:scale-110 transition-all cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg> */}