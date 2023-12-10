import React, { useState, useEffect, useRef, useContext } from 'react';

import { BsFolder, BsBoxArrowRight, BsFillPersonFill, BsCaretDownFill, BsSun } from "react-icons/bs";
import { BiUser } from "react-icons/bi";
import { RiPaintBrushLine } from "react-icons/ri";
import { MdHistory, MdLanguage } from "react-icons/md";
import { useAuth } from "../firebase/auth";
import { LuScanFace } from "react-icons/lu";
import { Tooltip } from "@nextui-org/react";
import { useNotifications } from '../context/NotificationContext';
import { UserAvatarContext } from '../context/UserAvatarContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import RocketOutlinedIcon from '@mui/icons-material/RocketOutlined';
import Notifications from './Notifications';
import { app } from "../firebase/firebase";
import { getFirestore, doc, getDoc} from "firebase/firestore";
import { FaPaperPlane, FaBell } from "react-icons/fa6";
import { FaTimes, FaShieldAlt } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";



const Search = ({ onSearch }) => {
  const db = getFirestore(app); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); ``
  const dropdownRef = useRef(null);
  const { authUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const { signOut } = useAuth();
  const [isNewFeature, setIsNewFeature] = useState(true);
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isFullScreenNotificationOpen, setIsFullScreenNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  // Initialize search history from localStorage or set it to an empty array
  const [searchHistory, setSearchHistory] = useState(() => {
    const savedSearchHistory = localStorage.getItem('searchHistory');
    return savedSearchHistory ? JSON.parse(savedSearchHistory) : [];
  });

  const [userPlanName, setUserPlanName] = useState('Free'); // Default plan name

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (authUser?.username) {
        const userDocRef = doc(db, 'users', authUser.username);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserPlanName(userData.plan?.name || 'Free'); // Use the plan name from Firestore or default to 'Free'
          }
        } catch (error) {
          console.error("Error fetching user's plan:", error);
        }
      }
    };
  
    fetchUserPlan();
  }, [authUser, db]);


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
    '/Avatar_3.png',
    '/Avatar_4.png',
    '/Avatar_5.png',
    '/Avatar_6.png',
    '/Avatar_7.png',
    '/Avatar_8.png',
    '/Avatar_9.png',
    '/Avatar_11.png',
    '/Avatar_12.png',

  ];

  const handleAvatarSelect = (selectedAvatarUrl) => {
    // Assuming `authUser.uid` is the currently logged-in user's ID
    updateUserAvatar(authUser.uid, selectedAvatarUrl);
  };
  
  const updateUserAvatar = (userId, avatarUrl) => {
    // Firebase Firestore example
    const userRef = firestore.collection('users').doc(userId);
    userRef.update({
      avatar: avatarUrl
    }).then(() => {
      console.log("User avatar updated successfully!");
    }).catch((error) => {
      console.error("Error updating user avatar: ", error);
    });
  };
  

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

function truncateEmail(email, maxLength = 25) {
  if (email.length <= maxLength) {
      return email;
  }

  const domain = email.substring(email.lastIndexOf("@"));
  const username = email.split('@')[0];
  const availableLength = maxLength - domain.length - 3; // -3 for the ellipsis and some characters of username
  const partLength = Math.floor(availableLength / 2);
  const start = username.substring(0, partLength);
  const end = username.substring(username.length - partLength, username.length);

  return `${start}...${end}${domain}`;
}

let buttonWidth = "";

if (authUser.username.length <= 6) {
  buttonWidth = "160px";
} else if (authUser.username.length <= 10) {
  buttonWidth = "170px";
} else if (authUser.username.length <= 15){
  buttonWidth = "200px";
} else {
  buttonWidth = "300px";
}
  

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
    <div className="absolute z-[1001] w-[350px] h-[200px] bg-[#282424] rounded shadow-lg max-h-60 overflow-auto rounded-t-lg rounded-b-2xl" style={{ top: '100%' }}>
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
        <div className="p-2 text-center text-gray-200 m-3">
          <img src="/No_recent_search.png" alt="No recent searches" className="mx-auto mb-4 w-[90px] h-[90px]" />
          No recent searches
          <h3 className="text-sm text-gray-500 mt-1">All searches will be appear here</h3>
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
      <div className="relative ml-10 mr-10 z-10" ref={newDropdownRef}>
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
          <div className="absolute mt-2 w-72 bg-[#292929] text-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
              <span className="text-lg font-bold text-[#3EA88B]">What&apos;s new</span>
              <button className='absolute text-sm flex items-center justify-center top-1 right-1 hover:bg-gray-700 h-6 w-6 rounded-full' onClick={handleClose}>
                <FaTimes className="text-gray-400 cursor-pointer" />
              </button>
            </div>
            <div className="px-4 py-3 flex items-start">
              <RiPaintBrushLine className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">New Look</h3>
                <p className="text-xs text-gray-300">Revamped visuals for a sleeker, more intuitive experience.</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-start">
              <MdSecurity className="text-[80px] text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">Protect your documents</h3>
                <p className="text-xs text-gray-300">We have listened to you. Your priority is our first choice so we have implemented lock documnts feature.</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-start">
              <FaPaperPlane className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">New Plans</h3>
                <p className="text-xs text-gray-300">You need more storage new 4 plans are introduced go check it out.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative ml-10 mr-10 z-[10]" ref={dropdownRef}>
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
            style={{ width: buttonWidth }}
          >
            <span className=" flex items-center text-[12px] text-white font-Payton"><span class="animate-waving-hand text-lg px-2">👋🏻</span>{authUser.username}</span>
            <img src={selectedAvatar} alt="Profile Avatar" className="w-8 h-8 rounded-full" />
            <BsCaretDownFill className="text-white" />
          </button>
          </Tooltip>
          {isDropdownOpen && (
            <div className="absolute mt-2 w-60 bg-[#292929] text-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center">
                  <img src={selectedAvatar} alt="Profile Avatar" className="w-12 h-12 rounded-full mr-3" />
                  <div>
                    <span className="block text-sm font-bold">{authUser.username}
                    <span className="text-xs bg-yellow-400 text-black px-1 rounded m-2 font-bold">{userPlanName}</span>
                    </span>
                    <span className="text-xs text-gray-300">{truncateEmail(authUser.email)}</span>
                  </div>
                <button className='absolute text-sm flex items-center justify-center top-1 right-1 hover:bg-gray-700 h-6 w-6 rounded-full' onClick={profilehandleClose}>
                <FaTimes className="text-gray-400 cursor-pointer" />
                </button>
                </div>
              </div>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-[#393939] rounded-full font-semibold text-gray-300 text-[13px] mt-3">
                <FaPaperPlane className="text-2xl text-[#e2e8f0] mr-2" /> Plan: {userPlanName}
              </a>
              
              <div className="flex items-center px-4 py-3 hover:bg-[#393939] rounded-full font-semibold text-gray-300 text-[13px] cursor-pointer" onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}>
  <LuScanFace className="text-2xl text-[#e2e8f0] mr-2 " /> Change Avatar <span className="text-xs bg-[#3EA88B] text-black px-1 rounded ml-10 animate-blink font-Payton">New</span>
  {isAvatarDropdownOpen && (
    <div ref={avatarDropdownRef} className="flex items-center justify-center absolute right-[250px] mt-2 w-[190px] bg-[#292929] text-white border border-gray-700 rounded-lg shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {avatarOptions.map((avatar, index) => (
          <div key={index} className="flex items-center py-2 hover:scale-110 cursor-pointer" onClick={() => setSelectedAvatar(avatar)}>
            <img src={avatar} alt="Avatar Option" className="w-10 h-10 rounded-full" />
            {/* <h1 className="text-sm">{avatar.split('/').pop().split('.')[0]}</h1> */}
          </div>
        ))}
      </div>
    </div>
  )}
</div>

              <a href="#" className="flex items-center px-4 py-3 hover:bg-[#393939]  rounded-full font-semibold text-gray-300 text-[13px]">
                <MdLanguage className="text-2xl text-[#e2e8f0] mr-2" /> English (United States)
              </a>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-[#393939]  rounded-full font-semibold text-gray-300 text-[13px]" onClick={signOut}>
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