// StorageData.js
import { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, where, getFirestore } from "firebase/firestore";
import { useAuth } from "../../firebase/auth"; // Assuming useAuth returns the current user

const useStorageData = () => {
  const [fileData, setFileData] = useState({
    documents: [],
    images: [],
    archives: [],
    music: [],
    others: [],
  });
  const { authUser } = useAuth(); // Get the current authenticated user

  useEffect(() => {
    if (authUser) {
      const db = getFirestore();
      const filesQuery = query(collection(db, "files"), where("createdBy", "==", authUser.email));

      const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
        const updatedFiles = snapshot.docs.map((doc) => doc.data());
        // Categorize files based on their type and extension
        // Define the extensions for each category
        const documentExtensions = ['txt', 'pdf'];
        const imageExtensions = ['png', 'jpeg'];
        const archiveExtensions = ['zip'];
        const musicExtensions = ['mp3'];

        // Categorize files based on their type and extension
        const categorizedFiles = {
          documents: updatedFiles.filter((file) => documentExtensions.includes(file.type)),
          images: updatedFiles.filter((file) => imageExtensions.includes(file.type)),
          archives: updatedFiles.filter((file) => archiveExtensions.includes(file.type)),
          music: updatedFiles.filter((file) => musicExtensions.includes(file.type)),
          others: updatedFiles.filter((file) => 
            !documentExtensions.includes(file.type) &&
            !imageExtensions.includes(file.type) &&
            !archiveExtensions.includes(file.type) &&
            !musicExtensions.includes(file.type))
        };
        setFileData(categorizedFiles);
      });

      return () => unsubscribe();
    }
  }, [authUser]);

  return fileData;
};

export default useStorageData;
