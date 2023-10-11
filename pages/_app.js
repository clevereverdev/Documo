import React, { useState } from "react";
import { AuthUserProvider } from "../firebase/auth";
import '../styles/globals.css';
import Head from "next/head";
import { ToastContainer } from 'react-toastify';
import Toast from '../components/Toast';
import { ShowToastContext } from 'context/ShowToastContext';
import { ParentFolderIdContext } from "context/ParentFolderIdContext";

export default function App({ Component, pageProps }) {
  const [showToastMsg, setShowToastMsg] = useState();
  const [parentFolderId, setParentFolderId] = useState();

  return (
    <>
      <Head>
        <title>Docomo</title>
      </Head>
      <AuthUserProvider>
        <ParentFolderIdContext.Provider value={{parentFolderId, setParentFolderId}}>
          <ShowToastContext.Provider value={{ showToastMsg, setShowToastMsg }}>
            <ToastContainer />
            <Component {...pageProps} />
            {showToastMsg ? <Toast msg={showToastMsg} /> : null}
          </ShowToastContext.Provider>
        </ParentFolderIdContext.Provider>
      </AuthUserProvider>
    </>
  );
}
