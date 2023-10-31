import React, { useContext, useState, useEffect, useRef } from 'react';
import { AiOutlineAppstoreAdd, AiOutlineBars, AiOutlineInfoCircle } from 'react-icons/ai'; // Import icons
import { BsFillTrashFill, BsFillPencilFill } from 'react-icons/bs'; // Import icons
import { FaDownload } from 'react-icons/fa'; // Import icons
import FileItem from './FileItem';
import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { ShowToastContext } from '../../context/ShowToastContext';
import { Tooltip } from "@nextui-org/react";
import ImageModal from './ImageModal';


function FileList({ fileList, file }) {
  const db = getFirestore(app);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [gridView, setGridView] = useState(false); // Add grid view state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);



  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const newDropdownRef = useRef(null);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(Array(fileList.length).fill(false)); // Initialize with `false` values
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

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

  // Delete File
  const deleteFile = async (file) => {
    try {
      const fileRef = doc(db, "files", file.id.toString());
      await deleteDoc(fileRef);

      // Show a success message or perform any additional actions
      setShowToastMsg('File Deleted!!!');
    } catch (error) {
      console.error("Error deleting file:", error);
      // Handle any errors that may occur during the deletion process
      // You can show an error message or perform other error handling actions here
    }
  };

  // Function to handle file image click
  const handleFileImageClick = (file) => {
    setCurrentFile(file);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFile(null);
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
  const truncateFileName = (name, length = 15) => {
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
      // 'doc': '/path_to_icons/doc_icon.png',
      // 'docx': '/path_to_icons/docx_icon.png',
      // 'xls': '/path_to_icons/xls_icon.png',
      // 'xlsx': '/path_to_icons/xlsx_icon.png',
      'png': '/png.png',
      // 'jpg': '/path_to_icons/jpg_icon.png',
      // 'jpeg': '/path_to_icons/jpeg_icon.png',
      // 'txt': '/path_to_icons/txt_icon.png',
      // ... Add more file types and their icons as needed
    };

    // Return the appropriate icon's URL or a default one if the file type is not recognized
    return fileIcons[fileType.toLowerCase()] || '/zip.png';
  }

  return (
    <div className='bg-[#171717] mx--1 my-5 p-5 rounded-2xl h-[435px]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-[18px] font-Payton mb-4'>Recent Files</h2>
        <div className="flex items-center space-x-2">
          <Tooltip showArrow={false} content={gridView ? 'List View' : 'Grid View'} placement="bottom" className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-1 px-2 rounded-lg" arrowSize={0}>
            <button onClick={toggleGridView} style={{ outline: 'none' }}>
              {gridView ? <AiOutlineBars className='text-2xl outline-none' /> : <AiOutlineAppstoreAdd className='text-2xl' />}
            </button>
          </Tooltip>
        </div>
      </div>
      {gridView ? (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4' style={{ maxHeight: 'calc(55vh - 60px)', overflowY: 'auto' }}>
          {sortedFiles.map((item, index) => (
            <div key={index} className='text-center relative bg-[#343434] rounded-lg w-[167px] h-[170px] hover:bg-gray-500'>
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
                  {/* Info icon */}
                  <div className="relative ml-2">
                    <Tooltip
                      showArrow={false}
                      content="Info"
                      placement="top"
                      className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
                      arrowSize={0}
                    >
                      <button
                        onClick={() => toggleDropdown(index)} // Pass the index of the file to toggle its dropdown
                        className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600"

                      >
                        <AiOutlineInfoCircle className="text-gray-300 text-2xl" />
                      </button>
                    </Tooltip>
                    {isDropdownOpen[index] && (
                      <div className="absolute mt-2 w-72 bg-gray-600 text-white rounded-lg shadow-lg" style={{
                        zIndex: 9999,
                        top: '100%',
                        left: '10%',
                        maxHeight: 'auto', // Allow the dropdown to expand to fit its content

                      }}>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                          <span className="text-lg font-bold text-[#1ED760] font-Payton">Info</span>
                          <button className="text-sm text-blue-400 font-semibold font-Payton" onClick={handleClose}>Close</button>
                        </div>
                        <div className="px-4 py-3 flex items-start">
                          <BsFillTrashFill className="text-xl text-[#e2e8f0] mr-2 cursor-pointer" onClick={() => deleteFile(item)} />
                          <div>
                            <h3 className="text-[#e2e8f0] mb-2 text-md">Delete</h3>
                          </div>
                        </div>
          
                        <div className="px-4 py-3 flex items-start">
                          <FaDownload className="text-xl text-[#e2e8f0] mr-2 cursor-pointer" onClick={() => downloadFile(item)} />
                          <div>
                            <h3 className="text-[#e2e8f0] mb-2 text-md">Download</h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Main file image */}
                <img src={getFileImage(item.type, item.imageUrl)} alt={item.name} width={70} height={70} />
              </div>
            </div>
          ))}
        </div>

      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'>
            <h2 className='ml-5' onClick={handleSortByName}>
              Name
              {sortColumn === 'name' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'}`}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </h2>
            {/* Add similar click handlers for other columns */}
            <h2 className='ml-1' onClick={handleSortByDateModified}>
              Date Modified
              {sortColumn === 'dateModified' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'}`}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </h2>
            <h2 onClick={handleSortBySize}>
              Size
              {sortColumn === 'size' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'}`}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </h2>
            <h2 onClick={handleSortByKind}>
              Kind
              {sortColumn === 'kind' && (
                <span className={`ml-2 ${sortOrder === 'asc' ? 'animate-bounce-up' : 'animate-bounce-down'}`}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </h2>
            <h2>Action</h2>
          </div>
          <div className='overflow-auto' style={{ flex: 1, maxHeight: 'calc(55vh - 100px)' }}>
  {sortedFiles && sortedFiles.map((item, index) => (
    <FileItem file={item} key={index} onFileImageClick={handleFileImageClick} />
  ))}
</div>
          {isModalOpen && currentFile && (
      <ImageModal
        imageUrl={currentFile.imageUrl}
        isSensitive={currentFile.sensitive}
        onClose={handleCloseModal}
      />
    )}
        </>
      )}
    </div>
  );
}

export default FileList;