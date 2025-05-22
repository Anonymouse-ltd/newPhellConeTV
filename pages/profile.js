import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Cookies from 'js-cookie';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Header from '../components/Header';

export default function Profile() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const authToken = Cookies.get('authToken');
        const storedUserId = Cookies.get('userId');
        if (!authToken || !storedUserId) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
            setUserId(storedUserId);
            fetchUserDetails(storedUserId);
            setLoading(false);
        }
    }, [router]);

    const fetchUserDetails = async (id) => {
        try {
            const res = await fetch(`/api/user-details/${id}`);
            if (res.ok) {
                const data = await res.json();
                setUserDetails(data);
            } else {
                setUserDetails({});
            }
        } catch (error) {
            setUserDetails({});
        }
    };

    const calculateAge = (birthday) => {
        if (!birthday) return 'Not set';
        const bday = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - bday.getFullYear();
        const m = today.getMonth() - bday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
            age--;
        }
        return age;
    };

    const formatBirthday = (birthday) => {
        if (!birthday) return 'Not set';
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return <div className="text-center py-10 text-lg text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900">
            <Head>
                <title>My Profile - Phellcone TV</title>
            </Head>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-5xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-extrabold mb-10 text-green-700 dark:text-green-400 tracking-tight text-center">My Profile</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <section className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center p-8">
                        <div className="w-28 h-28 mb-4 rounded-full border-4 border-green-100 dark:border-green-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {userDetails && userDetails.avatar ? (
                                <img
                                    src={userDetails.avatar}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <div className="text-center mb-6">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{userDetails?.name || 'Not set'}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{userDetails?.email || 'Not available'}</div>
                        </div>
                        <div className="w-full text-center">
                            <Link href="/settings" className="inline-block w-full bg-green-600 dark:bg-green-700 text-white font-semibold rounded-lg py-2 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200">
                                Edit Profile
                            </Link>
                        </div>
                    </section>
                    <section className="col-span-2 flex flex-col gap-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
                                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">Phone</span>
                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">{userDetails?.phone || 'Not set'}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
                                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">Address</span>
                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">{userDetails?.address || 'Not set'}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
                                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">Birthday</span>
                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">{userDetails?.birthday ? formatBirthday(userDetails.birthday) : 'Not set'}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
                                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">Age</span>
                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">{userDetails?.birthday ? calculateAge(userDetails.birthday) : 'Not set'}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
                                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">PWD Status</span>
                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">{userDetails?.is_pwd ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link href="/wishlist" className="bg-green-50 dark:bg-green-900 rounded-xl shadow flex flex-col items-center py-5 hover:bg-green-100 dark:hover:bg-green-800 transition">
                                <svg className="w-7 h-7 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                                <span className="font-semibold text-green-700 dark:text-green-400 text-sm">Wishlist</span>
                            </Link>
                            <Link href="/cart" className="bg-green-50 dark:bg-green-900 rounded-xl shadow flex flex-col items-center py-5 hover:bg-green-100 dark:hover:bg-green-800 transition">
                                <svg className="w-7 h-7 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-2.3L17 13M7 13V6a1 1 0 011-1h3m4 0h2a1 1 0 011 1v7" />
                                </svg>
                                <span className="font-semibold text-green-700 dark:text-green-400 text-sm">Cart</span>
                            </Link>
                            <Link href="/settings" className="bg-green-50 dark:bg-green-900 rounded-xl shadow flex flex-col items-center py-5 hover:bg-green-100 dark:hover:bg-green-800 transition">
                                <svg className="w-7 h-7 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="font-semibold text-green-700 dark:text-green-400 text-sm">Settings</span>
                            </Link>
                            <Link href="/purchase" className="bg-green-50 dark:bg-green-900 rounded-xl shadow flex flex-col items-center py-5 hover:bg-green-100 dark:hover:bg-green-800 transition">
                                <svg className="w-7 h-7 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-green-700 dark:text-green-400 text-sm">Purchases</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
