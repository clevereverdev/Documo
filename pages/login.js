import { signIn, } from 'next-auth/react'
import React from "react";
import { useSession } from 'next-auth/react'
import { useEffect } from 'react';
import { useRouter } from 'next/router';
function login() {
    const { data: session } = useSession();
    const router = useRouter();
    useEffect(() => {
        console.log('User Session');
        if (session) {
            router.push('/');
        }
    }, [session]);
    return (
        <div className='flex justify-center 
    items-center mt-[25%]'>
            {/* <Image src='/logo.png'
                alt='logo'
                width={200}
                height={100}
            /> */}
            <button
                className=' bg-blue-400 p-2 rounded-xl px-3 text-white'
                onClick={() => signIn()}>
                {/* <Image src='/google.png'
                    alt='google'
                    width={300}
                    height={300}
                /> */}
                Login with Google
            </button>
        </div>
    )
}
export default login