import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { auth } from '../../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

function reset_password() {
    const router = useRouter();
    const [resetEmail, setResetEmail] = useState('');

    const gologin = () => {
        router.push('../Authentication/Login');
    }
    const sendResetEmail = async () => {
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast.success('Reset link sent successfully', {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });

            // Redirect to the login page
            router.push('/Authentication/login');
        } catch (error) {
            console.log('Error sending email reset link:', error);
            toast.error('Error sending reset link', {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        }
    };

    return (
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
                    <div>
                        <span className='text-white font-bold text-2xl'>Reset your password</span>
                        <p className='text-gray-400 text-sm mt-4'>Enter the email address you used to register.</p>
                    </div>
                    <form>
                        <div className="mt-6 pl-1 flex flex-col relative">
                            <div className="relative">
                                <div className="absolute left-9 p-11 top-1/2 transform -translate-y-1/2">
                                    <FaEnvelope className="text-gray-400" />
                                </div>

                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="font-medium border bg-transparent border-[#374151] pl-10 pr-2 w-3/4 py-4 rounded-md outline-0 hover:border-[#52525b] cursor-pointer"
                                    required
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-3/4 py-4 mt-7 rounded-md bg-[#1ED760] text-black font-bold p-2 transform transition-transform hover:bg-[#16a34a]"
                            onClick={sendResetEmail}>
                            Get the reset link
                        </button>
                        <button
                            type="button" // Change type to "button"
                            className="w-3/4 py-4 mt-7 rounded-md bg-transparent text-white p-2 hover:bg-[#374151]"
                            onClick={gologin}>
                            Back
                        </button>
                    </form>
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
}

export default reset_password;
