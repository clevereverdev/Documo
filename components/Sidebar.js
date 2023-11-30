import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import Loader from "../components/Loader"; // Import your Loader component

import { useAuth } from "../firebase/auth";
import CreateFolderModel from './Folder/CreateFolderModel';
import UploadFileModal from './File/UploadFileModel';

export default function Layout({ children, setFolderList, setFileList }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { authUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader

  const iconMapping = {
    'Dashboard': <DashboardCustomizeOutlinedIcon className="icon-class" />,
    'Starred': <StarBorderOutlinedIcon className="icon-class" />,
    'Shared': <PeopleAltOutlinedIcon className="icon-class" />,
    'Trash': <DeleteOutlinedIcon className="icon-class" />,
    'Settings': <SettingsSharpIcon className="icon-class" />,
    'Logout': <LogoutOutlinedIcon className="icon-class" />,
  };

  const menuItems = [
    { href: '/', title: 'Dashboard' },
    { href: '/starred', title: 'Starred' },
    { href: '/shared', title: 'Shared' },
    { href: '/trash', title: 'Trash' },
    { href: '/settings', title: 'Settings' },
  ];

  const onNewFolderAdded = (newFolder) => {
    if (setFolderList) {
      setFolderList(currentFolders => [...currentFolders, newFolder]);
    }
  };
  
  const onNewFileAdded = (newFileData) => {
    if (setFileList) {
      setFileList(currentFiles => [...currentFiles, newFileData]);
    }
  };

  const handleNavigation = async (targetPath) => {
    setIsLoading(true); // Show the loader
    // Perform the navigation logic, e.g., updating the route
    await router.push(targetPath); // Replace with your actual navigation code
    setIsLoading(false); // Hide the loader when navigation is complete
  };


  return (
    authUser &&
    <div className='max-h-screen flex flex-col'>
      {isLoading && <Loader />}
      <div className='flex flex-col md:flex-row flex-1'>
        <div className="p-6 w-[167px] h-[calc(100%-1.5rem)] z-60 fixed top-0.75rem left-0 lg:w-65 rounded-l-3xl rounded-r-3xl flex justify-center bg-[#121212] m-3">
          <div className="flex flex-col justify-start item-center">
            <div className="flex items-center justify-center"> { /* Assuming you want it vertically and horizontally centered on the screen */}
              <Link href="/">
                <div className="flex items-center"> { /* Added 'a' tag for accessibility */}
                  {/* <img src="/logo.png" alt="Your Alt Text" className="h-12 w-12" /> */}
                  <div className="ml-1 relative mb-1"> { /* Added a container for the text */}
                    <span className="text-5xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton">D</span>
                    <span className="text-2xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton">ocomo</span>
                    <span className="absolute top-5 left-34 text-xs">©</span> { /* Adjusted positioning */}
                  </div>
                </div>
              </Link>
            </div>
            <nav className='mt-3'>
              <ul>
              {menuItems.map(({ href, title }) => (
                <li className='m-3' key={title}>
                  <Link href={href}>
                    <div
                      className={`flex items-center gap-4 pl-3 p-2 rounded-full group cursor-pointer transition-transform duration-300 m-auto ${router.asPath === href
                        ? 'bg-[white] text-black' // The style for the active element
                        : 'hover:shadow-lg hover:scale-110 hover:bg-gray-600 hover:text-white' // The style for all non-active elements
                        }`}
                      onClick={() => handleNavigation(href)}
                    >
                      {iconMapping[title]}
                      <span>{title}</span>
                    </div>
                  </Link>
                </li>
              ))}
              </ul>
              {/* Add File & Add Folder buttons */}
              <div className="mt-4">
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md bg-green-500 hover:bg-green-600 transition-colors duration-300 m-auto" onClick={() => window.upload_file.showModal()}>
                  <PermMediaOutlinedIcon className="text-xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add File</span>
                </div>
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors duration-300 m-auto" onClick={() => {
                  console.log("Button clicked!");
                  setIsModalOpen(true);
                }}>
                  <CreateNewFolderOutlinedIcon className="text-xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add Folder</span>
                </div>
              </div>
            </nav>
            <div className="mt-auto flex justify-center">
              <div className="p-2 flex px-7 items-center  rounded-full group cursor-pointer hover:shadow-lg hover:scale-110 hover:bg-gray-600 hover:text-white transition-transform duration-300" onClick={signOut}>
                {iconMapping['Logout']}
                <span className='ml-3'>Logout</span>
              </div>
            </div>
          </div>
        </div>
        <main className='main-content flex-1 ml-[188px] rounded-l-2xl rounded-r-2xl border-5 m-3 overflow-y-hidden' style={{ background: 'linear-gradient(to bottom, #121212, #292929)'}}>
          {children}
        </main>

        <CreateFolderModel
      onFolderCreated={onNewFolderAdded}
      isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />        
        <dialog id="upload_file" className="modal">
          <UploadFileModal
           onFileCreated={onNewFileAdded}
            closeModal={() => window.upload_file.close()} />
        </dialog>
      </div>
    </div>
  );
}
