import { doc, getFirestore, setDoc, query, collection, where, getDocs, getDoc } from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";
import { app } from "../../firebase/firebase";
import { useAuth } from "../../firebase/auth";
import { ParentFolderIdContext } from "../../context/ParentFolderIdContext";
import { ShowToastContext } from "../../context/ShowToastContext";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Tesseract from 'tesseract.js';
import { Button } from "@nextui-org/react";
import { Document, Page } from 'react-pdf';
import { useNotifications } from '../../context/NotificationContext'; // make sure to import the hook at the top of your component file
import { pdfjs } from 'react-pdf';
import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import useStorageData from '../Storage/StorageData'; // Adjust the path as needed
import { FaLock } from "react-icons/fa";


function UploadFileModal({ closeModal, onFileCreated }) {
  const { documents, images, archives, music, others } = useStorageData();
  const { authUser } = useAuth();
  const { parentFolderId, setParentFolderId } = useContext(
    ParentFolderIdContext
  );
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const { addNotification } = useNotifications();


  const docId = Date.now();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [sensitiveFound, setSensitiveFound] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [downloadURL, setDownloadURL] = useState(null);

  const [userSetPassword, setUserSetPassword] = useState(''); // This is where the user sets the password initially.
  const [userPasswordSet, setUserPasswordSet] = useState(false);
  const [password, setPassword] = useState(''); // This is where the user enters the password for verification.
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false); // New state to track if the password has been set

  const [totalStorageUsed, setTotalStorageUsed] = useState(0);


  const sensitiveKeywords = ["Driver License", "Green Card", "Passport", "Birth Certificate"];
  const dobPattern = /\d{2}\/\d{2}\/\d{4}/;
  const phonePattern = /\d{10}/;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      checkImage(file);
    }
  };

  const handleCancelClick = () => {
    closeModal(false);
  };

  // This effect fetches the total storage used whenever the modal is opened.
useEffect(() => {
  const fetchTotalStorageUsed = async () => {
    // Fetch files metadata from Firestore and calculate the sum of file sizes.
    const filesQuery = query(collection(db, "files"), where("createdBy", "==", authUser.email));
    const querySnapshot = await getDocs(filesQuery);
    const total = querySnapshot.docs.reduce((sum, doc) => sum + doc.data().size, 0);
    setTotalStorageUsed(total);
  };

  fetchTotalStorageUsed();
}, []);


  const onFileUpload = async (file) => {
    if (file) {
      if (file.size > 10000000) { // Removed the optional chaining since 'file' is already checked for existence.
        setShowToastMsg("File is too large");
        return;
      }
      const fileRef = ref(storage, "file/" + file.name);

      try {
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        setDownloadURL(downloadURL);  // Set the state with the download URL

        // Log to see the value at the time of upload
        console.log("sensitiveFound at upload time: ", sensitiveFound);

        // Here we ensure that sensitiveFound is used in its current state
          await setDoc(doc(db, "files", docId.toString()), {
            name: file.name,
            type: file.name.split(".")[1],
            size: file.size,
            modifiedAt: file.lastModified,
            createdBy: authUser.email,
            parentFolderId: parentFolderId,
            imageUrl: downloadURL,
            id: docId,
            sensitive: sensitiveFound, // Use the sensitiveFound directly
            password: userSetPassword, // Save the password set by the user

          });

          setShowToastMsg("File Uploaded Successfully!");
          // Add a notification for the successful upload
      addNotification('image', {
        src: downloadURL,
        message: `File ${file.name} uploaded successfully`,
        name: file.name,
        isFile: true,
        isCreated: true
      });
        closeModal(true);
        
        onFileCreated(newFileData); // Directly using the destructured prop
  
      } catch (error) {
        console.error("Error uploading file: ", error);
        setResultMsg("Failed to upload file. Please try again.");
      } finally {
        // Only reset the state after the upload process is completed, either successfully or with an error.
        resetState();
      }
    }
  };

  const sendEmailNotification = async (emailDetails) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailDetails),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const isImageType = (file) => {
    const supportedFormats = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/heic", "image/webp"];
    return supportedFormats.includes(file.type);
  };

  const handleFileUpload = (uploadedFile) => {
    if (uploadedFile) {
      setFileToUpload(uploadedFile);
      checkImage(uploadedFile);
    }
  };

  const expiryDatePattern = /(Card Expires|[eE][xX][pP]|[eE][xX][eE]|[eE][xX]|[eE][xX][pP][iI][rR][eE][sS]|valid\s*[tT][iI][lL][lL])\s*[:\-]?\s*(\d{2}[-\/]\d{2}[-\/]\d{2,4})/;

  const checkImage = async (file) => {
    const fileRef = ref(storage, "file/" + file.name); // Define fileRef again if it's needed here


    if (isImageType(file)) {
      Tesseract.recognize(file, 'eng', { logger: m => console.log(m) })
        .then(async ({ data: { text } }) => {
          console.log("OCR Output:", text); // Log the full OCR text output

          let foundSensitive = false;
          let expiryDate;

          // Check for sensitive keywords
          for (const keyword of sensitiveKeywords) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
              foundSensitive = true;
              setResultMsg("Sensitive information found. Please enter the password to proceed.");
              break;
            }
          }

          // Check for an expiry date regardless of sensitive keywords
          const expDateMatch = text.match(expiryDatePattern);
          if (expDateMatch && expDateMatch[2]) {
            // Parse the date here according to your date format
            const dateParts = expDateMatch[2].split(/[-\/]/);
            let year = parseInt(dateParts[2], 10);

            // Adjust for two-digit years; assuming the year is in the 2000s
            year = (year < 100) ? year + 2000 : year;

            // Assuming the date format detected by OCR is DD-MM-YYYY
            let day, month;
            if (parseInt(dateParts[0], 10) <= 12) {
              day = parseInt(dateParts[1], 10);
              month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-indexed
            } else {
              day = parseInt(dateParts[0], 10);
              month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
            }

            expiryDate = new Date(year, month, day);
            console.log(`Expiry Date Found: ${expiryDate.toDateString()}`);

            // Determine if the expiry date is within 30 days
            const today = new Date();
            const timeDiff = expiryDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            console.log('Days Diff: ', daysDiff);
            // Add this function inside your UploadFileModal component

            if (daysDiff > 0 && daysDiff <= 171) {
              // Set the download URL first before calling addNotification
              const downloadURL = await getDownloadURL(fileRef);
              setDownloadURL(downloadURL); 
              console.log("Download URL: " + downloadURL);
              addNotification('Expiry', {
                src: downloadURL,  // Use the download URL as the image source
                name: file.name,
                message: `Your document is expiring soon on ${expiryDate.toDateString()}.`,
                isLocked: true,
                isExpiringSoon: true,
                date: expiryDate.toDateString(),
              });

              // Email details object
              const emailDetails = {
                to: authUser.email,
                subject: 'Sensitive Document Expiry Alert',
                text: `Your sensitive document "${file.name}" is expiring on ${expiryDate.toDateString()}. Please take the necessary action. "${downloadURL}"`

              };

              // Send an email notification
              await sendEmailNotification(emailDetails);
            }
          }

          if (!foundSensitive && (dobPattern.test(text) || phonePattern.test(text))) {
            foundSensitive = true;
            setResultMsg("Sensitive data detected. Please enter the password to proceed.");
          }

          setSensitiveFound(foundSensitive);
          setFile(file);

          // If an expiry date was found and recognized, and the notification logic has been triggered
          if (expiryDate) {
            console.log(`Expiry Date: ${expiryDate.toDateString()}`);
          }
        })
        .catch(error => {
          console.error("An error occurred with Tesseract.js: ", error);
        });
    } else {
      setFile(file);
    }
  };







  const resetState = () => {
    // Reset all states to their initial values.
    setSensitiveFound(false);
    setPasswordVerified(false); // Also reset the password verified flag
    setPassword('');
    setResultMsg('');
    setFileToUpload(null);
    setFile(null);
    setIsDragging(false);
    setNumPages(null);
    setPageNumber(1);
  };


  const handleSetPassword = () => {
    // Logic to securely save the userSetPassword to your database or authentication system.
    if (!userSetPassword) {
      setResultMsg("Please enter a password.");
      return;
    }
    // Save the password here (omitted for brevity)
    console.log(`Password set to: ${userSetPassword}`);
    setPasswordSet(true); // Indicate that a password has been set
    setShowToastMsg("Password has been set successfully!");
  };

  const verifyPassword = () => {
    if (password === userSetPassword) {
      setResultMsg("Password verified. You can now upload the file.");
      setPasswordVerified(true);
    } else {
      setResultMsg("Incorrect password. Please try again.");
      setPasswordVerified(false);
    }
    setPassword(''); // Clear the password input
  };

  const calculateTotalUsedStorage = () => {
    const files = [...documents, ...images, ...archives, ...music, ...others];
    return files.reduce((totalSize, file) => totalSize + file.size, 0);
  };
  
  

  const fetchUserStorageData = async (username) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', username);
    const docSnap = await getDoc(userDocRef);
  
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData.storageLimit || (1 * 1024 * 1024); // Default to 1MB if not specified
    } else {
      throw new Error('User document does not exist');
    }
  };

    const handleNextClick = async () => {
      try {
        const storageLimit = await fetchUserStorageData(authUser.username);
        const totalUsedStorageBytes = calculateTotalUsedStorage();

        console.log(`Storage Limit: ${storageLimit} bytes`);
        console.log(`Total Used Storage: ${totalUsedStorageBytes} bytes`);
        console.log(`File Size: ${fileToUpload.size} bytes`);
    
        if (fileToUpload && totalUsedStorageBytes + fileToUpload.size > storageLimit) {
          console.log("Storage limit exceeded, file upload prevented.");
          closeModal(false);
          setTimeout(() => setShowToastMsg(`Storage limit exceeded. Cannot upload more files. Your limit is ${storageLimit / (1024 * 1024)} MB.`), 500);
          return;
        }
    
        console.log("Proceeding with file upload.");
        // Your file upload logic here
    
      } catch (error) {
        console.error('Error fetching storage data:', error);
        // Handle the error appropriately
      }
  
    if (!sensitiveFound) {
      onFileUpload(fileToUpload);
    } else if (!passwordSet) {
      handleSetPassword(); // Try to set the password
    } else if (!passwordVerified) {
      verifyPassword(); // Try to verify the password
    } else {
      onFileUpload(fileToUpload); // All checks passed, upload the file
    }
  };



  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };


  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#171717] bg-opacity-90 backdrop-blur-lg">
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl max-w-full w-auto md:w-[560px] flex flex-col">
        <button
          className="p-1 hover:bg-gray-700 rounded-full focus:outline-none h-10 w-10 self-end m-2"
          onClick={handleCancelClick}
        >
          ✕
        </button>
        <div className="p-9 flex-grow">
          <h3 className="text-xl font-semibold mb-5">Upload file</h3>
          {!file ? (
            <label
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                const files = e.dataTransfer.files;
                handleFileUpload(files[0]);
              }}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Drag and Drop file here or <span className="text-blue-500 underline cursor-pointer">Choose file</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
                  Supported formats: All major formats
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Maximum size: 10 MB
                </p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative mt-4">
              {isImageType(file) ? (
                <img src={URL.createObjectURL(file)} alt="Uploaded preview" className="w-full h-auto max-h-[500px] object-cover rounded-xl" />
              ) : (
                <div className="max-h-[500px] max-w-auto overflow-y-hidden">
                  <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="flex justify-center items-center">
                    <Page pageNumber={pageNumber} width={420} />
                  </Document>

                  {numPages > 1 && (
                    <div className="absolute bottom-10 flex justify-center w-full space-x-2">
                      <button
                        className={`p-2 rounded-full focus:outline-none ${pageNumber === 1
                          ? "bg-gray-400 text-gray-500 cursor-not-allowed" // styles for disabled state
                          : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500" // styles for normal state
                          }`}
                        onClick={handlePreviousPage}
                        disabled={pageNumber === 1}
                      >
                        <BiLeftArrowCircle className="text-white font-bold text-xl" />
                      </button>
                      <button
                        className={`p-2 rounded-full focus:outline-none ${pageNumber === numPages
                          ? "bg-gray-400 text-gray-500 cursor-not-allowed" // styles for disabled state
                          : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500" // styles for normal state
                          }`}
                        onClick={handleNextPage}
                        disabled={pageNumber === numPages}
                      >
                        <BiRightArrowCircle className="text-white font-bold text-xl" />
                      </button>


                    </div>

                  )}
                </div>
              )}
            </div>
          )}
          {sensitiveFound && !passwordVerified && (
            <div className="absolute flex justify-center items-center mt-4">
              <div className="p-4 rounded-2xl text-center m-5">
                {/* <p className="text-red-500 font-bold text-md">Sensitive content detected.</p> */}
                {!passwordSet && (
                  <>
                  <span className="absolute top-[63px] left-[50px]">
              <FaLock className="text-gray-400" />
            </span>
                    <input
                      type="password"
                      value={userSetPassword}
                      onChange={(e) => setUserSetPassword(e.target.value)}
                      placeholder="Set a password"
                      className="w-50 font-medium border bg-transparent border-white hover:border-gray-400 p-4 pl-10 rounded-2xl outline-none focus:border-white pr-10"
                    />
                    <button className="px-[50px] mb-5 bg-[#3EA88B] text-white p-4 rounded-2xl m-2 hover:bg-[#53B499]" onClick={handleSetPassword}>Confirm</button>
                  </>
                )}
                {passwordSet && (
                  <>
                    {/* <p>Please enter the password to proceed.</p> */}
                    <span className="absolute top-[63px] left-[50px]">
              <FaLock className="text-gray-400" />
            </span>
                    <input
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Verify password"
                      className="w-60 font-medium border bg-transparent border-white hover:border-gray-400 p-4 pl-10 rounded-2xl outline-none focus:border-white pr-10"

                    />
                    <button onClick={verifyPassword} className="px-[50px] mb-5 bg-[#3EA88B] text-white p-4 rounded-2xl m-2 hover:bg-[#53B499]">Verify</button>
                  </>
                )}
              </div>
            </div>
          )}
          <div id="result" className="mt-5">{resultMsg}</div>

          <div className="flex justify-between mt-[100px]">
            <button
              className="w-1/2 bg-[#3EA88B] text-white rounded-md mx-2 p-3 focus:outline-none hover:bg-[#53B499]"
              onClick={handleNextClick}
            >
              Next
            </button>
            <button
              className="bg-gray-700 text-white rounded-md p-3 w-1/2 mr-2 focus:outline-none hover:bg-gray-600" onClick={handleCancelClick}
            >
              Cancel
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadFileModal;

/* <span className="absolute top-4 left-4 text-blue-700 z-10">{file.name} ({Math.round(file.size / 1024)} KB)</span>
      <button
        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full focus:outline-none h-10 w-10 z-10"
        onClick={() => setFile(null)}
      >
        ✕
      </button> */



//       import { doc, getFirestore, setDoc } from "firebase/firestore";
// import React, { useContext, useState } from "react";
// import { app } from "../../firebase/firebase";
// import { useAuth } from "../../firebase/auth";
// import { ParentFolderIdContext } from "../../context/ParentFolderIdContext";
// import { ShowToastContext } from "../../context/ShowToastContext";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// import Tesseract from 'tesseract.js';
// import { Button } from "@nextui-org/react";
// import { Document, Page } from 'react-pdf';
// import { useNotifications } from '../../context/NotificationContext'; // make sure to import the hook at the top of your component file
// import { pdfjs } from 'react-pdf';
// import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


// function UploadFileModal({ closeModal }) {
//   const { authUser } = useAuth();
//   const { parentFolderId, setParentFolderId } = useContext(
//     ParentFolderIdContext
//   );
//   const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
//   const { addNotification } = useNotifications();


//   const docId = Date.now();
//   const db = getFirestore(app);
//   const storage = getStorage(app);
//   const [sensitiveFound, setSensitiveFound] = useState(false);
//   const [resultMsg, setResultMsg] = useState('');
//   const [fileToUpload, setFileToUpload] = useState(null);
//   const [file, setFile] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [downloadURL, setDownloadURL] = useState(null);

//   const [userSetPassword, setUserSetPassword] = useState(''); // This is where the user sets the password initially.
//   const [userPasswordSet, setUserPasswordSet] = useState(false);
//   const [password, setPassword] = useState(''); // This is where the user enters the password for verification.
//   const [passwordVerified, setPasswordVerified] = useState(false);
//   const [passwordSet, setPasswordSet] = useState(false); // New state to track if the password has been set


//   const sensitiveKeywords = ["Driver License", "Green Card", "Passport", "Birth Certificate"];
//   const dobPattern = /\d{2}\/\d{2}\/\d{4}/;
//   const phonePattern = /\d{10}/;

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFileToUpload(file);
//       checkImage(file);
//     }
//   };

//   const handleCancelClick = () => {
//     closeModal(false);
//   };


//   const onFileUpload = async (file) => {
//     if (file) {
//       if (file.size > 10000000) { // Removed the optional chaining since 'file' is already checked for existence.
//         setShowToastMsg("File is too large");
//         return;
//       }
//       const fileRef = ref(storage, "file/" + file.name);

//       try {
//         await uploadBytes(fileRef, file);
//         const downloadURL = await getDownloadURL(fileRef);
//         setDownloadURL(downloadURL);  // Set the state with the download URL

//         // Log to see the value at the time of upload
//         console.log("sensitiveFound at upload time: ", sensitiveFound);

//         // Here we ensure that sensitiveFound is used in its current state
//         await setDoc(doc(db, "files", docId.toString()), {
//           name: file.name,
//           type: file.name.split(".")[1],
//           size: file.size,
//           modifiedAt: file.lastModified,
//           createdBy: authUser.email,
//           parentFolderId: parentFolderId,
//           imageUrl: downloadURL,
//           id: docId,
//           sensitive: sensitiveFound // Use the sensitiveFound directly
//         });

//         setShowToastMsg("File Uploaded Successfully!");
//         closeModal(true);
//       } catch (error) {
//         console.error("Error uploading file: ", error);
//         setResultMsg("Failed to upload file. Please try again.");
//       } finally {
//         // Only reset the state after the upload process is completed, either successfully or with an error.
//         resetState();
//       }
//     }
//   };

//   const sendEmailNotification = async (emailDetails) => {
//     try {
//       const response = await fetch('/api/send-email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(emailDetails),
//       });
//       const data = await response.json();
//       console.log(data.message);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };


//   const isImageType = (file) => {
//     const supportedFormats = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/heic", "image/webp"];
//     return supportedFormats.includes(file.type);
//   };

//   const handleFileUpload = (uploadedFile) => {
//     if (uploadedFile) {
//       setFileToUpload(uploadedFile);
//       checkImage(uploadedFile);
//     }
//   };

//   const expiryDatePattern = /(Card Expires|[eE][xX][pP]|[eE][xX][eE]|[eE][xX]|[eE][xX][pP][iI][rR][eE][sS]|valid\s*[tT][iI][lL][lL])\s*[:\-]?\s*(\d{2}[-\/]\d{2}[-\/]\d{2,4})/;

//   const checkImage = async (file) => {

//     if (isImageType(file)) {
//       Tesseract.recognize(file, 'eng', { logger: m => console.log(m) })
//         .then(async ({ data: { text } }) => {
//           console.log("OCR Output:", text); // Log the full OCR text output

//           let foundSensitive = false;
//           let expiryDate;

//           // Check for sensitive keywords
//           for (const keyword of sensitiveKeywords) {
//             if (text.toLowerCase().includes(keyword.toLowerCase())) {
//               foundSensitive = true;
//               setResultMsg("Sensitive information found. Please enter the password to proceed.");
//               break;
//             }
//           }

//           // Check for an expiry date regardless of sensitive keywords
//           const expDateMatch = text.match(expiryDatePattern);
//           if (expDateMatch && expDateMatch[2]) {
//             // Parse the date here according to your date format
//             const dateParts = expDateMatch[2].split(/[-\/]/);
//             let year = parseInt(dateParts[2], 10);

//             // Adjust for two-digit years; assuming the year is in the 2000s
//             year = (year < 100) ? year + 2000 : year;

//             // Assuming the date format detected by OCR is DD-MM-YYYY
//             let day, month;
//             if (parseInt(dateParts[0], 10) <= 12) {
//               day = parseInt(dateParts[1], 10);
//               month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-indexed
//             } else {
//               day = parseInt(dateParts[0], 10);
//               month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
//             }

//             expiryDate = new Date(year, month, day);
//             console.log(`Expiry Date Found: ${expiryDate.toDateString()}`);

//             // Determine if the expiry date is within 30 days
//             const today = new Date();
//             const timeDiff = expiryDate.getTime() - today.getTime();
//             const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

//             console.log('Days Diff: ', daysDiff);
//             // Add this function inside your UploadFileModal component

//             if (daysDiff > 0 && daysDiff <= 171) {
//               addNotification('Expiry', {
//                 src: downloadURL,  // Use the download URL as the image source
//                 message: `Your document is expiring soon on ${expiryDate.toDateString()}.`

//               });

//               // Email details object
//               const emailDetails = {
//                 to: authUser.email,
//                 subject: 'Sensitive Document Expiry Alert',
//                 text: `Your sensitive document "${file.name}" is expiring on ${expiryDate.toDateString()}. Please take the necessary action. "${downloadURL}"`

//               };

//               // Send an email notification
//               await sendEmailNotification(emailDetails);
//             }
//           }

//           if (!foundSensitive && (dobPattern.test(text) || phonePattern.test(text))) {
//             foundSensitive = true;
//             setResultMsg("Sensitive data detected. Please enter the password to proceed.");
//           }

//           setSensitiveFound(foundSensitive);
//           setFile(file);

//           // If an expiry date was found and recognized, and the notification logic has been triggered
//           if (expiryDate) {
//             console.log(`Expiry Date: ${expiryDate.toDateString()}`);
//           }
//         })
//         .catch(error => {
//           console.error("An error occurred with Tesseract.js: ", error);
//         });
//     } else {
//       setFile(file);
//     }
//   };







//   const resetState = () => {
//     // Reset all states to their initial values.
//     setSensitiveFound(false);
//     setPasswordVerified(false); // Also reset the password verified flag
//     setPassword('');
//     setResultMsg('');
//     setFileToUpload(null);
//     setFile(null);
//     setIsDragging(false);
//     setNumPages(null);
//     setPageNumber(1);
//   };


//   const handleSetPassword = () => {
//     // Logic to securely save the userSetPassword to your database or authentication system.
//     if (!userSetPassword) {
//       setResultMsg("Please enter a password.");
//       return;
//     }
//     // Save the password here (omitted for brevity)
//     console.log(`Password set to: ${userSetPassword}`);
//     setPasswordSet(true); // Indicate that a password has been set
//     setShowToastMsg("Password has been set successfully!");
//   };

//   const verifyPassword = () => {
//     if (password === userSetPassword) {
//       setResultMsg("Password verified. You can now upload the file.");
//       setPasswordVerified(true);
//     } else {
//       setResultMsg("Incorrect password. Please try again.");
//       setPasswordVerified(false);
//     }
//     setPassword(''); // Clear the password input
//   };

//   const handleNextClick = () => {
//     if (!sensitiveFound) {
//       onFileUpload(fileToUpload);
//     } else if (!passwordSet) {
//       handleSetPassword(); // Try to set the password
//     } else if (!passwordVerified) {
//       verifyPassword(); // Try to verify the password
//     } else {
//       onFileUpload(fileToUpload); // All checks passed, upload the file
//     }
//   };



//   const handlePreviousPage = () => {
//     if (pageNumber > 1) {
//       setPageNumber(pageNumber - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (pageNumber < numPages) {
//       setPageNumber(pageNumber + 1);
//     }
//   };


//   return (
//     <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#171717] bg-opacity-90 backdrop-blur-lg">
//       <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl max-w-full w-auto md:w-[560px] flex flex-col">
//         <button
//           className="p-1 hover:bg-gray-700 rounded-full focus:outline-none h-10 w-10 self-end m-2"
//           onClick={handleCancelClick}
//         >
//           ✕
//         </button>
//         <div className="p-9 flex-grow">
//           <h3 className="text-xl font-semibold mb-5">Upload file</h3>
//           {!file ? (
//             <label
//               className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
//               onDragOver={e => {
//                 e.preventDefault();
//                 setIsDragging(true);
//               }}
//               onDragLeave={() => setIsDragging(false)}
//               onDrop={e => {
//                 e.preventDefault();
//                 setIsDragging(false);
//                 const files = e.dataTransfer.files;
//                 handleFileUpload(files[0]);
//               }}
//             >
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                 <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
//                   <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
//                 </svg>
//                 <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
//                   Drag and Drop file here or <span className="text-blue-500 underline cursor-pointer">Choose file</span>
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
//                   Supported formats: All major formats
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Maximum size: 10 MB
//                 </p>
//               </div>
//               <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
//             </label>
//           ) : (
//             <div className="relative mt-4">
//               {isImageType(file) ? (
//                 <img src={URL.createObjectURL(file)} alt="Uploaded preview" className="w-full h-auto max-h-[500px] object-cover rounded-xl" />
//               ) : (
//                 <div className="max-h-[500px] max-w-auto overflow-y-hidden">
//                   <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="flex justify-center items-center">
//                     <Page pageNumber={pageNumber} width={420} />
//                   </Document>

//                   {numPages > 1 && (
//                     <div className="absolute bottom-10 flex justify-center w-full space-x-2">
//                       <button
//                         className={`p-2 rounded-full focus:outline-none ${pageNumber === 1
//                           ? "bg-gray-400 text-gray-500 cursor-not-allowed" // styles for disabled state
//                           : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500" // styles for normal state
//                           }`}
//                         onClick={handlePreviousPage}
//                         disabled={pageNumber === 1}
//                       >
//                         <BiLeftArrowCircle className="text-white font-bold text-xl" />
//                       </button>
//                       <button
//                         className={`p-2 rounded-full focus:outline-none ${pageNumber === numPages
//                           ? "bg-gray-400 text-gray-500 cursor-not-allowed" // styles for disabled state
//                           : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500" // styles for normal state
//                           }`}
//                         onClick={handleNextPage}
//                         disabled={pageNumber === numPages}
//                       >
//                         <BiRightArrowCircle className="text-white font-bold text-xl" />
//                       </button>


//                     </div>

//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//           {sensitiveFound && !passwordVerified && (
//             <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//               <div className="p-4 bg-white rounded-lg text-center">
//                 <p className="text-red-600">Sensitive content detected.</p>
//                 {!passwordSet && (
//                   <>
//                     <input
//                       type="password"
//                       value={userSetPassword}
//                       onChange={(e) => setUserSetPassword(e.target.value)}
//                       placeholder="Set your password"
//                       className="mt-2"
//                     />
//                     <button onClick={handleSetPassword} className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-700">Set Password</button>
//                   </>
//                 )}
//                 {passwordSet && (
//                   <>
//                     <p>Please enter the password to proceed.</p>
//                     <input
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="Enter password to verify"
//                       className="mt-2"
//                     />
//                     <button onClick={verifyPassword} className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-700">Verify</button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//           <div id="result" className="mt-5">{resultMsg}</div>

//           <div className="flex justify-between mt-12">
//             <button
//               className="bg-gray-700 text-white rounded-md p-3 w-1/2 mr-2 focus:outline-none hover:bg-gray-600" onClick={handleCancelClick}
//             >
//               Cancel
//             </button>

//             <button
//               className="w-1/2 bg-blue-500 text-white rounded-md p-3 focus:outline-none hover:bg-blue-600" isLoading
//               onClick={handleNextClick}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UploadFileModal;
