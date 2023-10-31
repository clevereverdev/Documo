import React, { useState, useRef, useEffect } from 'react';
import { BsSearch, BsBoxArrowRight, BsX, BsFillQuestionCircleFill, BsFolder, BsFileEarmarkCheck, BsFillPersonFill, BsCaretDownFill, BsSun } from "react-icons/bs";
import { FaMicrophone, FaBell } from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import { RiPaintBrushLine } from "react-icons/ri";
import { LuScanFace } from "react-icons/lu";
import { Tooltip } from "@nextui-org/react";
import { useAuth } from "../firebase/auth";

const Search = ({ onSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { authUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const { signOut } = useAuth();
  const [isNewFeature, setIsNewFeature] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
  };

  const clearInput = () => {
    setSearchTerm('');
    onSearch('');
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

  return (
    <div className="flex items-center">
      {/* Search */}
      <div className="relative">
        <BsSearch className="absolute text-white left-3 top-1/2 transform -translate-y-1/2" />
        <input
          className="pl-10 pr-10 py-2 w-[400px] h-[45px] rounded-3xl outline-none transition-colors bg-[#171717]"
          type="text"
          placeholder="What do you want to search?"
          style={{ fontSize: '14px' }}
          value={searchTerm}
          onChange={handleInputChange}
        />
        {searchTerm && (
          <BsX
            onClick={clearInput}
            className="absolute text-white right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-xl"
          />
        )}
      </div>

      {/* Notification */}
      <Tooltip
        showArrow={false}
        content="Notifications"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0}
      >
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-gray-600 ml-2">
            <FaBell className="text-gray-300 text-2xl" />
            <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full top-1 right-2 border-2 border-white"></div>
          </button>
        </div>
      </Tooltip>

      {/* What's New */}
        <div className="relative ml-2" ref={newDropdownRef}>
      <Tooltip
        showArrow={false}
        content="What's New"
        placement="top"
        className="tooltip-container bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg"
        arrowSize={0}
      >
          <button
            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full focus:outline-none hover:bg-opacity-50 hover:bg-gray-600"
          >
            <BsFillQuestionCircleFill className="text-gray-300 text-2xl" />
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
          )} */}
        {/* </div> */}
    </div>
  );
}

export default Search;
