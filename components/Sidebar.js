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
import { IoIosAddCircleOutline } from "react-icons/io";
import { app } from "../firebase/firebase";
import { getFirestore, doc, getDoc} from "firebase/firestore";
import { useAuth } from "../firebase/auth";
import CreateFolderModel from './Folder/CreateFolderModel';
import UploadFileModal from './File/UploadFileModel';

export default function Layout({ children, setFolderList, setFileList }) {
  const db = getFirestore(app); 
  const router = useRouter();
  const { signOut } = useAuth();
  const { authUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const [showDropdown, setShowDropdown] = useState(false);

  const iconMapping = {
    'Cloud': <DashboardCustomizeOutlinedIcon className="icon-class" />,
    'Starred': <StarBorderOutlinedIcon className="icon-class" />,
    'Shared': <PeopleAltOutlinedIcon className="icon-class" />,
    'Trash': <DeleteOutlinedIcon className="icon-class" />,
    'Settings': <SettingsSharpIcon className="icon-class" />,
    'Logout': <LogoutOutlinedIcon className="icon-class" />,
  };

  const menuItems = [
    { href: '/', title: 'Cloud' },
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

  const handleAddFile = () => {
    window.upload_file.showModal(); // Assuming this opens the Add File modal
    setShowDropdown(false); // This will close the dropdown
  };

  const handleAddFolder = () => {
    setIsModalOpen(true); // This opens the Add Folder modal
    setShowDropdown(false); // This will close the dropdown
  };
  
  const handleNavigation = async (targetPath) => {
    setIsLoading(true); // Show the loader
    // Perform the navigation logic, e.g., updating the route
    await router.push(targetPath); // Replace with your actual navigation code
    setIsLoading(false); // Hide the loader when navigation is complete
  };

  const [userPlanName, setUserPlanName] = useState(''); // Default plan name
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (authUser?.username) {
        const userDocRef = doc(db, 'users', authUser.username);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserPlanName(userData.plan?.name || ''); // Use the plan name from Firestore or default to 'Free'
          }
        } catch (error) {
          console.error("Error fetching user's plan:", error);
        }
      }
    };
  
    fetchUserPlan();
  }, [authUser, db]);


  return (
    authUser &&
    <div className='max-h-screen flex flex-col'>
      {isLoading && <Loader />}
      <div className='flex flex-col md:flex-row flex-1'>
        <div className="p-6 w-[167px] h-[calc(100%-1.5rem)] z-60 fixed top-0.75rem left-0 lg:w-65 rounded-l-3xl rounded-r-3xl flex justify-center bg-[#121212] m-3">
          <div className="flex flex-col justify-start item-center">
            <div className="flex items-center justify-center"> { /* Assuming you want it vertically and horizontally centered on the screen */}
              <Link href="/">
              <div className="flex items-center">
  <div className="ml-1 relative mb-1">
  <span className="absolute top-3 right-[88px] text-[11px] text-black bg-yellow-600 rounded-md font-bold px-2 transform -rotate-45 z-10">{userPlanName}</span>
    <span className="text-5xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton relative">
      D
    </span>
    <span className="text-2xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton">ocomo</span>
    <span className="absolute top-5 left-34 text-xs">©</span>
  </div>
</div>
              </Link>
            </div>
            <nav className='mt-3'>
              <ul>
              <div className="mt-4">
      {/* Dropdown Toggle Button */}
      <div
        className="flex justify-center items-center m-auto bg-[#3EA88B] hover:bg-[#53B499] text-white font-bold py-3 w-[130px] rounded-full cursor-pointer duration-300"
        onClick={() => setShowDropdown(!showDropdown)}
      >
      <IoIosAddCircleOutline className='text-3xl mr-3'/>Add
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="mt-2 w-[130px] ml-3 py-2 w-30 bg-transparent opacity-35 rounded-lg shadow-xl">
          <div
            className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer transition duration-300 rounded-full"
            onClick={handleAddFile}
          >
            <img src="/UploadFile.png" alt="File" className='w-8 h-8 mr-3' />
            <span className="text-[9px] text-gray-300"><span className='text-[14px]'>+</span> FILE</span>
          </div>
          <div
            className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer transition duration-300 rounded-full"
            onClick={handleAddFolder}
          >
            <img src="/UploadFolder.png" alt="Folder" className='w-8 h-8 mr-3' />
            <span className="text-[9px] text-gray-300"><span className='text-[14px]'>+</span> FOLDER</span>
          </div>
        </div>
      )}
    </div>
              {menuItems.map(({ href, title }) => (
                <li className='m-3' key={title}>
                  <Link href={href}>
                    <div
                      className={`flex items-center gap-4 pl-3 py-3 w-[130px] rounded-full group cursor-pointer transition-transform duration-300 m-auto ${router.asPath === href
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
              {/* <div className="mt-4">
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
              </div>  */}
            </nav>
            <div className="mt-auto flex justify-center">
              <div className="py-3 w-[130px] flex px-7 items-center  rounded-full group cursor-pointer hover:shadow-lg hover:scale-110 hover:bg-gray-600 hover:text-white transition-transform duration-300" onClick={signOut}>
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
