import { useContext } from "react";
import { getFirestore, doc, updateDoc, deleteDoc, collection, setDoc, getDoc, query, where, getDocs } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNotifications } from '../../context/NotificationContext';


const db = getFirestore(app);

export const useFolderActions = () => {
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const { addNotification } = useNotifications();

    // DELETE FOLDER
    const deleteFolder = async (folder) => {
      if (!folder || !folder.id) {
          console.error("Invalid folder object passed to deleteFolder:", folder);
          return;
      }
  
      // References to the folder in both 'Folders' and 'shared_folders' collections
      const folderRefInFolders = doc(db, "Folders", folder.id.toString());
      const folderRefInSharedFolders = doc(db, "shared_folders", folder.id.toString());
  
      // Reference to the 'deleted_folders' collection
      const deletedFolderRef = doc(collection(db, "deleted_folders"));
  
      try {
          // Check in 'Folders' collection first
          let folderSnapshot = await getDoc(folderRefInFolders);
          let folderRef = folderRefInFolders;
  
          if (!folderSnapshot.exists()) {
              // If not found in 'Folders', check in 'shared_folders'
              folderSnapshot = await getDoc(folderRefInSharedFolders);
              folderRef = folderRefInSharedFolders;
          }
  
          if (folderSnapshot.exists()) {
              // First, set the folder document in the 'deleted_folders' collection
              await setDoc(deletedFolderRef, {
                  ...folderSnapshot.data(),
                  deletedAt: new Date(),
              });
  
              // Then delete the original folder document
              await deleteDoc(folderRef);
              setShowToastMsg(`Folder "${folderSnapshot.data().name}" deleted successfully!`);
  
              // Add a notification for the deletion action
              addNotification('folder', {
                  src: './folder.png',
                  message: `Folder "${folderSnapshot.data().name}" was deleted.`,
                  name: folderSnapshot.data().name,
                  isFolder: true,
                  isDeleted: true
              });
          } else {
              console.error("Folder does not exist in both 'Folders' and 'shared_folders' collections:", folder.id);
              setShowToastMsg("Folder not found for deletion.");
          }
      } catch (error) {
          console.error("Error deleting folder:", error);
          setShowToastMsg('Error deleting folder.');
      }
  };
  

    // TOGGLE STARRED STATUS OF FOLDER
const toggleStarred = async (folder) => {
  if (!folder) {
      console.error("Invalid folder object passed to toggleStarred:", folder);
      return;
  }

  const folderRef = doc(db, "Folders", folder.id.toString());
  const newStarredStatus = !folder.starred;

  try {
      await updateDoc(folderRef, {
          starred: newStarredStatus
      });
      addNotification('image', {
          src: './folder.png', // Assuming './folder.png' is a valid path to your folder icon
          message: `Folder "${folder.name}" ${newStarredStatus ? 'starred' : 'unstarred'} successfully`,
          name: folder.name,
          isFolder: true, // Assuming you want to differentiate between folder and file notifications
          isStarred: newStarredStatus, // This will be true if the folder has been starred, false if unstarred
          isUnstarred: !newStarredStatus
      });
      setShowToastMsg(`Folder "${folder.name}" ${newStarredStatus ? "starred" : "unstarred"} successfully!`);
  } catch (error) {
      console.error("Error updating folder star status:", error);
      setShowToastMsg('Error updating folder star status.');
  }
};


    // DOWNLOAD FOLDER AS ZIP
    const downloadFolderAsZip = async (folderId) => {
        // Assuming 'folderId' is the ID of the folder for which files are to be downloaded
        
        const folderRef = doc(db, "Folders", folderId);
        const folderDoc = await getDoc(folderRef);
        
        if (!folderDoc.exists()) { // Note the parentheses to call the method
          console.error("Folder not found!");
          return;
        }
        
        const folderData = folderDoc.data();
        const filesQuery = query(collection(db, "files"), where("parentFolderId", "==", folderId));
        const querySnapshot = await getDocs(filesQuery);
      
        const zip = new JSZip();
        const folderZip = zip.folder(folderData.name); // Create a subfolder in the zip with the folder's name
      
        for (const fileDoc of querySnapshot.docs) {
          const fileData = fileDoc.data();
          // Fetch the actual file using the URL
          // Here you would need to use Firebase Storage to get the download URL if it's not stored in the file data
          const fileResponse = await fetch(fileData.url);
          const fileBlob = await fileResponse.blob();
          // Add the file to the folder in the zip
          folderZip.file(fileData.name, fileBlob);
        }
      
        // Generate the ZIP file
        zip.generateAsync({ type: 'blob' }).then((content) => {
          // Use file-saver to save the file
          saveAs(content, `${folderData.name}.zip`);
          addNotification('image', { 
            src: './folder.png', 
            message: `Folder  downloaded as "${folderData.name}.zip" successfully`,
            name: folderData.name,
            isDownloaded: true
          });
        });
      };

       // RENAME FOLDER
       const renameFolder = async (folderId, newName) => {
        if (!folderId || !newName) {
            console.error("Invalid folderId or newName passed to renameFolder");
            return;
        }
    
        // References to the folder in both 'Folders' and 'shared_folders' collections
        const folderRefInFolders = doc(db, "Folders", folderId);
        const folderRefInSharedFolders = doc(db, "shared_folders", folderId);
    
        try {
            // Check in 'Folders' collection first
            let folderSnapshot = await getDoc(folderRefInFolders);
            let folderRef = folderRefInFolders;
    
            if (!folderSnapshot.exists()) {
                // If not found in 'Folders', check in 'shared_folders'
                folderSnapshot = await getDoc(folderRefInSharedFolders);
                folderRef = folderRefInSharedFolders;
            }
    
            if (folderSnapshot.exists()) {
                await updateDoc(folderRef, { name: newName });
                addNotification('image', { 
                  src: './folder.png', 
                  message: `Folder renamed to "${newName}" successfully`,
                  name: newName,
                  isRename: true
                });
                setShowToastMsg(`Folder renamed to ${newName} successfully!`);
            } else {
                console.error("Folder does not exist in both 'Folders' and 'shared_folders' collections:", folderId);
                setShowToastMsg("Folder not found for renaming.");
            }
        } catch (error) {
            console.error("Error renaming folder:", error);
            setShowToastMsg('Error renaming folder.');
        }
    };
    
      
// LOCK FOLDER
// const lockFolder = async (folder) => {
//     const folderRef = doc(db, "Folders", folder.id.toString());
//     await updateDoc(folderRef, {
//       locked: true,
//       password: password, // You should encrypt this password before saving
//     });
//     setShowToastMsg('Folder locked successfully!');
//   };

//   // UNLOCK FOLDER
//   const unlockFolder = async (folder) => {
//     // Here you should verify the password before unlocking
//     // This example assumes the password is correct
//     const folderRef = doc(db, "Folders", folder.id.toString());
//     await updateDoc(folderRef, {
//       locked: null,
//       // password: null,
//     });
//     setShowToastMsg('Folder unlocked successfully!');
//   };

const sendResetCode = async (folder) => {
  const resetCode = Math.random().toString(36).substring(2, 8); // Generate a random reset code
  // Send email with reset code using your preferred email service/API
  const emailSent = await sendEmailWithResetCode(folder.createdBy, resetCode);
  if (emailSent) {
    // Save the reset code in the database
    const folderRef = doc(db, "Folders", folder.id.toString());
    await updateDoc(folderRef, {
      resetCode: resetCode
    });
    setShowToastMsg('Reset code sent to your email.');
  } else {
    setShowToastMsg('Failed to send reset code.');
  }
};

// VALIDATE RESET CODE AND SET NEW PASSWORD
const validateResetCodeAndSetNewPassword = async (folder, enteredCode, newPassword) => {
  const folderRef = doc(db, "Folders", folder.id.toString());
  const folderDoc = await getDoc(folderRef);

  if (folderDoc.exists && folderDoc.data().resetCode === enteredCode) {
    // Reset code matches, update the password
    await updateDoc(folderRef, {
      password: newPassword,
      resetCode: null // Clear the reset code after successful reset
    });
    setShowToastMsg('Folder password has been reset.');
  } else {
    setShowToastMsg('Incorrect reset code.');
  }
};


// TOGGLE PINNED STATUS OF FOLDER
const togglePinned = async (folder) => {
  if (!folder) {
    console.error("Invalid folder object passed to togglePinned:", folder);
    return;
  }

  // Check the current number of pinned folders
  const pinnedFoldersQuery = query(collection(db, "Folders"), where("pinned", "==", true));
  const pinnedFoldersSnapshot = await getDocs(pinnedFoldersQuery);
  if (pinnedFoldersSnapshot.docs.length >= 5 && !folder.pinned) {
    showToastMsg("Maximum of 5 folders can be pinned.");
    return;
  }

  const folderRef = doc(db, "Folders", folder.id.toString());
  const newPinnedStatus = !folder.pinned;

  try {
    await updateDoc(folderRef, {
      pinned: newPinnedStatus
    });
    setShowToastMsg(`Folder "${folder.name}" ${newPinnedStatus ? "pinned" : "unpinned"} successfully!`);
  } catch (error) {
    console.error("Error updating folder pinned status:", error);
    setShowToastMsg('Error updating folder pinned status.');
  }
};
    
    return { deleteFolder, toggleStarred, downloadFolderAsZip, renameFolder, sendResetCode, validateResetCodeAndSetNewPassword, togglePinned    };
};
