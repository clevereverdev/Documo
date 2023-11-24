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
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;
    
        // Reference to the original file document
        const fileRef = doc(db, "files", file.id.toString());
    
        // Reference to the 'deleted_files' collection
        const deletedFileRef = doc(collection(db, "deleted_files"));
    
        // Fetch the file name
        const fileSnapshot = await getDoc(fileRef);
        if (fileSnapshot.exists()) {
            const fileName = fileSnapshot.data().name;
    
            // First, set the file document in the 'deleted_files' collection
            await setDoc(deletedFileRef, {
                ...file,
                deletedAt: new Date(),
            });
    
            // Then delete the original file document
            await deleteDoc(fileRef).then(() => {
                setShowToastMsg('File Deleted!!!');
                setTimeout(() => {
                    window.location.reload(); // Consider removing this if you manage state updates properly
                }, 1500);
                
                // Add a new field 'name' to the notification data
                addNotification('image', {
                    src: displayImageSrc,
                    name: fileName, // Include the file name
                    message: `${fileName} was deleted.`,
                    isFile: true,
                    isDeleted: true
                });
            });
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
    const toggleStar = async (file, starred) => {
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const imageSrc = getFileImage(fileExtension);
        const displayImageSrc = ['pdf', 'zip'].includes(fileExtension) ? imageSrc : file.imageUrl;
        const newStarStatus = !starred;
    
        const fileRef = doc(db, "files", file.id.toString());
    
        await updateDoc(fileRef, {
            starred: newStarStatus,
        });
    
        // Fetch the file name
        const fileSnapshot = await getDoc(fileRef);
        if (fileSnapshot.exists()) {
            const fileName = fileSnapshot.data().name;
    
            // Notify the user about the change
            if (newStarStatus) {
                addNotification('image', {
                    src: displayImageSrc,
                    message: `You've starred the file: ${fileName}.`,
                    isFile: true,
                    isStarred: true,
                    name: fileName, // Include the file name
                });
            } else {
                addNotification('image', {
                    src: displayImageSrc,
                    message: `You've unstarred the file: ${fileName}.`,
                    isFile: true,
                    isUnstarred: true,
                    name: fileName, // Include the file name
                });
            }
        } else {
            console.error("Document does not exist!");
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
    await updateDoc(fileRef, { name: newName }).then(() => {
        setTimeout(() => {
            window.location.reload(); // Consider removing this if you manage state updates properly
        }, 500);
    });
    const fileName = newName
        setShowToastMsg('File renamed successfully!');

        // Add a notification for the renaming action
        addNotification('image', {
            src: displayImageSrc,
            message: `File renamed to: ${newName}.`,
            name: fileName,
            isFile: true,
            isRename: true
        }, file.id);
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
