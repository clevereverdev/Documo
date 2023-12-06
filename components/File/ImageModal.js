import React, { useState } from "react";
import { FaLock } from "react-icons/fa";

function ImageModal({ imageUrl, isSensitive, onClose, filePassword }) {
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handlePasswordSubmit = () => {
    if (isSensitive && password === filePassword) { // Now filePassword is defined and should work
      setIsVerified(true);
    } else {
      alert("Incorrect password!");
      setPassword(""); // Clear the password input for security
    }
  };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="relative bg-[#292929] p-4 rounded-xl">
          <button className="text-[#3EA88B] text-lg" onClick={onClose}>close</button>
          <img
            src={imageUrl}
            alt="Large view"
            className={!isSensitive || isVerified ? "" : "blur-md"}
            style={{ maxWidth: "80vw", maxHeight: "80vh" }}
          />
          {isSensitive && (
            <div>
               <span className="absolute bottom-[55px] left-8">
            <FaLock className="text-gray-400" />
          </span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white my-4 pr-10"
              />
              <button className="w-40 mx-3 rounded-lg bg-[#3EA88B] text-white p-4 transform transition-transform hover:bg-[#53B499]"
              onClick={handlePasswordSubmit}>Submit</button>
            </div>
          )}
        </div>
      </div>
    );
  }
  export default ImageModal;


  // const handleUnlock = async () => {
  //   const enteredPassword = prompt("Enter password to unlock:");
  //   if (enteredPassword === file.password) {
  //     try {
  //       // Make sure file.id is a string, as Firestore expects a string path
  //       const fileRef = doc(db, "files", file.id.toString());
  //       await updateDoc(fileRef, {
  //         password: null,
  //         sensitive: false
  //       });
  //       setShowToastMsg("File unlocked successfully.");
  
  //       // Update the local state to reflect the unlocked status
  //       // Assuming `setSortedFiles` or similar function is available to update the file list
  //       setSortedFiles(prevFiles => prevFiles.map(f => f.id === file.id ? { ...f, password: null, sensitive: false } : f));
  
  //     } catch (error) {
  //       console.error("Error unlocking file:", error);
  //       setShowToastMsg("Failed to unlock file.");
  //     }
  //   } else {
  //     alert("Incorrect password!");
  //   }
  // };