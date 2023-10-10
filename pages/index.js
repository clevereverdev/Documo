import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/auth";
import { useRouter } from "next/router";
import Loader from "../components/loader";
import Layout from "@/Sidebar";
import SearchBar from "@/Search";

export default function Home() {
    const { authUser, isLoading } = useAuth();
    const [showSideNavbar, setShowSideNavbar] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("Authentication/Login");
        } else if (!isLoading && authUser) {
            setShowSideNavbar(true);
        }
    }, [authUser, isLoading, router]);
    
    return !authUser ? (
        <Loader />
    ) : (
        <Layout>
            <div className={styles.container}>
                <div className={styles.home}>
                    <SearchBar/>
                </div>
                <div className={styles.storage}
                style={{ 
                    backgroundColor: '#c026d3', 
                    padding: '10px', 
                    borderRadius: '5px' 
                }}>
                    <h1 className='text-md mb-5 font-bold'>Storage</h1>
                </div>
            </div>
        </Layout>
    );
}

