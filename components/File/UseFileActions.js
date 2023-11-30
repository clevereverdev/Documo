import React, { useContext, useState, useEffect } from "react";
import { deleteDoc, doc, getFirestore, updateDoc, collection, query, where, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import { useNotifications } from '../../context/NotificationContext';
import defaultFileImage from '../../public/zip.png';




const db = getFirestore(app);

const getFileImage = (extension) => {
    switch (extension.toLowerCase()) {
        case 'pdf':
            return '/pdf.png';
        case 'zip':
            return '/zip.png';
        default:
            return defaultFileImage;
    }
};

export const useFileActions = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
    const { addNotification } = useNotifications();

    // DELETE FILE
    const deleteFile = async (file) => {
        const fileRefInFiles = doc(db, "files", file.id.toString());
        const fileRefInSharedFiles = doc(db, "shared_files", file.id.toString());
        const deletedFileRef = doc(collection(db, "deleted_files"));
    
        console.log(`Attempting to delete file with ID: ${file.id}`);
    
        // Check in 'files' collection first
        let fileSnapshot = await getDoc(fileRefInFiles);
        let fileRef = fileRefInFiles;
    
        if (!fileSnapshot.exists()) {
            // If not found in 'files', check in 'shared_files'
            fileSnapshot = await getDoc(fileRefInSharedFiles);
            fileRef = fileRefInSharedFiles;
        }
    
        if (fileSnapshot.exists()) {
            try {
                const fileName = fileSnapshot.data().name;
                console.log(`File found: ${fileName}. Proceeding with deletion.`);
    
                // Move the file document to the 'deleted_files' collection
                await setDoc(deletedFileRef, {
                    ...fileSnapshot.data(),
                    deletedAt: new Date(),
                });
    
                // Then delete the original file document
                await deleteDoc(fileRef);
                setShowToastMsg(`${fileName} was deleted.`);
    
                // Add a notification for the deletion
                addNotification('image', {
                    src: file.imageUrl,
                    name: fileName,
                    message: `${fileName} was deleted.`,
                    isFile: true,
                    isDeleted: true
                });
    
                // If you have a state management logic to update the UI, trigger it here
            } catch (error) {
                console.error("Error deleting file:", error);
                setShowToastMsg("An error occurred while deleting the file.");
            }
        } else {
            console.error("Document does not exist in both 'files' and 'shared_files' collections:", file.id);
            setShowToastMsg("Document does not exist.");
        }
    };
    
    
    
    


    useEffect(() => {
        // Query to exclude deleted files
        const q = query(collection(db, "files"), where("deleted", "!=", true));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const files = querySnapshot.docs
                .map((doc) => ({ ...doc.data(), id: doc.id }))
                .filter(file => !file.deleted); // Ensure filtering out any files marked as deleted

            //setFiles(files); // This should be the state that holds the files for display
        });

        return () => unsubscribe();
    }, [db]);

    // STARRED/UNSTARRED FILE
    const toggleStar = async (file) => {
        const collectionName = file.sharedBy ? "shared_files" : "files";
        const fileRef = doc(db, collectionName, file.id.toString());
        try {
            const updatedStarred = !file.starred;
            await updateDoc(fileRef, {
                starred: updatedStarred,
            });

            // Check if the document was successfully updated
            const fileSnapshot = await getDoc(fileRef);
            if (fileSnapshot.exists()) {
                const fileName = fileSnapshot.data().name;
                const fileExtension = fileName.toLowerCase().split('.').pop();
                const imageSrc = getFileImage(fileExtension);
                const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : fileSnapshot.data().imageUrl;
    
                // Notify the user about the change
                addNotification('image', {
                    src: displayImageSrc,
                    message: `You've ${newStarStatus ? 'starred' : 'unstarred'} the file: ${fileName}.`,
                    isFile: true,
                    isStarred: newStarStatus,
                    name: fileName, // Include the file name
                });
            } else {
                console.error("Document does not exist!");
            }
        } catch (error) {
            console.error("Error toggling star:", error);
        }
    };
    

    //DOWNLOAD FILE
    const downloadFile = (file) => {
        if (!file || !file.name) {
            console.error('Invalid file object passed to downloadFile:', file);
            return;
        }

        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;

        // Create a temporary virtual link
        const link = document.createElement("a");
        link.href = file.imageUrl;  // Set the download URL

        // Set the file name. You might want to retrieve this from your file object
        link.download = file.name || "download";

        // Simulate clicking the link. This will initiate the download
        document.body.appendChild(link);
        link.click();

        // Clean up after the download
        document.body.removeChild(link);
        const fileName = file.name;

        // Add a notification for the download action
        addNotification('image', {
            src: displayImageSrc,
            message: `You've downloaded the file: ${file.name}.`,
            name: fileName,
            isFile: true,
            isDownloaded: true
        }, file.id);
    };

    // RENAME FILE
    const renameFile = async (file, newName, onRenameSuccess) => {
        if (!file || !file.id || !file.name) {
            console.error("Invalid file data");
            return;
        }
    
        if (newName.trim() === '') {
            showToastMsg('Name cannot be blank!');
            return;
        }
    
        // First, check in 'files' collection
        let fileRef = doc(db, "files", file.id.toString());
        let docSnapshot = await getDoc(fileRef);
    
        if (!docSnapshot.exists()) {
            // If not found in 'files', check in 'shared_files'
            fileRef = doc(db, "shared_files", file.id.toString());
            docSnapshot = await getDoc(fileRef);
        }
    
        if (docSnapshot.exists()) {
            try {
                await updateDoc(fileRef, { name: newName });
                console.log("File renamed successfully!");
                setShowToastMsg('File renamed successfully!');
                onRenameSuccess && onRenameSuccess(file.id, newName);
            } catch (error) {
                console.error("Error renaming file:", error);
                setShowToastMsg("Failed to rename file.");
            }
        } else {
            console.error("Document does not exist in both 'files' and 'shared_files' collections:", file.id);
            setShowToastMsg("File not found for renaming.");
        }
    };
    
      
    
      
      
    
    
    
      const lockFile = async (file) => {
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
            sensitive: true,
        });
        setShowToastMsg('File locked successfully!');
        // Add a notification for the renaming action
        addNotification('image', {
            src: displayImageSrc,
            message: `File ${file.name} is locked now.`,
            name: file.name,
            isFile: true,
            isLocked: true
        }, file.id);
    };
    

    // UNLOCK FILE
    const unlockFile = async (file) => {
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
            sensitive: false,
        });
        setShowToastMsg('File unlocked successfully!');
        addNotification('image', {
            src: displayImageSrc,
            message: `File ${file.name} is unlocked now.`,
            name: file.name,
            isFile: true,
            isUnlocked: true
        }, file.id);
    };

    return { deleteFile, toggleStar, downloadFile, renameFile, lockFile, unlockFile };
};

export const useFileRename = (file, renameFileCallback) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        if (file && file.name) {
            setNewName(file.name);
        }
    }, [file]);



    const handleRenameClick = async() => {
        setIsRenaming(true); // Show the input field for renaming
    };

    const handleNameChange = (event) => {
        setNewName(event.target.value);
    };

    const handleKeyDown = async (event) => {
        console.log(event.key);  // This will log the key that was pressed
        if (event.key === 'Enter') {
            console.log("Enter key pressed");  // This will confirm if the Enter key was captured
            await handleRenameSubmit();
        }
    };

    const handleRenameSubmit = async () => {
        if (!file || !file.name) {
            console.error("File is not set!");
            return;
        }
    
        if (typeof renameFileCallback !== "function") {
            console.error("renameFileCallback is not a function");
            return;
        }
    
        await renameFileCallback(file, newName, (fileId, updatedName) => {
            // Here, you can add any additional logic you might need after the file is renamed
        });
        setIsRenaming(false);
    };

    return {
        isRenaming,
        newName,
        handleRenameClick,
        handleNameChange,
        handleKeyDown,
        handleRenameSubmit,
    };
}
