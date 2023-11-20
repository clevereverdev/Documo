import React, {useState} from 'react';
import { AiOutlineClose } from 'react-icons/ai'; // Import close icon
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Tooltip } from "@nextui-org/react";
import { FaTrash, FaStar, FaRegStar, FaPencilAlt, FaDownload, FaLock, FaLockOpen, FaPlusCircle} from 'react-icons/fa';


const Notifications = ({ onClose, notifications, removeNotification, clearAllNotifications }) => {
  const handleBack = () => {
    onClose(); // Close the notification screen
  };
  const [currentFilter, setCurrentFilter] = useState('all');
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };
  const sortedNotifications = [...notifications].sort((a, b) => b.id - a.id);

  

  const timeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    return "just now";
  }

  const filteredNotifications = sortedNotifications.filter(notification => {
    const currentTime = new Date();
    const notificationTime = new Date(notification.id); // Assuming notification.id is a timestamp
    const timeDiffHours = (currentTime - notificationTime) / (1000 * 60 * 60);
  
    switch (currentFilter) {
      case 'today':
        return timeDiffHours <= 24;
      case 'past':
        return timeDiffHours > 24;
      case 'file':
        return notification.data?.isFile;
      case 'folder':
        return notification.data?.isFolder;
      default:
        return true; // Show all notifications
    }
  });

  
  
  const renderNotificationContent = (notification) => {
    const { name, message, src: imageUrl, isFile, isDeleted, isStarred, isUnstarred, isDownloaded, isLocked, isUnlocked, isRename, isCreated, isExpiringSoon, date } = notification.data || {};
    
    const formattedName = name
    ? name.split('.')[0] // Remove everything after the dot
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize the first letter
    : 'Unknown';
    
    // Determine if it's a folder (no extension) or a file (with extension)
    const isFolder = !name || !name.includes('.');
    
    // Get the file extension (only for files)
    const fileExtension = isFile && !isFolder ? name.split('.').pop() : '';
    
    const truncatedMessage = message?.slice(0, 70) + (message?.length > 70 ? "..." : "") || "No message";
    const timeAgoText = timeAgo(notification.id);
    
    const expiringDate = notification.data.isExpiringSoon ? (
      <span className="text-gray-300 text-xs">
        on {notification.data.date}
      </span>
    ) : null;

    const expiringSoonTag = isExpiringSoon ? (
      <div className="rounded-md bg-red-600 text-gray-300 font-bold px-2 py-1 text-xs blink">
        expiring soon
      </div>
    ) : null;

    const sensitiveTag = isLocked ? (
      <div className="rounded-md bg-gray-700 opacity-3 text-white font-bold px-2 py-1 text-xs">
        sensitive
      </div>
    ) : null;

    // Conditionally render the overlay icon based on the notification message
  let overlayIcon = null;
  if (isDeleted) {
    overlayIcon = <FaTrash className="overlay-icon trash-icon text-sm" />;
  } else if (isStarred) {
    overlayIcon = <FaStar className="overlay-icon star-icon text-xs" />;
  } else if (isUnstarred) {
    overlayIcon = <FaRegStar className="overlay-icon star-icon text-sm" />;
  } else if (isDownloaded) {
    overlayIcon = <FaDownload className="overlay-icon star-icon text-sm" />;
  } else if (isLocked) {
    overlayIcon = <FaLock className="overlay-icon star-icon text-sm" />;
  } else if (isUnlocked) {
    overlayIcon = <FaLockOpen className="overlay-icon star-icon text-sm" />;
  } else if (isRename) {
    overlayIcon = <FaPencilAlt className="overlay-icon star-icon text-[10px]" />;
  } else if (isCreated) {
    overlayIcon = <FaPlusCircle className="overlay-icon star-icon text-sm" />;
  } 
  
    return (
      <div className="flex flex-col md:flex-row items-center space-x-3 ">
        {imageUrl && (
        <div className="relative">
          {/* Image container */}
          <div className="flex-shrink-0 w-[50px] h-[50px] overflow-hidden rounded-md bg-[#343434] p-2">
          <img
      src={imageUrl}
      alt={isFile ? 'File' : 'Folder'}
      className="object-cover w-full h-full"
    />
    {/* Overlay icon container */}
    <div className="absolute bottom-0 right-0 p-1 ">
      {/* Overlay icon */}
      <div className="bg-green-500 rounded-full text-black h-5 w-5 flex items-center justify-center">
        {overlayIcon}
      </div>
    </div>
    </div>
        </div>
      )}
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-white hover:underline">{formattedName}</div>
            {fileExtension && (
              <div className="rounded-md bg-black text-yellow-400 font-bold px-2 py-1 text-xs">
                {fileExtension}
              </div>
            )}
              {sensitiveTag}
              {expiringSoonTag}
          </div>
          <span className="text-gray-400">{truncatedMessage}</span>
          <div className="text-gray-300 text-xs">
            {isFolder ? 'Folder' : 'File'} • {timeAgoText} • {expiringDate}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-[black] flex justify-center items-center mt-[800px]">
      <div className="fixed top-0 left-[calc(30vw-430px)] w-[825px] z-[1001] bg-[#121212] mx-[188px] h-[97%] overflow-auto inset-0 rounded-2xl mb-3 mt-3">
      <Tooltip
        showArrow={false}
        content="Go back"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg bottom-1 right-96"
      >
        <div className='fixed inherit w-[825px] h-[60px] rounded-t-2xl'>
         <button onClick={handleBack} className="bg-[#282424] rounded-full fixed top-4 right-[1200px] mt-4 ml-[calc(50vw-412px)] text-4xl text-white z-[50]">
          <MdKeyboardArrowLeft />
        </button>
        </div>
        </Tooltip>
        <div className=" top-0 w-full p-8 bg-[#12121]">
          <h2 className="text-2xl font-bold text-center text-white m-2">Notifications</h2>
          <div className="filter-buttons flex justify-center space-x-4 my-2">
      <button onClick={() => handleFilterChange('all')} className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}>All</button>
      <button onClick={() => handleFilterChange('today')} className={`filter-btn ${currentFilter === 'today' ? 'active' : ''}`}>Today</button>
      <button onClick={() => handleFilterChange('past')} className={`filter-btn ${currentFilter === 'past' ? 'active' : ''}`}>Past</button>
      <button onClick={() => handleFilterChange('file')} className={`filter-btn ${currentFilter === 'file' ? 'active' : ''}`}>File</button>
      <button onClick={() => handleFilterChange('folder')} className={`filter-btn ${currentFilter === 'folder' ? 'active' : ''}`}>Folder</button>
    </div>
          {notifications.length > 0 ? (
          <div className="flex-grow space-y-4">
            {filteredNotifications.map(notification  =>  (
              <div key={notification.id}   className="flex justify-between items-center bg-[#282424] hover:bg-[#343434] p-2 m-5 rounded-lg notification-container z-0">
                {renderNotificationContent(notification)}
                <Tooltip
                showArrow={false}
                content="Clear"
                placement="bottom"
                className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
                >
                <button onClick={() => removeNotification(notification.id)} className="flex justify-center items-center mr-2 bg-white h-8 w-8 rounded-full text-black close-btn">

                ✖
                </button>
                </Tooltip>
              </div>
            ))}
            <div className="mt-4">
              <button onClick={clearAllNotifications} className="w-full bg-red-500 text-white p-4 rounded-lg">
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-40">
            <img src="/All_Caught_Up.png" alt="All caught up" className="w-32 h-32" /> {/* Replace with your own image */}
            <span className="text-2xl text-[#3EA88B] mt-4 font-bold">Great! You're all caught up</span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;