import React, { useContext, useState, useRef, useEffect } from 'react'
import FileItem from './FileItem'
import { deleteDoc, doc, getFirestore } from 'firebase/firestore'
import { app } from '../../firebase/firebase'
import { ShowToastContext } from '../../context/ShowToastContext'

function FileList({fileList}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear the previous timeout if there is one
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  return (
    <div className='bg-[#171717] mx--1 my-5 p-5 rounded-2xl' style={{ height: '55vh', display: 'flex', flexDirection: 'column' }}> {/* Main container with a fixed height */}
      <h2 className='text-[18px] font-Payton mb-4'>Recent Files</h2>
      <div className='grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 text-[13px] font-semibold border-b-[1px] pb-2 mt-3 border-gray-600 text-gray-400'> {/* Headers */}
          <h2 className='ml-5'>Name</h2>
          <h2>Date Modified</h2>
          <h2>Size</h2>
          <h2>Kind</h2>
          <h2>Action</h2>
      </div>
      <div className='overflow-auto' style={{ flex: 1 }}> {/* Scrollable container for the files, taking up all available space */}
        {fileList && fileList.map((item, index) => (
            <FileItem file={item} key={index} />
        ))}
      </div>
    </div>
  )
}

export default FileList
