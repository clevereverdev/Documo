// StorageData.js
import { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, where, getFirestore } from "firebase/firestore";
import { useAuth } from "../../firebase/auth"; // Assuming useAuth returns the current user

const useStorageData = () => {
  const [fileData, setFileData] = useState({
    documents: [],
    images: [],
    videos: [],
    music: [],
    others: []
  });
  const { authUser } = useAuth(); // Get the current authenticated user

  useEffect(() => {
    if (authUser) {
      const db = getFirestore();
      const filesQuery = query(collection(db, "files"), where("createdBy", "==", authUser.email));

      // Use onSnapshot to listen for real-time updates
      const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
        const updatedFiles = snapshot.docs.map(doc => doc.data());
        // Categorize files based on their type
        const categorizedFiles = {
          documents: updatedFiles.filter(file => file.type === 'pdf'),
          images: updatedFiles.filter(file => ['jpeg', 'webp', 'png'].includes(file.type)),
          videos: updatedFiles.filter(file => file.type === 'mov'),
          music: updatedFiles.filter(file => file.type === 'mp3'),
          others: updatedFiles.filter(file => !['pdf', 'jpeg', 'webp', 'png', 'mov', 'mp3'].includes(file.type))
        };
        setFileData(categorizedFiles);
      });

      // Unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [authUser]);

  return fileData;
};

export default useStorageData;
