import React, { useState, useRef, useEffect } from 'react';
import { BsSearch, BsPerson, BsQuestionCircle, BsSun, BsCaretDownFill, BsBoxArrowRight, BsX, BsFillQuestionCircleFill, BsFolder, BsFileEarmarkCheck, BsFillPersonFill } from "react-icons/bs";
import { useAuth } from "../firebase/auth";
import { FaMicrophone, FaBell } from "react-icons/fa";
import { BiUser } from "react-icons/Bi";
import { RiPaintBrushLine } from "react-icons/Ri";
import { LuScanFace } from "react-icons/Lu";
import "../styles/Home.module.css";
import { Tooltip } from "@nextui-org/react";

const Search = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { authUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const { signOut } = useAuth();
  // State to indicate if there's a new feature/edit
  const [isNewFeature, setIsNewFeature] = useState(true); // This can be derived based on your actual data or API response


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const clearInput = () => {
    setInputValue('');
  };
  // List of avatar options
  const avatarOptions = [
    '/Default_avatar.png',
    '/Avatar_1.png',
    '/Avatar_2.png',
    //... add more avatars
  ];

  // State to track selected avatar
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || avatarOptions[0]);

  useEffect(() => {
    // Save selected avatar to local storage when it changes
    localStorage.setItem('userAvatar', selectedAvatar);
  }, [selectedAvatar]);

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

  // Close avatar dropdown when clicking outside
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

  // const getTimeOfDay = () => {
  //   const currentTime = new Date().getHours();
  //   if (currentTime >= 5 && currentTime < 12) {
  //     return 'Good Morning';
  //   } else if (currentTime >= 12 && currentTime < 17) {
  //     return 'Good Afternoon';
  //   } else {
  //     return 'Good Evening';
  //   }
  // };

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex items-center">
      {/* Search */}
      <div className="relative">
        <BsSearch className="absolute text-white left-3 top-1/2 transform -translate-y-1/2" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 py-2 w-[400px] h-[45px] rounded-3xl outline-none transition-colors bg-[#171717]"
          type="text"
          placeholder="What do you want to search?"
          style={{ fontSize: '14px' }}
        />
        {searchTerm && (
          <BsX
            onClick={clearInput}
            className="absolute text-white right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-xl"
          />
        )}
      </div>

      
      {/* Notification */}
      
      {/* <Tooltip
        showArrow={false} // Disable the default arrow
        content="Notifications"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0} // Set arrowSize to 0 to hide the arrow space
      >
        <div className="relative">
          <button
            className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-gray-600 ml-2">
            <FaBell className="text-gray-300 text-2xl" />
            <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full top-1 right-2 border-2 border-white"></div>
          </button>
        </div>
      </Tooltip> */}


      {/* What's New */}
      {/* <Tooltip
        showArrow={false} // Disable the default arrow
        content="What's New"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0} // Set arrowSize to 0 to hide the arrow space
      >
      <div className="relative ml-2" ref={newDropdownRef}>
        <button
          onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600"
        >
          <BsFillQuestionCircleFill className="text-gray-300 text-2xl" />
          {isNewFeature && <div className="absolute w-2.5 h-2.5 bg-[#1ED760] rounded-full top-1 right-2 border-2 border-white"></div>}
        </button>

        {isNewDropdownOpen && (
          <div className="absolute mt-2 w-72 bg-gray-600 text-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
              <span className="text-lg font-bold text-[#1ED760] font-Payton">What's new</span>
              <button className="text-sm text-blue-400 font-semibold font-Payton" onClick={handleClose} >Close</button>
            </div>

            {/* New Look Feature */}
            {/* <div className="px-4 py-3 flex items-start">
              <RiPaintBrushLine className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">New Look</h3>
                <p className="text-xs text-gray-300">Revamped visuals for a sleeker, more intuitive experience.</p>
              </div>
            </div>

            {/* Login with Username Feature */}
            {/* <div className="px-4 py-3 flex items-start">
              <BiUser className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">Login with Username</h3>
                <p className="text-xs text-gray-300">Simplified login process using just your unique username.</p>
              </div>
            </div>

            {/* Upload Files/Folder Feature */}
            {/* <div className="px-4 py-3 flex items-start">
              <BsFolder className="text-5xl text-[#e2e8f0] mr-2" />
              <div>
                <h3 className="font-bold text-[#e2e8f0] font-Payton">Upload Files/Folder</h3>
                <p className="text-xs text-gray-300">Easily manage and upload your files or entire folders in one go.</p>
              </div>
            </div>
          </div>

        )}
      </div>
      </Tooltip> */}
      

      {/* Profile */}
      {/* <Tooltip
        showArrow={false} // Disable the default arrow
        content="Profile"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0} // Set arrowSize to 0 to hide the arrow space
      >
      <div className="relative ml-5" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600"
        >
          <span className="text-xs text-gray-300 font-bold font-Payton">Hi, {authUser.username}</span>
          <img src={selectedAvatar} alt="Profile Avatar" className="w-10 h-10 rounded-full" />
          <BsCaretDownFill className="text-white" />
        </button>

        {isDropdownOpen && (
          <div className="absolute mt-2 w-60 bg-gray-600 text-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center">
                <img src={selectedAvatar} alt="Profile Avatar" className="w-12 h-12 rounded-full mr-3" />
                <div>
                  <span className="block text-sm font-bold">{authUser.username}<span className="text-xs bg-yellow-400 text-black px-1 rounded m-2 font-Payton">PRO</span></span>
                  <span className="text-xs text-gray-300">{authUser.email}</span>
                </div>
              </div>

              {/* Close "x" icon. Replace with your preferred icon */}
              {/* <button className='relative w-8 h-8 flex items-center justify-center rounded-full focus:outline-none hover:bg-gray-900 text-xl font-semibold left-2 bottom-3' onClick={profilehandleClose}>x</button>
            </div>
            <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]">
              <BsPerson className="text-2xl text-[#e2e8f0] mr-2" /> Profile Settings
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
            </div> */}
            {/* <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-800 rounded-full font-semibold text-gray-300 text-[13px]" onClick={signOut}>
              <BsBoxArrowRight className="text-2xl text-[#e2e8f0] mr-2" /> Sign Out
            </a>
          </div> */}
        {/* )} */}
      {/* </div>
        </Tooltip> */}
    </div>
  );
};

export default Search;


