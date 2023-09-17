// index.js
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    console.log('User Session');
    if (!session) {
      router.push('/login');
    } else {
      console.log('User Session', session.user);
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.userInfo}>
          <h1>
            Welcome,{' '}
            <span className={styles.userName}>
              <strong>{session.user.name}</strong>
            </span>
            !
          </h1>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
