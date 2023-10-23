import styles from '../styles/Home.module.css'
import { useAuth } from "../firebase/auth";
import Loader from "../components/loader";
import Layout from "@/Sidebar";
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SearchBar from "@/Search";
import FolderList from '../components/Folder/FolderList';
import FileList from '../components/File/FileList';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../firebase/firebase';
import { ParentFolderIdContext } from '../context/ParentFolderIdContext';
import { ShowToastContext } from '../context/ShowToastContext';

export default function Home() {
  const { authUser } = useAuth();
  const router=useRouter();
  const [folderList,setFolderList]=useState([])
  const [fileList,setFileList]=useState([])

  const db=getFirestore(app)
  const {parentFolderId,setParentFolderId}=useContext(ParentFolderIdContext)
  const {showToastMsg,setShowToastMsg}=useContext(ShowToastContext);

  useEffect(()=>{
    console.log("User Session",)
    if(!authUser)
    {
      router.push("Authentication/Login")
    }
    else{
      setFolderList([]); 
      getFolderList();
      getFileList();

      //console.log("User Session",session.user)
    }
    setParentFolderId(0);

  },[authUser,showToastMsg])

  const getFolderList=async()=>{
    setFolderList([]);
    const q=query(collection(db,"Folders"),
    where("parentFolderId",'==',0),
    where("createBy",'==',authUser.email));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
     console.log(doc.id, " => ", doc.data());
    setFolderList(folderList=>([...folderList,doc.data()]))
}); 
  }

  const getFileList=async()=>{
    setFileList([]);
    const q=query(collection(db,"files"),
    where("parentFolderId",'==',0),
    where("createdBy",'==',authUser.email));
  
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
    // console.log(doc.id, " => ", doc.data());
    setFileList(fileList=>([...fileList,doc.data()]))
}); 
  }

        return !authUser ? (
            <Loader />
        ) : (
            <Layout>
                <div className = {styles.container}>
                    <div className = {styles.home}>
                        <SearchBar />
                        <FolderList folderList = {folderList} />
                        <FileList  fileList = {fileList} />
                    </div>
                    <div className={styles.storage}
                        style={{
                            backgroundColor: '#e2e8f0',
                            padding: '10px',
                            borderRadius: '5px',
                            borderTopLeftRadius: '20px',
                            borderBottomLeftRadius: '20px'

                        }}>
                        <h1 className='text-md mb-5 font-bold text-center'>Storage</h1>
                    </div>
                </div>
            </Layout>
        );
    }
