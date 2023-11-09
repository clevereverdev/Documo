import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationSound, setNotificationSound] = useState(null);

    useEffect(() => {
      const sound = new Audio('/Notifications.mp3');
      setNotificationSound(sound);
  }, []);

    useEffect(() => {
        const storedNotifications = JSON.parse(window.localStorage.getItem('notifications')) || [];
        setNotifications(storedNotifications);
      }, []);

      const addNotification = (type, data) => {
        console.log('Adding notification:', type, data); // Debug log
        const newNotification = { id: Date.now(), type, data };
        const existingNotification = notifications.find(n => n.data.message === newNotification.data.message);
    
        // If the same notification doesn't already exist, add it
        if (!existingNotification) {
            const updatedNotifications = [...notifications, newNotification];
            setNotifications(updatedNotifications);
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
            if (notificationSound) {
              notificationSound.play();
          }
        }
    };
      
      

  const removeNotification = (id) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

function Notification({ notification }) {
// Use optional chaining and provide a default message if undefined
const message = notification.data?.message ?? "Default message";
const truncatedMessage = message.slice(0, 25) + (message.length > 25 ? "..." : "");
const imageUrl = notification.data?.src; 


    if (notification.type === 'image') {
        return (
            <div className="flex items-center space-x-2">
                <img src={notification.data.src} alt="Notification Image" width={35} height={35} />
                <span>{truncatedMessage}</span>
            </div>
        );
    } else {
        // handle other types or default message display
        return (
          <div className="notification">
          {imageUrl && (
            <img src={imageUrl} alt="Document" style={{ width: '50px', height: '50px' }} />
          )}
          <span>{truncatedMessage}</span>
        </div>
        );
    }
}



export { NotificationProvider, useNotifications, Notification};


