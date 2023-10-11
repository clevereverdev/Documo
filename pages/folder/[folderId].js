import React, { useEffect, useContext, useState } from 'react'
import styles from "../../styles/Home.module.css";
import SearchBar from "@/Search";
import Layout from '@/Sidebar';
import { useAuth } from '../../firebase/auth';
import { ParentFolderIdContext } from "context/ParentFolderIdContext";
import { useRouter } from 'next/router';
import { app } from '../../firebase/firebase';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import FolderList from '@/Folder/FolderList';
import { ShowToastContext } from 'context/ShowToastContext';


function FolderDetails() {
    const router = useRouter();
    const { Name, folderId } = router.query;
    const { parentFolderId, setParentFolderId } = useContext(ParentFolderIdContext);
    const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext)
    const db = getFirestore(app)
    const [folderList, setFolderList] = useState([]);
    const { authUser } = useAuth();

    useEffect(() => {
        setParentFolderId(folderId)
        if (authUser) {
            getFolderList();
        }
    }, [folderId, authUser, showToastMsg])

    const getFolderList = async () => {
        setFolderList([]);
        const q = query(collection(db, 'Folders'),
            where('CreatedBy', '==', authUser.email),
            where("parentFolderId", "==", folderId));
        console.log('In folder list');

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            setFolderList(folderList => ([...folderList, doc.data()]))

        });
    }


    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.home}>
                    <SearchBar />
                    <h2 className='text-[20px] font-bold mt-5'>{Name}</h2>
                    {folderList.length>0? <FolderList 
        folderList={folderList}
        isBig={false}/>:
        <h2 className='text-gray-400
        text-[16px] mt-5'>No Folder Found</h2>}
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
    )
}

export default FolderDetails