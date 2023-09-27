import side_navbar from "components/Sidebar";
import { AuthUserProvider } from "../firebase/auth";
import '../styles/globals.css';
import Head from "next/head";
import { ToastContainer } from 'react-toastify';


export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Docomo</title>
      </Head>
      <AuthUserProvider>
      <side_navbar/>
      <ToastContainer/>
        <Component {...pageProps} />
      </AuthUserProvider>
    </>
  );
}