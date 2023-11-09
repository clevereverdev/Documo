// UserAvatarContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserAvatarContext = createContext({
    userAvatar: '/default-avatar.png',
    setUserAvatar: () => {},
  });
  
  export const UserAvatarProvider = ({ children }) => {
    const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
  
    // Effect for initial load or refresh
    useEffect(() => {
      // This will now only run on the client-side
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) {
        setUserAvatar(storedAvatar);
      }
    }, []);
  
    return (
      <UserAvatarContext.Provider value={{ userAvatar, setUserAvatar }}>
        {children}
      </UserAvatarContext.Provider>
    );
  };
