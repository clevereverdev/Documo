import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// ICONS
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

import { useAuth } from "../firebase/auth";
import CreateFolderModel from './Folder/CreateFolderModel';
import UploadFileModal from './File/UploadFileModel';

export default function Layout({ children }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { authUser } = useAuth(); // Assuming `useAuth` provides an `authUser` that is null when not authenticated
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    authUser &&
    <div className='min-h-screen flex flex-col'>
      <div className='flex flex-col md:flex-row flex-1'>
        <div className="p-6 w-[180px] h-[760px] z-20 fixed top-0 left-0 lg:w-65 rounded-l-3xl rounded-r-3xl flex justify-center bg-[#121212] m-3">
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
                        className={`flex items-center gap-4 pl-3 p-2 rounded-md group cursor-pointer transition-transform duration-300 m-auto ${router.asPath === href
                          ? 'bg-green-500 text-white' // The style for the active element
                          : 'hover:shadow-lg hover:scale-110 hover:bg-gray-600 hover:text-white' // The style for all non-active elements
                          }`}
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
                  <PermMediaOutlinedIcon className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add File</span>
                </div>
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors duration-300 m-auto" onClick={() => {
                  console.log("Button clicked!");
                  setIsModalOpen(true);
                }}>
                  <CreateNewFolderOutlinedIcon className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add Folder</span>
                </div>
              </div>
            </nav>
            <div className="mt-auto flex justify-center">
              <div className="p-2 flex px-7 items-center  rounded-md group cursor-pointer hover:shadow-lg hover:scale-110 hover:bg-gray-600 hover:text-white transition-transform duration-300" onClick={signOut}>
                {iconMapping['Logout']}
                <span className='ml-3'>Logout</span>
              </div>
            </div>
          </div>
        </div>
        <main className='main-content flex-1 ml-[200px] bg-[#121212] rounded-l-2xl rounded-r-2xl border-5 m-3 overflow-y-hidden'>
          {children}
        </main>

        <CreateFolderModel isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <dialog id="upload_file" className="modal">
          <UploadFileModal
            closeModal={() => window.upload_file.close()} />
        </dialog>
      </div>
    </div>
  );
}
