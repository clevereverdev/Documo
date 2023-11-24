import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { app } from "../../firebase/firebase";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useAuth } from "../../firebase/auth";
import { ShowToastContext } from "../../context/ShowToastContext";
import { ParentFolderIdContext } from "../../context/ParentFolderIdContext";
import { useNotifications } from '../../context/NotificationContext';


function CreateFolderModal({ isOpen, onClose, onFolderCreated }) {
  const docId = Date.now().toString();
  const [folderName, setFolderName] = useState();
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext)
  const { authUser } = useAuth();
  const { parentFolderId, setParentFolderId } = useContext(ParentFolderIdContext)
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { addNotification } = useNotifications();

  const db = getFirestore(app)
  useEffect(() => {

  }, [])
  const onCreate = async () => {
    console.log(folderName);
    try {
      
      // Create a new folder object
      const newFolder = {
        name: folderName,
        id: docId,
        createBy: authUser.email,
        parentFolderId: parentFolderId
      };
  
      // Save the new folder to Firestore
      await setDoc(doc(db, "Folders", docId), newFolder);
  
      // Check if the onFolderCreated callback is provided
      if (onFolderCreated) {
          onFolderCreated(newFolder);
          onClose(); // This should close the modal

      }

      // Add a notification once the folder is successfully created
      addNotification('image', { 
        src: './folder.png', 
        message: `Folder "${folderName}" created successfully`,
        name: folderName,
        isCreated: true
      })
      setShowToastMsg('Folder Created!');
      onClose(); // Close the modal using the provided onClose function
      setFolderName(''); // Clear the input
    } catch (error) {
      console.error("Error creating folder:", error);
      // Add an error notification here if something goes wrong
      addNotification('error', { message: `Error creating folder "${folderName}"` });
    }
};
return (
  <>
    {isOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-90 backdrop-blur-lg">
        <div className="bg-[#171717] rounded-xl p-6 w-96">
          <div className="flex justify-end">
            <button
              className="p-1 hover:bg-gray-700 rounded-full focus:outline-none h-10 w-10"
              onClick={onClose}  // Use the onClose prop directly
            >
              ✕
            </button>
          </div>

          <div className="flex items-center mb-7">
            <img src="/folder.png" alt="folder" width={40} height={40} className="mr-4" />
            <h1 className="text-white text-lg font-bold">Create Folder</h1>
          </div>

          <input
            type="text"
            placeholder="Enter folder name"
            className="w-full p-3 bg-transparent text-white border border-gray-700 rounded-md mb-10 focus:outline-none focus:border-gray-600"
            onChange={(e) => setFolderName(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button
              className="bg-gray-700 text-white rounded-md p-3 w-1/2 mr-2 focus:outline-none hover:bg-gray-600" onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="w-1/2 bg-blue-500 text-white rounded-md p-3 focus:outline-none hover:bg-blue-600"
              onClick={() => onCreate()}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )}
  </>

);
}

export default CreateFolderModal;
