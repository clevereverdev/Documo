import styles from "../styles/Home.module.css";
import { GoSignOut } from "react-icons/go";
import { useEffect } from "react";
import { useAuth } from "../firebase/auth";
import { useRouter } from "next/router";
import Loader from "../components/loader";

export default function Home() {
    const { authUser, isLoading, signOut } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("Authentication/login");
        }
    }, [authUser, isLoading]);

    return !authUser ? (
        <Loader />
    ) : (
        <div className={styles.container}>
            <div className="flex items-center justify-between gap-2 font-medium shadow-md fixed top-7 right-60">
                <h1>
                    Welcome,{" "}
                    <strong className="text-green-600">{authUser.username}</strong>!
                </h1>
                <div
                    className="bg-black text-white w-44 py-4 rounded-lg transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed top-2 right-5 cursor-pointer"
                    onClick={signOut}>
                    <GoSignOut size={18} />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
}
