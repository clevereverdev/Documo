import React, { useState } from "react";

function ImageModal({ imageUrl, isSensitive, onClose }) {
    const [password, setPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
  
    const handlePasswordSubmit = () => {
      // Here, you would check the entered password against the password stored for the file
      // If they match, set isVerified to true
      // For this example, I'm just checking if the password is '1234'
      if (password === "1234") {
        setIsVerified(true);
      } else {
        alert("Wrong password!");
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
