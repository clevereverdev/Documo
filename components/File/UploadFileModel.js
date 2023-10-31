import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { app } from "../../firebase/firebase";
import { useAuth } from "../../firebase/auth";
import { ParentFolderIdContext } from "../../context/ParentFolderIdContext";
import { ShowToastContext } from "../../context/ShowToastContext";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Tesseract from 'tesseract.js';

function UploadFileModal({ closeModal }) {
  const { authUser } = useAuth();
  const { parentFolderId, setParentFolderId } = useContext(
    ParentFolderIdContext
  );
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  const docId = Date.now();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [sensitiveFound, setSensitiveFound] = useState(false);
  const [password, setPassword] = useState('');
  const [resultMsg, setResultMsg] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);



  const sensitiveKeywords = ["Driver License", "Green Card", "Passport", "Birth Certificate"];
  const dobPattern = /\d{2}\/\d{2}\/\d{4}/;
  const phonePattern = /\d{10}/;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file); // Save the selected file
      checkImage(file);
    }
  };

  const handleCancelClick = () => {
    closeModal(false); // Close modal without any action
  };

  const handleNextClick = () => {
    if (sensitiveFound) {
      verifyPassword();
    } else if (fileToUpload) {
      onFileUpload(fileToUpload);
    }
  };


  const onFileUpload = async (file) => {
    if (file) {
      if (file?.size > 10000000) {
        setShowToastMsg("File is too large")
        return;
      }
      const fileRef = ref(storage, "file/" + file.name);

      uploadBytes(fileRef, file)
        .then((snapshot) => {
          console.log("Uploaded a blob or file!");
        })
        .then((resp) => {
          getDownloadURL(fileRef).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            await setDoc(doc(db, "files", docId.toString()), {
              name: file.name,
              type: file.name.split(".")[1],
              size: file.size,
              modifiedAt: file.lastModified,
              createdBy: authUser.email,
              parentFolderId: parentFolderId,
              imageUrl: downloadURL,
              id: docId,
              sensitive: sensitiveFound
            });
            closeModal(true);
            setShowToastMsg("File Uploaded Successfully!");
          });
        });

    }
  };

  const isImageType = (file) => {
    const supportedFormats = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/heic"];
    return supportedFormats.includes(file.type);
  };

  const handleFileUpload = (uploadedFile) => {
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const checkImage = (file) => {
    if (isImageType(file)) {
      Tesseract.recognize(file, 'eng').then(({ data: { text } }) => {
        const lowercaseText = text.toLowerCase();

        for (const keyword of sensitiveKeywords) {
          if (lowercaseText.includes(keyword.toLowerCase())) {
            setSensitiveFound(true);
            setResultMsg("Sensitive information found. Please enter the password to proceed.");
            return;
          }
        }

        if (dobPattern.test(text) || phonePattern.test(text)) {
          setSensitiveFound(true);
          setResultMsg("Sensitive data detected. Please enter the password to proceed.");
          return;
        }

        // Call the original file upload function if no sensitive data is detected
        onFileUpload(file);
      });
    } else {
      // Bypass OCR check and directly upload if not an image
      onFileUpload(file);
    }
  };

  const verifyPassword = () => {
    // For simplicity, we're checking if the password is "secret"
    if (password === "secret") {
      setResultMsg("Password verified. Image uploaded successfully.");
      onFileUpload(document.getElementById("dropzone-file").files[0]);
    } else {
      setResultMsg("Incorrect password. Please try again.");
    }
    setSensitiveFound(false);
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
            <div className="relative">
              <img src={URL.createObjectURL(file)} alt="Uploaded preview" className="mt-4 w-full object-cover rounded" />
              <span className="absolute top-4 left-4">{file.name} ({Math.round(file.size / 1024)} KB)</span>
              <button className="absolute top-2 right-2 p-2 bg-red-500 rounded-full focus:outline-none h-10 w-10" onClick={() => setFile(null)}>
                ✕
              </button>
            </div>
          )}
          {/* <div className="flex items-center justify-start w-full mt-5">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Supported formats: All Formats
              </p>
            </div>
            <button className="ml-auto text-sm text-gray-500 dark:text-gray-400 mt-3">Max Size: 10 MB</button>
          </div> */}
          {sensitiveFound && (
            <div id="passwordPrompt" className="mt-5">
              <label htmlFor="password">Enter Password: </label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={verifyPassword}>Submit</button>
            </div>
          )}
          <div id="result" className="mt-5">{resultMsg}</div>

          <div className="flex justify-between mt-12">
            <button
              className="bg-gray-700 text-white rounded-md p-3 w-1/2 mr-2 focus:outline-none hover:bg-gray-600" onClick={handleCancelClick}
            >
              Cancel
            </button>

            <button
              className="w-1/2 bg-blue-500 text-white rounded-md p-3 focus:outline-none hover:bg-blue-600"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>


        </div>
      </div>
    </div>


  );
}

export default UploadFileModal;
