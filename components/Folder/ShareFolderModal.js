// ShareFileModal.js
import React, { useState, useContext, useEffect } from 'react';
import { FaTimes } from "react-icons/fa";
import { RiUserSharedFill } from "react-icons/ri";
import { useAuth } from "../../firebase/auth";
import { UserAvatarContext } from '../../context/UserAvatarContext';
import Image from 'next/image'

function ShareFolderModal({ isOpen, onClose, onShare, folder }) {
    const [shareWith, setShareWith] = useState('');
    const [permission, setPermission] = useState('viewer'); // Default to viewer
    const { authUser } = useAuth();
    const { userAvatar } = useContext(UserAvatarContext);
    const [key, setKey] = useState(0); // Added state to force re-render

    const changeAvatar = (newAvatar) => {
    localStorage.setItem('userAvatar', newAvatar);
    setUserAvatar(newAvatar); // Update state
    };

    const handleSubmit = () => {
        console.log("Sharing with:", shareWith, "Permission:", permission);
        onShare(shareWith, permission); // Pass both email/username and permission
        onClose();
      };

      useEffect(() => {
        setKey(prevKey => prevKey + 1);
      }, [userAvatar]);
    

      

    // Assuming file has properties like name and imageUrl
    const folderName = folder ? folder.name : 'No folder selected'; // Default text if file is not provided
    const folderImage = folder ? './folder.png' : './pdf.png'; // Path to a default image

    // Folder name length
const truncateFolderName = (name, length = 35) => {
    if (name.length > length) {
      return `${name.substring(0, length)}...`;
    }
    return name;
  };
return (
        <div style={{ display: isOpen ? 'block' : 'none' }}>
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="modal-content bg-[#201c1c] p-5 rounded-2xl shadow-lg z-50 relative w-[450px] h-[480px] flex flex-col items-center">
                    <div className="absolute text-sm flex items-center justify-center top-4 right-4 hover:bg-gray-700 h-6 w-6 rounded-full">
                        <FaTimes onClick={onClose} className="text-gray-400 cursor-pointer" />
                    </div>
                        {/* Image and File Name */}
                        <div className="flex items-center space-x-2 mb-4">
                            <img src={folderImage} alt="File" className="h-12 w-12 bg-gray-600 p-1 rounded-lg" />
                            <span className="text-gray-300 font-bold text-lg">{truncateFolderName(folderName)}</span>
                        </div>
                        <div className="text-gray-300 text-lg font-bold mb-2">
                            <div className="text-xs text-gray-400"><span className='font-Payton text-green-500 text-md'>MAKE IT EASY!</span> Share with friends and family</div>
                        </div>
                    <div className="w-full flex flex-col items-center mt-[2px]">
                        {/* Share with friends Text */}
                        <div className="relative mt-2 flex flex-col items-center">
                            <span className="absolute top-5 left-4">
                                <RiUserSharedFill className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Add username or email"
                                value={shareWith}
                                onChange={(e) => setShareWith(e.target.value)}
                                className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white"
                            />

                            {/* User info and permission selector */}
    <h2 className="font-bold text-white text-[13px] mt-3 mr-[200px]">People with access</h2>
  <div className="flex items-start justify-between mt-4">
  <div className="flex items-start">
    <div className="flex-shrink-0 mr-3">
      <Image src={userAvatar} width={40} height={40} alt="User Avatar" className="rounded-full" />
    </div>
    <div className="flex flex-col justify-center m-[-2px]">
      <span className="font-bold text-md">{authUser.username} (you)</span>
      <span className="text-gray-500 text-xs">{authUser.email}</span>
    </div>
  </div>
  <div className="flex items-center ml-20 mt-2">
    <span className="text-gray-500 text-xs">Owner</span>
  </div>
</div>
                             {/* General access info */}
  <h2 className="font-bold text-white text-[13px] mt-4 mr-[230px]">General access</h2>
  <div className="flex items-start justify-between mt-2">
  <div className="flex-shrink-0 mr-3">
    <img src='./share.png' width={45} height={45} alt="User Avatar" className="rounded-full" />
    </div>

    <div className="flex flex-col justify-center m-[-2px]">
      <span className='font-bold text-md'>Permission set-up</span>
      <span className="text-gray-500 text-xs">Share with loved ones</span>
    </div>
    <div className="ml-7 mt-1">
    <select
    value={permission}
    onChange={(e) => setPermission(e.target.value)}
    className="select select-primary p-2 w-[90px]"
  >
    <option disabled>How you want to send?</option>
    <option value="viewer">Viewer</option>
    <option value="editor">Editor</option>
  </select>
    </div>
  </div>
</div>

                        {/* Buttons */}
                        <div className="flex space-x-2 mt-4">
                            <button className="w-40 rounded-2xl bg-[#1F51FF] text-white p-4 hover:bg-[#4169E1]"
                                onClick={handleSubmit}>Share</button>
                            <button className="w-40 rounded-2xl bg-[#EE4B2B] text-white p-4 hover:bg-[#E97451]"
                                onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ShareFolderModal;
