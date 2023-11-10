import React, { useContext, useState, useEffect } from "react";
import { deleteDoc, doc, getFirestore, updateDoc, collection, query, where, onSnapshot, setDoc, getDoc} from "firebase/firestore";
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
    const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
    const { addNotification } = useNotifications();

    // DELETE FILE
    const deleteFile = async (file) => {
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;

        // Reference to the original file document
    const fileRef = doc(db, "files", file.id.toString());

    // Reference to the 'deleted_files' collection
    const deletedFileRef = doc(collection(db, "deleted_files"));

    // First, set the file document in the 'deleted_files' collection
    await setDoc(deletedFileRef, {
        ...file,
        deletedAt: new Date(),
    });

    // Then delete the original file document
    await deleteDoc(fileRef).then(() => {
        setShowToastMsg('File Deleted!!!');
        addNotification('image', { src: displayImageSrc, message: `${file.name} was deleted.` });
    });
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
    const toggleStar = async (file, starred) => {
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;
        const newStarStatus = !starred;
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
            starred: newStarStatus,
        });

        // Notify the user about the change
        if (newStarStatus) {
            addNotification('image', {
                src: displayImageSrc,
                message: `You've starred the file: ${file.name}.`
            }, file.id);
        } else {
            addNotification('image', {
                src: displayImageSrc,
                message: `You've unstarred the file: ${file.name}.`
            }, file.id);
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

        // Add a notification for the download action
        addNotification('image', {
            src: displayImageSrc,
            message: `You've downloaded the file: ${file.name}.`
        }, file.id);
    };

    // RENAME FILE
    const renameFile = async (file, newName) => {
        if (!file || !file.name) {
            console.error("File is not provided or doesn't have a name");
            return;
          }
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;
        if (newName.trim() === '') {
            setShowToastMsg('Name cannot be blank!');
            return;
        }
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, { name: newName });
        setShowToastMsg('File renamed successfully!');

        // Add a notification for the renaming action
        addNotification('image', {
            src: displayImageSrc,
            message: `File renamed to: ${newName}.`
        }, file.id);
    };

    const lockFile = async (file) => {
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
        sensitive: true,
        });
        setShowToastMsg('File locked successfully!');
    };
    
    // UNLOCK FILE
    const unlockFile = async (file) => {
        const fileRef = doc(db, "files", file.id.toString());
        await updateDoc(fileRef, {
        sensitive: false,
        });
        setShowToastMsg('File unlocked successfully!');
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
    


    const handleRenameClick = () => {
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
        if (!file) {
            console.error("File is not set!");
            return;
        }
    
        if (typeof renameFileCallback !== "function") {
            console.error("renameFileCallback is not a function");
            return;
        }
    
        await renameFileCallback(file, newName);
        setIsRenaming(false);
    };
    
    return {
        isRenaming,
        newName,
        handleRenameClick,
        handleNameChange,
        handleKeyDown,
        handleRenameSubmit
    };
}
