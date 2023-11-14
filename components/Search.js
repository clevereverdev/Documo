import React, { useState, useEffect, useRef, useContext } from 'react';
import { BsFillQuestionCircleFill, BsFolder, BsBoxArrowRight, BsFillPersonFill, BsCaretDownFill, BsSun } from "react-icons/bs";
import { FaMicrophone, FaBell } from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import { RiPaintBrushLine } from "react-icons/ri";
import { LuScanFace } from "react-icons/lu";
import { Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/react";
import { useAuth } from "../firebase/auth";
import { useNotifications, Notification } from '../context/NotificationContext';
import { UserAvatarContext } from '../context/UserAvatarContext';
// ICONS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import RocketOutlinedIcon from '@mui/icons-material/RocketOutlined';



const Search = ({ onSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); ``
  const dropdownRef = useRef(null);
  const { authUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const { signOut } = useAuth();
  const [isNewFeature, setIsNewFeature] = useState(true);
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();

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



  const handleSearch = (term) => {
    // Call the onSearch callback to filter or do something with the term
    onSearch(term);

    // Update search history if the term is not already in the history
    if (term && !searchHistory.includes(term)) {
      const newSearchHistory = [term, ...searchHistory].slice(0, 5); // Keep only the last 5 entries
      setSearchHistory(newSearchHistory);
      // Save the updated search history to localStorage
      localStorage.setItem('searchHistory', JSON.stringify(newSearchHistory));
    }
  };


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

  const selectFromHistory = (term) => {
    setSearchTerm(term);
    handleSearch(term);
    setShowHistory(false);
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

  const timeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hrs ago`;
    if (minutes > 0) return `${minutes} mins ago`;
    if (seconds > 0) return `${seconds} secs ago`;
    return "just now";
  }

  return (
    <div className="flex flex-col items-center relative"> {/* Adjusted to flex-col and relative */}
      {/* Search input */}
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute text-white left-3 top-1/2 transform -translate-y-1/2"
        />
        <input
          className="pl-10 pr-10 py-2 w-[400px] h-[45px] rounded-3xl outline-none transition-colors bg-[#171717]"
          type="text"
          placeholder="What do you want to search?"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchTerm && (
          <FontAwesomeIcon
            icon={faXmark}
            onClick={clearInput}
            className="absolute text-white right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-xl"
          />
        )}
      </form>

      {/* Search history dropdown */}
      {showHistory && (
        <div className="absolute z-10 w-[400px] bg-white border rounded shadow-lg max-h-60 overflow-auto" style={{ top: '100%' }}>
          {searchHistory.length > 0 ? (
            searchHistory.map((term, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => selectFromHistory(term)} // Use onMouseDown instead of onClick to fire before onBlur
              >
                {term}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No recent searches</div>
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
      {/* <Dropdown>
        <DropdownTrigger>
          <button
            className="flex items-center space-x-2 p-2 bg-[#171717] rounded-full focus:outline-none hover:shadow-lg hover:scale-110 ml-2 relative">

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
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          aria-label="Dropdown menu with description"
          className="bg-gray-700 rounded-xl w-72 h-80 flex flex-col"
        >
          <DropdownSection className="flex-grow overflow-y-auto">
            {notifications.length === 0 && <DropdownItem>All caught up!</DropdownItem>}
            {notifications.map(notif => (
              <DropdownItem key={notif.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Notification notification={notif} />
                  <button onClick={() => removeNotification(notif.id)}>x</button>
                </div>
                <span className="text-gray-500 text-xs ml-2">
                  {timeAgo(notif.id)}
                </span>
              </DropdownItem>
            ))}
          </DropdownSection>
          {notifications.length > 0 && (
            <DropdownSection className='border-t border-gray-800'>
              <DropdownItem onClick={clearAllNotifications}>
                Clear All
              </DropdownItem>
            </DropdownSection>
          )}
        </DropdownMenu>
      </Dropdown> */}


      {/* WHAT'S NEW */}
      {/* <div className="relative ml-2" ref={newDropdownRef}>
        <Tooltip
          showArrow={false}
          content="What's New"
          placement="top"
          className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
          arrowSize={0}
        >
          <button
            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
            className="flex items-center space-x-2 p-2 bg-[#171717] rounded-full focus:outline-none hover:shadow-lg hover:scale-110"
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
      </div> */}

      {/* Profile */}
      {/* <div className="relative ml-5" ref={dropdownRef}>
      <Tooltip
        showArrow={false}
        content="Profile"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0}
      >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600"
          >
            <span className="text-xs text-gray-300 font-bold font-Payton">Hi, {authUser.username}</span>
            <img src={selectedAvatar} alt="Profile Avatar" className="w-10 h-10 rounded-full" />
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
      </div> */}
    </div>
  );
}

export default Search;
