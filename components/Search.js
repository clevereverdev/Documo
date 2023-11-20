import React, { useState, useEffect, useRef, useContext } from 'react';
import { BsFillQuestionCircleFill, BsFolder, BsBoxArrowRight, BsFillPersonFill, BsCaretDownFill, BsSun } from "react-icons/bs";
import { FaMicrophone, FaBell } from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import { RiPaintBrushLine } from "react-icons/ri";
import { MdHistory } from "react-icons/md";
import { useAuth } from "../firebase/auth";


import { LuScanFace } from "react-icons/lu";
import { Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/react";
import { useNotifications, Notification } from '../context/NotificationContext';
import { UserAvatarContext } from '../context/UserAvatarContext';
// ICONS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import RocketOutlinedIcon from '@mui/icons-material/RocketOutlined';
import Notifications from './Notifications';




const Search = ({ onSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); ``
  const dropdownRef = useRef(null);
  const { authUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const { signOut } = useAuth();
  const [isNewFeature, setIsNewFeature] = useState(true);
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isFullScreenNotificationOpen, setIsFullScreenNotificationOpen] = useState(false);


  // const [searchTerm, setSearchTerm] = useState('');
  // const handleInputChange = (e) => {
  //   const newSearchTerm = e.target.value;
  //   setSearchTerm(newSearchTerm);
  //   onSearch(newSearchTerm);
  // };

  // const clearInput = () => {
  //   setSearchTerm('');
  //   onSearch('');
  // };


  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  // Initialize search history from localStorage or set it to an empty array
  const [searchHistory, setSearchHistory] = useState(() => {
    const savedSearchHistory = localStorage.getItem('searchHistory');
    return savedSearchHistory ? JSON.parse(savedSearchHistory) : [];
  });


  const allFiles = [];


  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm) {
      // Hide the search history dropdown when the user starts typing
      setShowHistory(false);

      // Filter the files based on the search term
      const newFilteredFiles = allFiles.filter(file =>
        file.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredFiles(newFilteredFiles);
    } else {
      // Show the search history dropdown if the input is empty (user deleted the input)
      setShowHistory(true);
      setFilteredFiles([]);
    }
  };



  const handleSearch = (term, userId) => {
    // Call the onSearch callback to filter or do something with the term
    onSearch(term);

    // Update search history if the term is not already in the history
    if (term && !searchHistory.includes(term)) {
      const newSearchHistory = [term, ...searchHistory].slice(0, 5); // Keep only the last 5 entries
      setSearchHistory(newSearchHistory);
      // Save the updated search history to localStorage
      localStorage.setItem(authUser.uid + '_searchHistory', JSON.stringify(newSearchHistory));

    }
  };

  useEffect(() => {
    const savedSearchHistory = localStorage.getItem(authUser?.uid + '_searchHistory');
    setSearchHistory(savedSearchHistory ? JSON.parse(savedSearchHistory) : []);
}, [authUser?.uid]);

  // When the user submits the search (e.g., presses Enter)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearInput = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleFocus = () => {
    // Show the search history dropdown only if there is no search term
    if (!searchTerm) {
      setShowHistory(true);
    }
  };
  const handleBlur = () => {
    // Delay hiding history to allow for interaction with the history dropdown
    setTimeout(() => setShowHistory(false), 100);
  };

  // const selectFromHistory = (term) => {
  //   setSearchTerm(term);
  //   handleSearch(term);
  //   setShowHistory(false);
  // };


  const selectFromHistory = (term) => {
    if (!term) {
      // Maybe the click was on the clear button; exit early
      return;
    }
    // Proceed with selecting the term
    handleSearch(term);
    setShowHistory(false);
    setSearchTerm(term);
    // Trigger the search or whatever needs to happen when a term is selected
  };
  

  const avatarOptions = [
    '/Default_avatar.png',
    '/Avatar_1.png',
    '/Avatar_2.png',
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || avatarOptions[0]);
  useEffect(() => {
    localStorage.setItem('userAvatar', selectedAvatar);
  }, [selectedAvatar]);

  // Inside your Search component
  const { userAvatar, setUserAvatar } = useContext(UserAvatarContext);
  // Function to update the avatar both in localStorage and context
  const updateAvatar = (newAvatar) => {
    // Update the localStorage
    localStorage.setItem('userAvatar', newAvatar);

    // Update the context, which will cause any component using this context to re-render
    setUserAvatar(newAvatar);
  };
  const onAvatarInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newAvatarUrl = URL.createObjectURL(file);
      handleAvatarChange(newAvatarUrl);
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef(null);

  const handleAvatarClickOutside = (event) => {
    if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
      setIsAvatarDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleAvatarClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleAvatarClickOutside);
    };
  }, []);

  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const newDropdownRef = useRef(null);

  const handleNewClickOutside = (event) => {
    if (newDropdownRef.current && !newDropdownRef.current.contains(event.target)) {
      setIsNewDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleNewClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleNewClickOutside);
    };
  }, []);

  const handleClose = () => {
    setIsNewDropdownOpen(false);
  };

  const profilehandleClose = () => {
    setIsDropdownOpen(false);
  };

  // const clearHistoryItem = (index, event) => {
  //   event.stopPropagation(); // This should prevent any other event from being fired
  //   event.preventDefault(); // This should prevent any default behavior like form submission
  
  //   // Your existing logic for updating history
  //   const updatedHistory = searchHistory.filter((_, i) => i !== index);
  //   setSearchHistory(updatedHistory);
  //   localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  // };
  
  const clearHistoryItem = (index, event) => {
    event.stopPropagation(); // Prevents other events from being fired
    event.preventDefault(); // Prevents default behavior like form submission

    // Update the history by filtering out the selected item
    const updatedHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(updatedHistory);

    // Save the updated history to localStorage using a user-specific key
    if (authUser && authUser.uid) {
        localStorage.setItem(authUser.uid + '_searchHistory', JSON.stringify(updatedHistory));
    }
};

  
  

  return (
    <div className="flex items-center justify-between w-full px-4 relative"> {/* Adjusted to flex-col and relative */}
      {/* Search input */}
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute text-white left-3 top-1/2 transform -translate-y-1/2"
        />
        <input
          className="text-sm text-white pl-10 pr-10 py-2 w-[350px] h-[45px] rounded-3xl outline-transparent transition-all duration-300 bg-[#282424] hover:bg-[#343434] hover:outline-white hover:shadow-lg focus:outline-white focus:shadow-lg"
          type="text"
          placeholder="What do you want to search?"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

      </form>
        {searchTerm && (
          <FontAwesomeIcon
            icon={faXmark}
            onClick={clearInput}
            className="absolute text-white right-[440px] top-1/2 transform -translate-y-1/2 cursor-pointer text-xl"
          />
        )}

      {/* Search history dropdown */}
      {showHistory && (
    <div className="absolute z-[1001] w-[350px] bg-[#282424] rounded shadow-lg max-h-60 overflow-auto rounded-t-lg" style={{ top: '100%' }}>
      {searchHistory.length > 0 ? (
        searchHistory.map((term, index) => (
          <div
            key={index}
            className="group flex justify-between items-center p-2 hover:bg-[#313030] cursor-pointer text-gray-100"
            onClick={() => selectFromHistory(term)}
          >
            <div className="flex items-center">
              <MdHistory className="text-gray-400 mx-2 text-md" />
              {term}
            </div>
            <button
              className="flex justify-center items-center text-gray-400 text-sm opacity-0 group-hover:opacity-100 cursor-pointer rounded-full w-5 h-5 bg-gray-600"
              onClick={(e) => clearHistoryItem(index, e)}
            >
             ✖
            </button>
          </div>
        ))
      ) : (
        <div className="p-2 text-center text-gray-200">
          <img src="/No_recent_search.png" alt="No recent searches" className="mx-auto mb-2 w-[190px] h-[190px]" />
          No recent searches
        </div>      
        )}
    </div>
  )}

      {/* Display the filtered files */}
      {filteredFiles.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1" style={{ top: '100%' }}>
          {filteredFiles.map((file, index) => (
            <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
              {file}
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="flex items-center mr-[200px] space-x-4 ml-[10px]">
      <Tooltip
        showArrow={false}
        content="Notifications"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0}
      >
        <div className="relative">
        <button
          onClick={() => setIsFullScreenNotificationOpen(true)}
          className="flex items-center space-x-2 p-2 bg-[#282424] rounded-full focus:outline-none hover:shadow-lg hover:scale-110 relative">
          <NotificationsTwoToneIcon className="text-gray-300 text-2xl" />
      {notifications.length > 0 && notifications.length <= 9 && (
        <span className="absolute top-0 right-0 -mt--1 -mr--1 bg-[#dc2626] text-white text-xs rounded-full px-1 py--1 w-4.5 h-4.5">
          {notifications.length}
        </span>
      )}
      {notifications.length > 9 && (
        <span className="absolute top-0 right-0 -mt--1 -mr--1 bg-[#dc2626] text-white text-xs rounded-full px-1 py--1 w-4.5 h-4.5">
          9+
        </span>
      )}
          </button>
          {/* Full-Screen Notification */}
          {isFullScreenNotificationOpen && (
      <Notifications
        onClose={() => setIsFullScreenNotificationOpen(false)}
        notifications={notifications}
        removeNotification={removeNotification}
        clearAllNotifications={clearAllNotifications}
      />
    )}
          </div>

      </Tooltip>


      {/* WHAT'S NEW */}
      <div className="relative ml-10 mr-10" ref={newDropdownRef}>
        <Tooltip
          showArrow={false}
          content="What's New"
          placement="top"
          className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
          arrowSize={0}
        >
          <button
            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
            className="flex items-center space-x-2 p-2 bg-[#282424] rounded-full focus:outline-none hover:shadow-lg hover:scale-110"
          >
            <RocketOutlinedIcon className="text-gray-300 text-2xl" />
            {isNewFeature && <div className="absolute w-2.5 h-2.5 bg-[#1ED760] rounded-full top-1 right-2 border-2 border-white"></div>}
          </button>
        </Tooltip>
        {isNewDropdownOpen && (
          <div className="absolute mt-2 w-72 bg-gray-600 text-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
              <span className="text-lg font-bold text-[#1ED760] font-Payton">What's new</span>
              <button className="text-sm text-blue-400 font-semibold font-Payton" onClick={handleClose}>Close</button>
            </div>
            <div className="px-4 py-3 flex items-start">
              <RiPaintBrushLine className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">New Look</h3>
                <p className="text-xs text-gray-300">Revamped visuals for a sleeker, more intuitive experience.</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-start">
              <BiUser className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">Login with Username</h3>
                <p className="text-xs text-gray-300">Simplified login process using just your unique username.</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-start">
              <BsFolder className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">Upload Files/Folder</h3>
                <p className="text-xs text-gray-300">Easily manage and upload your files or entire folders in one go.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative ml-10 mr-10" ref={dropdownRef}>
      <Tooltip
        showArrow={false}
        content="Profile"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0}
      >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className=" w-[160px] flex items-center space-x-2 p-2 rounded-full focus:outline-none bg-[#282424] hover:shadow-lg hover:scale-105 "
          >
            <span className=" flex items-center text-[12px] text-white font-Payton"><span class="animate-waving-hand text-lg px-2">👋🏻</span> {authUser.username}</span>
            <img src={selectedAvatar} alt="Profile Avatar" className="w-8 h-8 rounded-full" />
            <BsCaretDownFill className="text-white" />
          </button>
          </Tooltip>
          {isDropdownOpen && (
            <div className="absolute mt-2 w-60 bg-gray-600 text-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center">
                  <img src={selectedAvatar} alt="Profile Avatar" className="w-12 h-12 rounded-full mr-3" />
                  <div>
                    <span className="block text-sm font-bold">{authUser.username}<span className="text-xs bg-yellow-400 text-black px-1 rounded m-2 font-Payton">PRO</span></span>
                    <span className="text-xs text-gray-300">{authUser.email}</span>
                  </div>
                <button className='relative w-8 h-8 flex items-center justify-center rounded-full focus:outline-none hover:bg-gray-900 text-xl font-semibold left-3 bottom-3 cursor-pointer' onClick={profilehandleClose}>✖</button>
                </div>
              </div>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]">
                <BsFillPersonFill className="text-2xl text-[#e2e8f0] mr-2" /> Profile Settings
              </a>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]">
                <BsSun className="text-2xl text-[#e2e8f0] mr-2" /> Light Mode
              </a>
              <div className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]" onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}>
                <LuScanFace className="text-2xl text-[#e2e8f0] mr-2" /> Change Avatar <span className="text-xs bg-[#1ED760] text-black px-1 rounded ml-10 animate-blink font-Payton">New</span>
                {isAvatarDropdownOpen && (
                  <div ref={avatarDropdownRef} className="absolute left-0 mt-2 w-48 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg">
                    {avatarOptions.map(avatar => (
                      <div key={avatar} className="flex items-center px-4 py-2 hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedAvatar(avatar)}>
                        <img src={avatar} alt="Avatar Option" className="w-8 h-8 rounded-full mr-2" />
                        <span className="text-sm">{avatar.split('/').pop().split('.')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]" onClick={signOut}>
                <BsBoxArrowRight className="text-2xl text-[#e2e8f0] mr-2" /> Sign Out
              </a>
            </div>
          )}
      </div>
      </div>
    </div>
  );
}

export default Search;


{/* NOTIFICATIONS */}
{/* <div className="flex items-center mr-[200px] space-x-4">
<Tooltip
  showArrow={false}
  content="Notifications"
  placement="top"
  className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
  arrowSize={0}
>
  <div className="relative">
    <button
      onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
      className="flex items-center space-x-2 p-2 bg-[#282424] rounded-full focus:outline-none hover:shadow-lg hover:scale-110 ml-2 relative"
    >
      <NotificationsTwoToneIcon className="text-gray-300 text-2xl" />
      {notifications.length > 0 && notifications.length <= 9 && (
        <span className="absolute top-0 right-0 -mt--1 -mr--1 bg-[#dc2626] text-white text-xs rounded-full px-1 py--1 w-4.5 h-4.5">
          {notifications.length}
        </span>
      )}
      {notifications.length > 9 && (
        <span className="absolute top-0 right-0 -mt--1 -mr--1 bg-[#dc2626] text-white text-xs rounded-full px-1 py--1 w-4.5 h-4.5">
          9+
        </span>
      )}
    </button>

    {isNotificationDropdownOpen && (
      <div className="absolute z-50 top-full right-0 mt-2 bg-gray-700 rounded-xl w-72 h-80 flex flex-col">
        <div className="flex-grow overflow-y-auto">
          {notifications.length === 0 && <div className="py-2">All caught up!</div>}
          {notifications.map(notif => (
            <div key={notif.id} className="flex items-center justify-between py-2 px-4">
              <div className="flex items-center">
                <Notification notification={notif} />
                <button onClick={() => removeNotification(notif.id)}>x</button>
              </div>
              <span className="text-gray-500 text-xs ml-2">
                {timeAgo(notif.id)}
              </span>
            </div>
          ))}
        </div>
        {notifications.length > 0 && (
          <div className='border-t border-gray-800 py-2 px-4'>
            <button onClick={clearAllNotifications}>
              Clear All
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</Tooltip> */}
