import React, { useState } from "react";

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
        <div className="relative bg-white p-4">
          <button onClick={onClose}>Close</button>
          <img
            src={imageUrl}
            alt="Large view"
            className={!isSensitive || isVerified ? "" : "blur-md"}
            style={{ maxWidth: "80vw", maxHeight: "80vh" }}
          />
          {isSensitive && !isVerified && (
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={handlePasswordSubmit}>Submit</button>
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