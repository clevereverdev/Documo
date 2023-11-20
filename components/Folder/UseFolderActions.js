import { useContext } from "react";
import { getFirestore, doc, updateDoc, deleteDoc, collection, setDoc, getDoc, query, where, getDocs } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const db = getFirestore(app);

export const useFolderActions = () => {
    const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

    // DELETE FOLDER
    const deleteFolder = async (folder, onDeleteSuccess) => {
        if (!folder) {
            console.error("Invalid folder object passed to deleteFolder:", folder);
            return;
        }
        // Reference to the original folder document
        const folderRef = doc(db, "Folders", folder.id.toString());
        // Reference to the 'deleted_folders' collection
        const deletedFolderRef = doc(collection(db, "deleted_folders"));
        // First, set the folder document in the 'deleted_folders' collection
        await setDoc(deletedFolderRef, {
            ...folder,
            deletedAt: new Date(),
        });
        // Then delete the original folder document
        await deleteDoc(folderRef).then(() => {
            setShowToastMsg('Folder Deleted!!!');
            if (onDeleteSuccess) {
              onDeleteSuccess(folder.id);
          }
            // Add additional notification logic if needed
        });
    };

    // TOGGLE STARRED STATUS OF FOLDER
    const toggleStarred = async (folder) => {
        if (!folder) {
            console.error("Invalid folder object passed to toggleStarred:", folder);
            return;
        }
        const folderRef = doc(db, "Folders", folder.id.toString());
        await updateDoc(folderRef, {
            starred: !folder.starred
        }).then(() => {
            setShowToastMsg(`Folder ${folder.starred ? "unstarred" : "starred"} successfully!`);
        });
    };


    // DOWNLOAD FOLDER AS ZIP
    const downloadFolderAsZip = async (folderId) => {
        // Assuming 'folderId' is the ID of the folder for which files are to be downloaded
        const folderRef = doc(db, "Folders", folderId);
        const folderDoc = await getDoc(folderRef);
      
        if (!folderDoc.exists) {
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
        });
      };

       // RENAME FOLDER
       const renameFolder = async (folderId, newName) => {
        const folderRef = doc(db, "Folders", folderId);
        try {
          await updateDoc(folderRef, { name: newName });
          setShowToastMsg(`Folder renamed to ${newName} successfully!`);
        } catch (error) {
          console.error("Error renaming folder:", error);
          setShowToastMsg('Error renaming folder.');
        }
      };
      
// LOCK FOLDER
const lockFolder = async (folder, password) => {
    const folderRef = doc(db, "Folders", folder.id.toString());
    await updateDoc(folderRef, {
      locked: true,
      password: password, // You should encrypt this password before saving
    });
    setShowToastMsg('Folder locked successfully!');
  };

  // UNLOCK FOLDER
  const unlockFolder = async (folder, password) => {
    // Here you should verify the password before unlocking
    // This example assumes the password is correct
    const folderRef = doc(db, "Folders", folder.id.toString());
    await updateDoc(folderRef, {
      locked: false,
      password: null,
    });
    setShowToastMsg('Folder unlocked successfully!');
  };

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
  
    
    return { deleteFolder, toggleStarred, downloadFolderAsZip, renameFolder, lockFolder, unlockFolder, sendResetCode, validateResetCodeAndSetNewPassword    };
};
