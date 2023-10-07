import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/auth";
import { useRouter } from "next/router";
import Loader from "../components/loader";
import Layout from "@/Sidebar";

export default function Home() {
    const { authUser, isLoading } = useAuth();
    const [showSideNavbar, setShowSideNavbar] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("Authentication/login");
        } else if (!isLoading && authUser) {
            setShowSideNavbar(true);
        }
    }, [authUser, isLoading, router]);

    return !authUser ? (
        <Loader />
    ) : (
        <Layout>
            <div className={styles.container}>
                <div className="flex items-center justify-between gap-2 font-medium shadow-md fixed top-7 right-60">
                    <h1>
                        Welcome,{" "}
                        <strong className="text-green-600">{authUser.username}</strong>!
                    </h1>
                </div>
            </div>
        </Layout>
    );
}

