import React from "react";
import "../../styles/Home.module.css";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "../../firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "../../components/loader";
import { FaEnvelope, FaLock } from "react-icons/fa";
const provider = new GoogleAuthProvider();
const LoginForm = () => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const { authUser, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && authUser) {
            router.push("/");
        }
    }, [authUser, isLoading]);

    const loginHandler = async () => {
        if (!email || !password) return;
        try {
            const user = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log(user);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };
    const signInWithGoogle = async () => {
        try {
            const user = await signInWithPopup(auth, provider);
            console.log(user);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    const goSignUp = () => {
        router.push("../Authentication/register");
    };

    return isLoading || (!isLoading && authUser) ? (
        <Loader />
    ) : (
        <main className="flex lg:h-[100vh]">
            <div className="w-full lg:w-[60%] p-8 md:p-14 flex items-center justify-center lg:justify-start">
                <div className="p-8 w-[600px] text-center">
                    <div className="mb-6 text-center">
                        <img
                            src="/logo.png"
                            alt="Your Alt Text"
                            className="h-20 w-20 mx-auto" />
                        <h1 className="text-5xl font-semibold text-[#2563eb]">
                            Documo
                        </h1>
                    </div>

                    <p className="text-center mt-4 text-gray-600">
                        <div className="text-white font-bold text-xl">
                            Hi there, good to see
                        </div>{" "}
                        <div className="text-white font-bold text-xl">
                            you back!
                        </div>
                        <div className="text-gray-400 text-sm">
                            Log in to your account and start
                        </div>
                        <div className="text-gray-400 text-sm">
                            managing your digital life.
                        </div>
                    </p>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mt-5 pl-1 flex flex-col relative">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaEnvelope className="text-gray-400" />
                                </div>

                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b]"
                                    required
                                    onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-5 pl-1 flex flex-col">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b]"
                                    required
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }/>
                            </div>
                        </div>
                        <div className="mt-7">
                            <span className="text-[#2563eb] font-bold text-sm cursor-pointer hover:text-blue-400">
                                Forgot your password?
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="w-3/4 py-4 mt-7 rounded-md bg-[#60a5fa] text-white p-2 hover:bg-[#3b82f6]"
                            onClick={loginHandler}>
                            Log in
                        </button>
                    </form>
                    <div className="flex items-center mt-7 w-3/4 mx-auto">
                        <hr className="flex-grow border-t border-[#525254]" />
                        <span className="mx-4 text-gray-500 text-sm"> OR </span>
                        <hr className="flex-grow border-t border-[#525254]" />
                    </div>
                    <div className="flex justify-center">
                        <button
                            className="w-3/4 bg-white py-4 mt-7 rounded-md active:scale-90 flex justify-center items-center gap-4 cursor-pointer hover:bg-[#cbd5e1]"
                            onClick={signInWithGoogle}>
                            <FcGoogle size={22} />
                            <span className="font-medium text-black">
                                Continue with Google
                            </span>
                        </button>
                    </div>
                    <p className="mt-7 ml-1 text-sm">
                        Don't have an account?{" "}
                        <span
                            className="font-bold text-[#2563eb] hover:text-blue-400 cursor-pointer"
                            onClick={goSignUp}>
                            Get Started
                        </span>
                    </p>
                </div>
            </div>
            <div className="w-[40%] hidden lg:block">
                <img
                    src="/bg_auth.jpeg"
                    alt="Background"
                    className="object-cover w-full h-full rounded-l-full"
                />
            </div>
        </main>
    );
};

export default LoginForm;
