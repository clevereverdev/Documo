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
import StorageView from '../components/Storage/StorageView';



export default function Home() {
  const { authUser } = useAuth();
  const router = useRouter();
  const [folderList, setFolderList] = useState([])
  const [fileList, setFileList] = useState([])

  const db = getFirestore(app)
  const { parentFolderId, setParentFolderId } = useContext(ParentFolderIdContext)
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  const [filteredFiles, setFilteredFiles] = useState([]); // Filtered file list
  const [filteredFolders, setFilteredFolders] = useState([]); // Filtered file list

  // ...

  const handleSearchFile = (searchTerm) => {
    if (searchTerm.trim() === '') {
      // If the search bar is empty, show all files
      setFilteredFiles(fileList);
    } else {
      // Filter the fileList based on the search term
      const file = fileList.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(file);
    }
  };

  const handleSearchFolder = (searchTerm) => {
    if (searchTerm.trim() === '') {
      // If the search bar is empty, show all files
      setFilteredFolders(folderList);
    } else {
      // Filter the fileList based on the search term
      const folder = folderList.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFolders(folder);
    }
  };

  useEffect(() => {
    // Initialize the filteredFiles with the entire fileList
    setFilteredFiles(fileList);
  }, [fileList]);

  useEffect(() => {
    // Initialize the filteredFiles with the entire fileList
    setFilteredFolders(folderList);
  }, [folderList]);

  const handleCombinedSearch = (searchTerm) => {
    handleSearchFile(searchTerm); // Call the first search function
    handleSearchFolder(searchTerm); // Call the second search function
  };

  useEffect(() => {
    if (!authUser) {
      router.push("Authentication/Login")
    } else {
      setFolderList([]);
      getFolderList();
      getFileList();
    }
    setParentFolderId(0);
  }, [authUser])

  const getFolderList = async () => {
    setFolderList([]);
    const q = query(collection(db, "Folders"),
      where("parentFolderId", '==', 0),
      where("createBy", '==', authUser.email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      setFolderList(folderList => ([...folderList, doc.data()]))
    });
  }

  const getFileList = async () => {
    setFileList([]);
    const q = query(collection(db, "files"),
      where("parentFolderId", '==', 0),
      where("createdBy", '==', authUser.email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      setFileList(fileList => ([...fileList, doc.data()]))
    });
  }

const onNewFolderAdded = (newFolder) => {
  console.log("Adding new folder:", newFolder);
  setFolderList(currentFolders => [...currentFolders, newFolder]);
};

const onNewFileCreated = (newFile) => {
  setFileList(currentFiles => [...currentFiles, newFile]);
};

const onFolderDeleted = (deletedFolderId) => {
  setFolderList(currentFolders => currentFolders.filter(folder => folder.id !== deletedFolderId));
};

const onFileDeleted = (deletedFileId) => {
  setFileList(currentFiles => currentFiles.filter(file => file.id !== deletedFileId));
};


  return !authUser ? (
    <Loader />
  ) : (
    <Layout 
     onNewFolderAdded={onNewFolderAdded}
     onNewFileAdded={onNewFileCreated} 
     setFolderList={setFolderList} 
     setFileList={setFileList}

    >
      <div className={styles.container}>
        <div className={styles.home}>
          <SearchBar onSearch={handleCombinedSearch} />
          <FolderList folderList={filteredFolders} onFolderDeleted={onFolderDeleted}/>
          <FileList fileList={filteredFiles} onFileDeleted={onFolderDeleted} />
        </div>

        {/* <div className="w-1/4">
          <StorageView />
        </div> */}
        <div className={styles.storage}
          style={{
            background: 'linear-gradient(to top, #323232, #191919)',
            padding: '10px',
            borderRadius: '5px',
            borderTopLeftRadius: '20px',
            borderBottomLeftRadius: '20px'
          }}>
             <StorageView />
        </div>
      </div>
    </Layout>
  );
}
