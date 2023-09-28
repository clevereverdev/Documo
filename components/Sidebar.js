import React from 'react'
import { RxDashboard } from 'react-icons/rx';
import { BsFillFileEarmarkRuledFill } from 'react-icons/bs';
import { FaFileAlt,FaUserCircle  } from 'react-icons/fa';
import { AiTwotoneFolderOpen } from 'react-icons/ai';
import { VscGraph } from 'react-icons/vsc';

function Sidebar() {
    return (
        <div className="h-screen w-64 flex flex-col bg-pink-900 text-white p-4 sticky">
            <div className="flex items-center mb-8">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 mr-2" />
                <span className="text-2xl font-bold">Docomo</span>
            </div>
            <div className="mb-4">
                <div className="flex items-center">
                    <RxDashboard className="mr-2" />
                    <span>Dashboard</span>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex items-center mb-2">
                    <span>Upload</span>
                </div>
                <div className="ml-6">
                    <button className="flex items-center mb-2 text-gray-300 hover:text-white">
                        <BsFillFileEarmarkRuledFill className="mr-2" />
                        <span>Upload File</span>
                    </button>
                    <button className="flex items-center text-gray-300 hover:text-white">
                        <AiTwotoneFolderOpen className="mr-2" />
                        <span>Upload Folder</span>
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex items-center mb-2">
                    <span>Manage</span>
                </div>
                <div className="ml-6">
                    <div className="flex items-center mb-2 text-gray-300 hover:text-white">
                        <FaFileAlt className="mr-2" />
                        <span>File Manager</span>
                    </div>
                    <div className="flex items-center mb-2 text-gray-300 hover:text-white">
                        <VscGraph className="mr-2" />
                        <span>View Statistics</span>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex items-center mb-2">
                    <span>Account</span>
                </div>
                <div className="ml-6">
                    <div className="flex items-center mb-2 text-gray-300 hover:text-white">
                        <FaUserCircle className="mr-2" />
                        <span>Profile Manager</span>
                    </div>
                    {/* You can add more items based on your requirements */}
                </div>
            </div>
        </div>

    )
}

export default Sidebar



// import { FaDashboard, FaUpload, FaCog, FaUserCircle, FaFileAlt} from 'react-icons/fa'; // Corrected Icons
// import { AiOutlineFolderAdd, AiOutlineFileAdd } from 'react-icons/ai';
// import { BiStats, BiFolder } from 'react-icons/bi'; // Corrected Icons
// import { VscGraph } from 'react-icons/vsc'; // Corrected Icons
// function Sidebar() {
//   return (
// <div className="h-screen w-64 flex flex-col bg-gray-800 text-white p-4">
//   <div className="flex items-center mb-8">
//     <img src="/logo.png" alt="Logo" className="w-12 h-12 mr-2" />
//     <span className="text-2xl font-bold">Brand Name</span>
//   </div>
//   <div className="mb-4">
//     <div className="flex items-center">
//       <FaDashboard className="mr-2" />
//       <span>Dashboard</span>
//     </div>
//   </div>
//   <div className="mb-4">
//     <div className="flex items-center mb-2">
//       <FaUpload className="mr-2" />
//       <span>Upload</span>
//     </div>
//     <div className="ml-6">
//       <button className="flex items-center mb-2 text-gray-300 hover:text-white">
//         <AiOutlineFileAdd className="mr-2" />
//         <span>Upload File</span>
//       </button>
//       <button className="flex items-center text-gray-300 hover:text-white">
//         <AiOutlineFolderAdd className="mr-2" />
//         <span>Upload Folder</span>
//       </button>
//     </div>
//   </div>
//   <div className="mb-4">
//     <div className="flex items-center mb-2">
//       <FaCog className="mr-2" />
//       <span>Manage</span>
//     </div>
//     <div className="ml-6">
//       <div className="flex items-center mb-2 text-gray-300 hover:text-white">
//         <FaFileAlt className="mr-2" />
//         <span>File Manager</span>
//       </div>
//       <div className="flex items-center mb-2 text-gray-300 hover:text-white">
//         <VscGraph className="mr-2" />
//         <span>View Statistics</span>
//       </div>
//       {/* You can add more items based on your requirements */}
//     </div>
//   </div>
//   <div className="mb-4">
//     <div className="flex items-center mb-2">
//       <FaUserCircle className="mr-2" />
//       <span>Account</span>
//     </div>
//     <div className="ml-6">
//       <div className="flex items-center mb-2 text-gray-300 hover:text-white">
//         {/* Your Icon here */}
//         <span>Profile Manager</span>
//       </div>
//       {/* You can add more items based on your requirements */}
//     </div>
//   </div>
// </div>
//   );
// }

// export default Sidebar;
