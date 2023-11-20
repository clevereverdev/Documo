import React, { useState } from 'react';
import Head from "next/head";
import { ToastContainer } from 'react-toastify';
import Toast from '../components/Toast';
import { ParentFolderIdContext } from "../context/ParentFolderIdContext";
import { ShowToastContext } from "../context/ShowToastContext";
import { NotificationProvider } from '../context/NotificationContext';
import { UserAvatarProvider } from '../context/UserAvatarContext';
import { AuthUserProvider } from "../firebase/auth"; // Adjust the path as needed
import useFirebaseAuth from "../firebase/auth"; // adjust the path as necessary
import { useAuth } from "../firebase/auth";
import '../public/styles/Payment.css'; // Reference the CSS file



// Global CSS import, if you have one
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [showToastMsg, setShowToastMsg] = useState('');
  const [parentFolderId, setParentFolderId] = useState(null);
  const { authUser } = useAuth();


  return (
    <>
      <Head>
        <title>Docomo - Web File Manager</title>
      </Head>
      <AuthUserProvider>
        <ParentFolderIdContext.Provider value={{ parentFolderId, setParentFolderId }}>
          <ShowToastContext.Provider value={{ showToastMsg, setShowToastMsg }}>
            <UserAvatarProvider userId={authUser?.uid}>
              <NotificationWrapper>
                <Component {...pageProps} />
                <ToastContainer />
                {showToastMsg && <Toast msg={showToastMsg} />}
              </NotificationWrapper>
            </UserAvatarProvider>
          </ShowToastContext.Provider>
        </ParentFolderIdContext.Provider>
      </AuthUserProvider>
    </>
  );
}

function NotificationWrapper({ children }) {
  const { authUser, isLoading } = useFirebaseAuth();

  // Handle loading state or no user state as per your app's requirements
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authUser) {
    return children; // Or redirect to login
  }

  return (
    <NotificationProvider userId={authUser.uid}>
      {children}
    </NotificationProvider>
  );
}
