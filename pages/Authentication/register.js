import "../../styles/Home.module.css";
import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../firebase/firebase";
import {
    createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup,
} from "firebase/auth";
import { useAuth } from "../../firebase/auth";
import { useRouter } from "next/router";
import Loader from "../../components/loader";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUserAlt } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css'; // CSS import
import { toast } from "react-toastify";
import { getDoc, doc, setDoc, getFirestore } from "firebase/firestore";

const provider = new GoogleAuthProvider();
const db = getFirestore();

const RegisterForm = () => {
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { authUser, isLoading, setAuthUser } = useAuth();
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && authUser) {
            router.push("/");
        }
    }, [authUser, isLoading]);
    // Initialize Firestore

    const sendEmailNotification = async (emailDetails) => {
        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailDetails),
          });
          const data = await response.json();
          console.log(data.message);
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
    const signupHandler = async () => {
        if (!email || !username || !password) return;

        try {
            // Check if the username already exists in Firestore
            const usernameDocRef = doc(db, "users", username);
            const usernameDoc = await getDoc(usernameDocRef);

            if (usernameDoc.exists()) {
                // Username is already taken
                toast.error('The username is already in use by another account', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }

            // If the username does not exist, proceed to create a user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update the user's display name with the username
            await updateProfile(userCredential.user, { displayName: username });

            // Store the username and email in Firestore
            await setDoc(doc(db, "users", username), {
                email,
            });

            // Update the auth user in the context
            setAuthUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                username,
            });

            // Show success toast
            toast.success('Successfully Signed Up', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            // Redirect or perform some other actions

            // Send welcome email
            const welcomeEmailDetails = {
            to: email,
            subject: 'Welcome to Docomo!',
            text: `Welcome "${username}", Thank you for registering with us. We are excited to have you on board and look forward to helping you manage your digital life effectively`
            };

        await sendEmailNotification(welcomeEmailDetails);

        } catch (error) {
            console.error("Error during signup:", error);

            let errorMessage = 'An error occurred during signup';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'The email address is already in use by another account';
            }
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
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

    const goLogin = () => {
        router.push("../Authentication/Login");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return isLoading || (!isLoading && authUser) ? (
        <Loader />
    ) : (
        <main className="flex lg:h-[100vh]">
            <div className="w-full lg:w-[60%] p-8 md:p-14 flex items-center justify-center lg:justify-start">
                <div className="p-8 w-[600px] text-center">
                    <div className="flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Your Alt Text"
                            className="h-20 w-20" />
                        <h1 className="text-7xl font-extrabold relative m-3">
                            <span className="text-7xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton">D</span>
                            <span className="text-3xl bg-gray-300 inline-block text-transparent bg-clip-text font-Payton">ocomo</span>
                            <span className="absolute top-10 text-xs">©</span>
                        </h1>
                    </div>
                    <p className="text-center mt-4 text-gray-600">
                        <div className="text-white font-bold text-xl">
                            Take Control of your
                        </div>{" "}
                        <div className="text-white font-bold text-xl">
                            Digital Life!
                        </div>
                        <div className="text-gray-400 text-sm">
                            Access your files
                        </div>
                        <div className="text-gray-400 text-sm">
                            Anywhere, Anytime on the Go
                        </div>
                    </p>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mt-5 pl-1 flex flex-col relative">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaUserAlt className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b] cursor-pointer"
                                    required
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-5 pl-1 flex flex-col relative">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b] cursor-pointer"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-5 pl-1 flex flex-col">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b] cursor-pointer"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="absolute right-9 p-11 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="text-gray-400" />
                                    ) : (
                                        <FaEye className="text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                className="w-3/4 py-4 mt-7 rounded-md bg-[#1ED760] text-black font-bold p-2 transform transition-transform hover:bg-[#16a34a]"
                                onClick={signupHandler}
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center mt-7 w-3/4 mx-auto">
                        <hr className="flex-grow border-t border-[#525254]" />
                        <span className="mx-4 text-gray-500 text-sm"> OR </span>
                        <hr className="flex-grow border-t border-[#525254]" />
                    </div>
                    <div className="flex justify-center">
                        <button
                            className="w-3/4 bg-white py-4 mt-7 rounded-md active:scale-90 flex justify-center items-center gap-4 cursor-pointer hover:bg-[#cbd5e1]"
                            onClick={signInWithGoogle}
                        >
                            <FcGoogle size={22} />
                            <span className="font-medium text-black">
                                Continue with Google
                            </span>
                        </button>
                    </div>

                    <p className="mt-7 ml-1 text-sm text-center">
                        Already have an account?{" "}
                        <span
                            className="font-bold text-[#1ED760] hover:text-[#16a34a] cursor-pointer"
                            onClick={goLogin}
                        >
                            Login
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

export default RegisterForm;
