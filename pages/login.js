import { signIn } from 'next-auth/react';
import React, { useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image'; // Import the Image component

function Login() {
    const { data: session } = useSession();
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session]);

    const handleSignup = (e) => {
        e.preventDefault();
        signIn('credentials', {
            callbackUrl: '/',
            username: credentials.username,
            email: credentials.email,
            password: credentials.password
        });
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl text-center font-semibold mb-4">Sign Up</h1>
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                        required
                        className="w-full p-2 border rounded-md bg-transparent"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                        required
                        className="w-full p-2 border rounded-md bg-transparent"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            required
                            className="w-full p-2 border rounded-md bg-transparent pr-10"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 right-2.5 cursor-pointer"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                        Signup with Email
                    </button>
                </form>
                <div>__________________or__________________</div>
                <button
                    className="mt-2 w-full bg-black text-white p-2 rounded-md hover:bg-black flex items-center justify-center"
                    onClick={() => signIn('google')}
                >
                    <Image
                        src="/google_logo.png"
                        width={24}  // Adjust the size as per your requirement
                        height={24} // Adjust the size as per your requirement
                        alt="Google Logo"
                    />
                    <span className="ml-2">Login with Google</span>
                </button>
            </div>

            {/* Google Signin Button */}
            {/* <button
                className="mt-4 bg-blue-400 p-2 rounded-xl px-3 text-white hover:bg-blue-500"
                onClick={() => signIn('google')}
            >
                Login with Google
            </button> */}
        </div>
    )
}

export default Login;
