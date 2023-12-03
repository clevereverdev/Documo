import Image from 'next/image';
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { FaTrash } from 'react-icons/fa'; // Import the delete icon from react-icons
import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from "../../context/ShowToastContext";

function FolderItemSmall({ folder }) {
  const router = useRouter();
  const db = getFirestore(app);
  const [isHovered, setIsHovered] = useState(false); // State to track hover state
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  const handleFolderClick = () => {
    router.push(`/folder/${folder.id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true); // Set hover state to true on mouse enter
  };

  const handleMouseLeave = () => {
    setIsHovered(false); // Set hover state to false on mouse leave
  };

  const deleteSubFolder = async () => {
    // Confirm with the user before deletion
      try {
        await deleteDoc(doc(db, "Folders", folder.id));
        setShowToastMsg('Subfolder Deleted!');
        // You might want to refresh the list of folders here or navigate the user as needed
      } catch (error) {
        console.error("Error deleting subfolder:", error);
        // Handle the error, such as showing an error message to the user
      }
  };

  return (
    <div
      className={`flex w-[100px] h-[80px] rounded-xl items-center justify-center space-x-2 p-2 cursor-pointer mb-8 hover:bg-[#292929] relative`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleFolderClick}
    >
      <Image
        src='/folder.png'
        alt='folder'
        width={40}
        height={40}
      />
      <h1 className='text-xs'>{folder.name}</h1>
      {isHovered && (
        <div className="absolute bottom-2 right-10 mt-2 mr-2 bg-[#3EA88B] rounded-full p-2">
          <FaTrash
          className='text-black'
          onClick={(e) => {
          e.stopPropagation(); // Prevent the click from propagating to the parent div
          deleteSubFolder();
        }}
      />
        </div>
      )}
    </div>
  );
}

export default FolderItemSmall;
