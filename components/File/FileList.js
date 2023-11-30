import React, { useContext, useState, useEffect, useRef } from 'react';
import { AiOutlineAppstoreAdd, AiOutlineBars, AiOutlineInfoCircle } from 'react-icons/ai'; // Import icons
import { BsFillTrashFill, BsFillPencilFill } from 'react-icons/bs'; // Import icons
import FileItem from './FileItem';
import { deleteDoc, doc, getFirestore, getDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from '../../context/ShowToastContext';
import { Tooltip } from "@nextui-org/react";
import ImageModal from './ImageModal';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, cn } from "@nextui-org/react";
import Starred from '../../pages/starred';
import { useFileActions, useFileRename } from "../File/UseFileActions";
import { BsStar, BsStarFill } from "react-icons/bs";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { FaDownload, FaTrash } from "react-icons/fa6";
// ICONS
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';


function FileList({ fileList, file }) {
  const db = getFirestore(app);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [gridView, setGridView] = useState(false); // Add grid view state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const { deleteFile, toggleStar, downloadFile, renameFile } = useFileActions();
  const { isRenaming, newName, handleRenameClick, handleNameChange, handleKeyDown, handleRenameSubmit } = useFileRename(currentFile, renameFile);
  const [starredFiles, setStarredFiles] = useState(new Set());


  const handleToggleStar = async (file) => {
    const currentStarredStatus = file.starred;
    await toggleStar(file, currentStarredStatus);

    // Update the sortedFiles state
    const updatedFiles = sortedFiles.map(f => {
      if (f.id === file.id) {
        return { ...f, starred: !currentStarredStatus };
      }
      return f;
    });
    setSortedFiles(updatedFiles);
  };


  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const newDropdownRef = useRef(null);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(Array(fileList.length).fill(false)); // Initialize with `false` values
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const iconClasses = "text-2xl text-default-500 pointer-events-none flex-shrink-0";

  const handleFileActionClick = (selectedFile) => {
    setCurrentFile(selectedFile);
    handleRenameClick();  // Move the handleRenameClick here after setting currentFile
  };

  const handleClose = () => {
    setIsDropdownOpen(false);
  };

  const toggleDropdown = (index) => {
    // Create a new array with the same length as isDropdownOpen
    const newDropdownState = Array(isDropdownOpen.length).fill(false);

    // Toggle the dropdown for the clicked index
    newDropdownState[index] = !isDropdownOpen[index];

    // Set the new state
    setIsDropdownOpen(newDropdownState);
  };


  useEffect(() => {
    console.log("isDropdownOpen:", isDropdownOpen); // Add this line
    // Rest of your code
  }, [isDropdownOpen]);

  const handleFileImageClick = (file) => {
    // Before opening the modal, check if you need to fetch the latest file state
    // This could involve fetching the latest data from Firestore, for example
    const fetchLatestFileData = async () => {
      const fileRef = doc(db, "files", file.id.toString());
      const docSnapshot = await getDoc(fileRef);
      if (docSnapshot.exists()) {
        const updatedFile = docSnapshot.data();
        setCurrentFile(updatedFile); // Set the most up-to-date file data
        setIsModalOpen(true); // Now open the modal
      }
    };

    fetchLatestFileData();
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFile(null);
  };

  const handleFileDeleted = (deletedFileId) => {
    const updatedFiles = files.filter(file => file.id !== deletedFileId);
    setFiles(updatedFiles);
  };

  useEffect(() => {
    // Initially, set sortedFiles to the provided fileList
    setSortedFiles(fileList);
  }, [fileList]);

  // Function to toggle sorting order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Function to handle sorting by Name
  const handleSortByName = () => {
    const sorted = [...sortedFiles].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedFiles(sorted);
    toggleSortOrder(); // Toggle the sorting order
    setSortColumn('name'); // Update the sorted column
  };

  // Function to handle sorting by Date Modified
  const handleSortByDateModified = () => {
    const sorted = [...sortedFiles].sort((a, b) => {
      const dateA = new Date(a.modifiedAt);
      const dateB = new Date(b.modifiedAt);

      if (dateA < dateB) return sortOrder === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedFiles(sorted);
    toggleSortOrder(); // Toggle the sorting order
    setSortColumn('dateModified'); // Update the sorted column
  };

  // Function to handle sorting by Size
  const handleSortBySize = () => {
    const sorted = [...sortedFiles].sort((a, b) => {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;

      if (sizeA < sizeB) return sortOrder === 'asc' ? -1 : 1;
      if (sizeA > sizeB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedFiles(sorted);
    toggleSortOrder(); // Toggle the sorting order
    setSortColumn('size'); // Update the sorted column
  };

  // Function to handle sorting by Kind
  const handleSortByKind = () => {
    const sorted = [...sortedFiles].sort((a, b) => {
      const kindA = a.type || 'Unknown';
      const kindB = b.type || 'Unknown';

      if (kindA < kindB) return sortOrder === 'asc' ? -1 : 1;
      if (kindA > kindB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedFiles(sorted);
    toggleSortOrder(); // Toggle the sorting order
    setSortColumn('kind'); // Update the sorted column
  };

  const toggleGridView = () => {
    setGridView(!gridView);
  };
  // File name length
  const truncateFileName = (name, length = 25) => {
    if (name.length > length) {
      return `${name.substring(0, length)}...`;
    }
    return name;
  };

  const getFileImage = (extension, imageUrl) => {
    if (['pdf', 'zip'].includes(extension.toLowerCase())) {
      return extension.toLowerCase() === 'pdf' ? './pdf.png' : './zip.png';
    } else {
      return imageUrl;
    }
  };

  function getFileTypeIcon(fileType) {
    // Define a dictionary of file types and their corresponding icon URLs
    const fileIcons = {
      'pdf': '/pdf.png',
      'png': '/png.png',
    };

    // Return the appropriate icon's URL or a default one if the file type is not recognized
    return fileIcons[fileType.toLowerCase()] || '/zip.png';
  }

  return (
    <div className='mx--1 my-5 p-5 rounded-2xl h-screen' style={{ marginTop: '-20px' }}>
      <div className='flex items-center justify-between'>
        <h2 className='text-[18px] font-Payton mb-4'>Recent Files</h2>
        <div className="flex items-center space-x-2">
          <Tooltip showArrow={false} content={gridView ? 'List View' : 'Grid View'} placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg"
          // arrowSize={0}
          >
            <button onClick={toggleGridView} style={{ outline: 'none' }}>
              {gridView ? <FormatListNumberedOutlinedIcon className='text-2xl outline-none' /> : <GridViewOutlinedIcon className='text-2xl' />}
            </button>
          </Tooltip>
        </div>
      </div>
      {isRenaming && currentFile && (
        <div className="rename-input-container">
          <input
            type="text"
            value={newName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      )}

      {gridView ? (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4' style={{ maxHeight: 'calc(55vh - 60px)', overflowY: 'auto' }}>
          {sortedFiles && sortedFiles.map((item, index) => (
            <div key={index} className='text-center relative bg-[#343434] rounded-lg w-[165px] h-[170px] hover:bg-gray-600'>
              <div className="file-container flex flex-col items-center justify-center p-3">
                {/* File header section */}
                <div className="file-header flex justify-between items-center w-full mb-2">
                  {/* File type icon */}
                  <div className="file-icon">
                    <img src={getFileTypeIcon(item.type)} alt={item.type} width={20} height={20} />
                  </div>
                  {/* File name */}
                  <div className="file-name text-[10px] font-bold text-gray-300 text-center">
                    {truncateFileName(item.name)}
                  </div>

                  {/* Info Icon */}
                  <div className="relative ml-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600 z-[1001]">
                          <AiOutlineInfoCircle className="text-gray-300 text-2xl" />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu variant="faded" aria-label="Dropdown menu with description" className='bg-[#18181b] rounded-xl py-2'>
                        <DropdownSection title="Actions" showDivider>
                          <DropdownItem
                            key="new"
                            shortcut="⌘N"
                            startContent={<MdOutlineDriveFileRenameOutline className={iconClasses} />}
                            className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                            onClick={() => handleFileActionClick(item)}
                          >
                            Rename
                            <div className="text-xs text-gray-500">
                              Give a name
                            </div>
                          </DropdownItem>
                          <DropdownItem
                            key="copy"
                            shortcut="⌘C"
                            className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                            onClick={() => handleToggleStar(item)}
                            startContent={item.starred ? <BsStarFill className={iconClasses} /> : <BsStar className={iconClasses} />}
                          >
                            {item.starred ? 'Unstarred' : 'Starred'}
                            <div className="text-xs text-gray-500">
                              Keep in favorites
                            </div>
                          </DropdownItem>
                          <DropdownItem
                            key="copy"
                            shortcut="⌘C"
                            startContent={<FaDownload className={iconClasses} />}
                            className="text-danger hover:bg-[#292929] hover:border-gray-600 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                            onClick={() => downloadFile(item)}
                          >
                            Download
                            <div className="text-xs text-gray-500">
                              Download in local
                            </div>
                          </DropdownItem>
                        </DropdownSection>
                        <DropdownSection title="Danger zone">
                          <DropdownItem
                            key="delete"
                            className="text-red-400 hover:bg-[#292929] hover:border-red-400 hover:border-2 rounded-xl px-3 py-1 mx-2 w-[210px]"
                            color="danger"
                            shortcut="⌘D"
                            startContent={<FaTrash className={cn(iconClasses, "text-red-400")} />}
                            onClick={() => deleteFile(item)}
                          >
                            Delete
                            <div className="text-xs text-red-400">
                              Move to trash
                            </div>
                          </DropdownItem>
                        </DropdownSection>

                      </DropdownMenu>
                    </Dropdown>

                  </div>
                </div>
                {/* Main file image */}
                <img src={getFileImage(item.type, item.imageUrl)} alt={item.name} width={30} height={30} />
              </div>
            </div>
          ))}
        </div>


      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-[min-content,3fr,1.9fr,0.9fr,1.2fr,1fr,auto] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'>
            <h2 className='ml-5 text-[15px]'>#</h2>
            <h2 className='ml-5' onClick={handleSortByName}>
              Name
              {sortColumn === 'name' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'} text-[#1ED760]`}>
                  {sortOrder === 'asc' ? <ArrowDropUpOutlinedIcon /> : <ArrowDropDownOutlinedIcon />}
                </span>
              )}
            </h2>
            <h2 className='ml-4' onClick={handleSortByDateModified}>
              Date Modified
              {sortColumn === 'dateModified' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'} text-[#1ED760]`}>
                  {sortOrder === 'asc' ? <ArrowDropUpOutlinedIcon /> : <ArrowDropDownOutlinedIcon />}
                </span>
              )}
            </h2>
            <h2 className='ml-[-2]' onClick={handleSortBySize}>
              Size
              {sortColumn === 'size' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'} text-[#1ED760]`}>
                  {sortOrder === 'asc' ? <ArrowDropUpOutlinedIcon /> : <ArrowDropDownOutlinedIcon />}
                </span>
              )}
            </h2>
            <h2 onClick={handleSortByKind}>
              Kind
              {sortColumn === 'kind' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'} text-[#1ED760]`}>
                  {sortOrder === 'asc' ? <ArrowDropUpOutlinedIcon /> : <ArrowDropDownOutlinedIcon />}
                </span>
              )}
            </h2>
            <h2>Actions</h2>
          </div>
          <div className='overflow-auto' style={{ flex: 1, maxHeight: 'calc(55vh - 100px)' }}>
            {sortedFiles && sortedFiles.map((item, index) => (
              <FileItem
                file={item}
                index={index + 1} // Add 1 since index starts at 0
                key={index}
                onFileImageClick={handleFileImageClick}
                onToggleStar={handleToggleStar}
                onFileDeleted={handleFileDeleted}

              />
            ))}
          </div>

          {isModalOpen && currentFile && (
            <ImageModal
              imageUrl={currentFile.imageUrl}
              isSensitive={currentFile.sensitive}
              filePassword={currentFile.password} // This should match the name of the prop expected by ImageModal
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
    </div>
  );
}

export default FileList;