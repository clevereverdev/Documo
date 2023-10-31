import moment from "moment";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";
import { BsFillTrashFill, BsFillPencilFill, BsStar, BsStarFill } from "react-icons/bs";
import { Tooltip } from "@nextui-org/react";
import defaultFileImage from '../../public/zip.png';
import { FaDownload, FaLock } from "react-icons/fa";



function FileItem({ file, onFileImageClick }) {

  const db = getFirestore(app);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  // Delete File
  const deleteFile = async (file) => {
    await deleteDoc(doc(db, "files", file.id.toString())).then(resp => {
      setShowToastMsg('File Deleted!!!');
    });
  };

  // Format File Size
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 ** 2) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(2)} MB`;
    else return `${(size / 1024 ** 3).toFixed(2)} GB`;
  };

  // File name length
  const truncateFileName = (name, length = 18) => {
    if (name.length > length) {
      return `${name.substring(0, length)}...`;
    }
    return name;
  };
  

  // New state for managing star status
  const [starred, setStarred] = useState(file.starred);

  // Toggle Star status
  const toggleStar = async (file) => {
    const newStarStatus = !starred;
    setStarred(newStarStatus);

    // Update the 'starred' field in Firestore
    const fileRef = doc(db, "files", file.id.toString());
    await updateDoc(fileRef, {
      starred: newStarStatus,
    });
  };

  // Function to handle file download
  const downloadFile = () => {
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
  };

  // State to handle renaming
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  // Function to start the renaming process
  const handleRenameClick = () => {
    setIsRenaming(true); // Show the input field for renaming
  };

  // Function to handle name change
  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  // Function to handle the "Enter" key in the input field
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleRenameSubmit();
    }
  };

  // Function to handle the renaming submission
  const handleRenameSubmit = async () => {
    if (newName.trim() === '') {
      // Prevent blank names
      setShowToastMsg('Name cannot be blank!');
      return;
    }

    // Update the 'name' field in Firestore
    const fileRef = doc(db, "files", file.id.toString());
    await updateDoc(fileRef, {
      name: newName
    });

    setIsRenaming(false); // Exit renaming mode after submission
    setShowToastMsg('File renamed successfully!');
  };

  // Map file extensions to corresponding images
  const getFileImage = (extension) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return '/pdf.png';
      case 'zip':
        return '/zip.png';
      default:
        return defaultFileImage; // Default image for unknown file types
    }
  };

  // Determine the image source based on the file extension
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const imageSrc = getFileImage(fileExtension);
  const displayImageSrc = ['pdf', 'zip'].includes(fileExtension)
  ? imageSrc
  : file.imageUrl;
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 text-gray-400 items-center hover:bg-inherit rounded-xl bg-[#262626] m-2 p-2 py-3">
    <div className="flex items-center gap-2">
    <div onClick={() => onFileImageClick(file)}>
  <Image
      src={displayImageSrc}          
      alt={file.name}
      width={35}
      height={35}
  />
</div>
      {/* Show lock icon if file is sensitive */}
      {file.sensitive && <FaLock className="text-red-500 ml-2" />}
      <div>
        {isRenaming ?  (
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              onBlur={handleRenameSubmit}
              autoFocus
              style={{
                padding: "0.2rem", // Adjust padding as needed
                paddingLeft: "0.4rem", // Adjust left padding to hide the first letter
              }}
            />
          ) : (
            <span onDoubleClick={handleRenameClick}>
              {truncateFileName(file.name)}
            </span>
          )}
        </div>
      </div>
      <div>{moment(file.modifiedAt).format("MMM DD, YYYY")}</div>
      <div>{formatFileSize(file.size)}</div>
      <div className="ml-1">{file.type || "Unknown"}</div>
      <div className="flex gap-2 cursor-pointer">

        {/* Delete Files */}
        <Tooltip showArrow={false} content="Delete" placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg" arrowSize={0}> 
          <div>
            <BsFillTrashFill className='hover:text-blue-600' onClick={() => deleteFile(file)} />
          </div>
        </Tooltip>

        {/* Rename Files */}
        <Tooltip showArrow={false} content="Rename" placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg" arrowSize={0}> 
          <div>
            <BsFillPencilFill className='hover:text-blue-600' onClick={handleRenameClick} />
          </div>
        </Tooltip>

        {/* Starred Files */}
        <Tooltip showArrow={false} content="Starred" placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg" arrowSize={0}> 
          <div className="icon-wrapper">
            {starred ? (
              <BsStarFill className="icon-fill" onClick={() => toggleStar(file)} />
            ) : (
              <BsStar className="icon-outline" onClick={() => toggleStar(file)} />
            )}
          </div>
        </Tooltip>

        {/* Download Files */}
        <Tooltip showArrow={false} content="Download" placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg" arrowSize={0}> 
          <div>
            <FaDownload className='hover:text-blue-600' onClick={downloadFile} /> 
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

export default FileItem;
