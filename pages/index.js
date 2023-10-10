import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/auth";
import { useRouter } from "next/router";
import Loader from "../components/loader";
import Layout from "@/Sidebar";
import SearchBar from "@/Search";
import FolderList from '../components/Folder/FolderList';
import FileList from "@/File/FileList";
import CreateFolderModel from '../components/Folder/CreateFolderModel';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from "../firebase/firebase";

export default function Home() {
    const { authUser, isLoading } = useAuth();
    const [showSideNavbar, setShowSideNavbar] = useState(false);
    const [folderList,setFolderList]=useState([])
    const [fileList,setFileList]=useState([])
    const router = useRouter();
    const db = getFirestore(app);
    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("Authentication/Login");
        } else if (!isLoading && authUser) {
            setShowSideNavbar(true);
            getFolderList();
        }
    }, [authUser, isLoading, router]);

    const getFolderList = async() => {
        setFolderList([]);
        const q = query(collection(db, 'Folders'),
            where('CreatedBy', '==', authUser.email));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            setFolderList(folderList=>([...folderList,doc.data()]))

        });
    }
    return !authUser ? (
        <Loader />
    ) : (
        <Layout>
            <div className={styles.container}>
                <div className={styles.home}>
                    <SearchBar />
                    <FolderList folderList={folderList}/>
                    <FileList />
                </div>
                <div className={styles.storage}
                    style={{
                        backgroundColor: '#c026d3',
                        padding: '10px',
                        borderRadius: '5px'
                    }}>
                    <h1 className='text-md mb-5 font-bold'>Storage</h1>
                </div>
            </div>
        </Layout>
    );
}

