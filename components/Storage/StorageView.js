import React, { useState, useEffect, useMemo } from 'react';
import { doc, getFirestore, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from "../../firebase/auth"; // Import your useAuth hook
import useStorageData from './StorageData'; // Ensure this hook is implemented correctly
import StoragePlans from './StoragePlans';
import { app } from '../../firebase/firebase'; // Correct path to your firebase config

const StorageView = () => {
  const { authUser } = useAuth();
  const { documents, images, videos, music, others } = useStorageData(); // Use your storage data hook
  const [totalStorageGivenBytes, setTotalStorageGivenBytes] = useState(1024 * 1024); // 1MB by default
  const [path, setPath] = useState('/');
  const db = getFirestore(app);
  const [showStoragePlans, setShowStoragePlans] = useState(false);


  const fetchUserStorageData = async () => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setTotalStorageGivenBytes(userData.storageLimit || (1 * 1024 * 1024)); // 1MB default
      } else {
        // Create a new document for the user with initial storage
        await setDoc(userDocRef, {
          email: authUser.email,
          storageLimit: 1 * 1024 * 1024 // 1MB in bytes
        });
        setTotalStorageGivenBytes(1 * 1024 * 1024);
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };
  

  useEffect(() => {
    fetchUserStorageData();
  }, []); 

  const purchaseAdditionalStorage = async (additionalBytes) => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const currentStorageLimit = docSnap.data().storageLimit || (1 * 1024 * 1024);
        const newTotalBytes = currentStorageLimit + additionalBytes;
  
        await updateDoc(userDocRef, {
          storageLimit: newTotalBytes
        });
  
        setTotalStorageGivenBytes(newTotalBytes);
      } else {
        console.error("No such user document!");
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };
  
  
  useEffect(() => {
    console.log(`New total storage: ${totalStorageGivenBytes} bytes`);
  }, [totalStorageGivenBytes]);
  

  // Calculate total used storage bytes
  const totalUsedStorageBytes = useMemo(() => {
    return [...documents, ...images, ...videos, ...music, ...others].reduce(
      (sum, file) => sum + file.size,
      0
    );
  }, [documents, images, videos, music, others]);

  // const handleUpgradeClick = () => {
  //   setPath('/plans'); // Set the path to simulate navigation
  //   window.history.pushState({}, '', '/plans'); // Update the URL without navigating
  // };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleClosePlans = () => {
    setShowStoragePlans(false); // Assuming you have a state `showStoragePlans` controlling the visibility
  };
  
  

  const storageLeftBytes = totalStorageGivenBytes - totalUsedStorageBytes;

  const totalUsedStorageFormatted = formatBytes(totalUsedStorageBytes);
  const totalStorageGivenFormatted = formatBytes(totalStorageGivenBytes);
  const storageLeftFormatted = formatBytes(storageLeftBytes);

  const usedStoragePercentage = (totalUsedStorageBytes / totalStorageGivenBytes) * 100;
  const unusedStoragePercentage = 100 - usedStoragePercentage;

  return (
    <div className="p-4 rounded-lg">
      <h1 className="text-lg mb-4 font-bold text-center">Storage</h1>
      <div className="relative w-full h-8 bg-gray-300 rounded-full dark:bg-gray-700">
        <div
          className="absolute left-0 w-1/2 bg-blue-600 h-full rounded-l-full"
          style={{ width: `${usedStoragePercentage}%` }}
        ></div>
        <div className="absolute right-0 w-1/2 h-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 w-auto text-xs font-medium text-white text-center p-0.5 leading-none rounded-full">
          {totalUsedStorageFormatted}
        </div>
      </div>
      <div className="mt-2 text-center">
        <p>Total space used: {totalUsedStorageFormatted}</p>
        <p>Total space given:{formatBytes(totalStorageGivenBytes)}</p>
        <p>Space left: {storageLeftFormatted}</p>
      </div>
      <div className="mt-4">
        {/* Documents */}
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Documents</p>
            <p className="text-sm text-gray-600">{documents.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(documents.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Images */}
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Photos</p>
            <p className="text-sm text-gray-600">{images.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(images.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Videos */}
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Videos</p>
            <p className="text-sm text-gray-600">{videos.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(videos.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Music */}
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Music</p>
            <p className="text-sm text-gray-600">{music.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(music.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Others */}
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Others</p>
            <p className="text-sm text-gray-600">{others.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(others.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Import Files
        </button>
      </div>
      {/* Upgrade to Pro button */}
      <div className="mt-4">
      <button
  onClick={() => setShowStoragePlans(true)}
  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
>
  Upgrade to Pro
</button>

      </div>

      {/* Conditionally render the StoragePlans component */}
      {showStoragePlans && (
  <StoragePlans
    onClose={handleClosePlans}
    onStorageUpdate={purchaseAdditionalStorage}
  />
)}
    </div>
  );
};

export default StorageView;