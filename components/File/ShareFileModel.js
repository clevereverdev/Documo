// ShareFileModal.js
import React, { useState } from 'react';
import { FaTimes } from "react-icons/fa";
import { RiUserSharedFill } from "react-icons/ri";

function ShareFileModal({ isOpen, onClose, onShare, file }) {
    const [shareWith, setShareWith] = useState('');
    const [permission, setPermission] = useState('viewer'); // Default to viewer

    const handleSubmit = () => {
        console.log("Sharing with:", shareWith, "Permission:", permission);
        onShare(shareWith, permission); // Pass both email/username and permission
        onClose();
      };
      

    // Assuming file has properties like name and imageUrl
    const fileName = file ? file.name : 'No file selected'; // Default text if file is not provided
    const fileImage = file ? file.imageUrl : './pdf.png'; // Path to a default image

return (
        <div style={{ display: isOpen ? 'block' : 'none' }}>
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
                <div className="modal-content bg-[#201c1c] p-5 rounded-2xl shadow-lg z-50 relative w-[450px] h-[350px] flex flex-col items-center">
                    <div className="absolute text-sm flex items-center justify-center top-4 right-4 hover:bg-gray-700 h-6 w-6 rounded-full">
                        <FaTimes onClick={onClose} className="text-gray-400 cursor-pointer" />
                    </div>
                        {/* Image and File Name */}
                        <div className="flex items-center space-x-2 mb-4">
                            <img src={fileImage} alt="File" className="h-12 w-12 bg-gray-600 p-1 rounded-lg" />
                            <span className="text-gray-300 font-bold text-lg">{fileName}</span>
                        </div>
                        <div className="text-gray-300 text-lg font-bold mb-2">
                            <div className="text-xs text-gray-400"><span className='font-Payton text-green-500 text-md'>MAKE IT EASY!</span> Share with friends and family</div>
                        </div>
                    <div className="w-full flex flex-col items-center mt-[30px]">
                        {/* Share with friends Text */}
                        <div className="relative mt-2">
                            <span className="absolute top-5 left-4">
                                <RiUserSharedFill className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Enter username or email"
                                value={shareWith}
                                onChange={(e) => setShareWith(e.target.value)}
                                className="font-medium border bg-transparent border-[#374151] hover:border-gray-400 p-4 pl-10 w-80 rounded-2xl outline-none focus:border-white"
                            />
                             {/* Dropdown for permissions */}
                             <select
                                value={permission}
                                onChange={(e) => setPermission(e.target.value)}
                                className="mt-2 border bg-transparent border-[#374151] hover:border-gray-400 p-2 w-80 rounded-2xl outline-none focus:border-white"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
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
export default ShareFileModal;
