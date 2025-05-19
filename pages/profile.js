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
    const [activeTab, setActiveTab] = useState('profile');

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
        const age = today.getFullYear() - bday.getFullYear();
        const monthDiff = today.getMonth() - bday.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bday.getDate())) {
            return age - 1;
        }
        return age;
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
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold mb-8 text-green-700 dark:text-green-400 tracking-tight">My Profile</h1>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                        <div className="flex flex-col items-center mb-6">
                            {userDetails && userDetails.avatar ? (
                                <img
                                    src={userDetails.avatar}
                                    alt="User Avatar"
                                    className="w-24 h-24 rounded-full object-cover mb-2"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                                    <UserIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'transactions' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Transactions
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'wishlist' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Wishlist
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'favorites' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Favorites
                            </button>
                            <button
                                onClick={() => setActiveTab('cart')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'cart' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Cart
                            </button>
                            <Link
                                href="/settings"
                                className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Settings
                            </Link>
                        </div>
                    </div>
                    <div className="w-full md:w-3/4 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                        {activeTab === 'profile' && (
                            <div>
                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">Profile Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? userDetails.email || 'Not available' : 'Loading...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Name</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? userDetails.name || 'Not set' : 'Loading...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? userDetails.phone || 'Not set' : 'Loading...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? userDetails.address || 'Not set' : 'Loading...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Birthday</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? userDetails.birthday || 'Not set' : 'Loading...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Age</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails && userDetails.birthday ? calculateAge(userDetails.birthday) : 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">PWD Status</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{userDetails ? (userDetails.is_pwd ? 'Yes' : 'No') : 'Loading...'}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link href="/settings" className="inline-block bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200">
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        )}
                        {activeTab === 'transactions' && (
                            <div>
                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">Transactions</h3>
                                <p className="text-gray-500 dark:text-gray-400 italic">No transactions found.</p>
                                <div className="mt-6 text-center py-4 text-gray-700 dark:text-gray-300">Your transaction history will appear here.</div>
                            </div>
                        )}
                        {activeTab === 'wishlist' && (
                            <div>
                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">Wishlist</h3>
                                <p className="text-gray-500 dark:text-gray-400 italic">Your wishlist is empty.</p>
                                <div className="mt-6 text-center py-4 text-gray-700 dark:text-gray-300">Add items to your wishlist to see them here.</div>
                            </div>
                        )}
                        {activeTab === 'favorites' && (
                            <div>
                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">Favorites</h3>
                                <p className="text-gray-500 dark:text-gray-400 italic">You have no favorite items.</p>
                                <div className="mt-6 text-center py-4 text-gray-700 dark:text-gray-300">Mark items as favorites to see them here.</div>
                            </div>
                        )}
                        {activeTab === 'cart' && (
                            <div>
                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">Cart</h3>
                                <p className="text-gray-500 dark:text-gray-400 italic">Your cart is empty.</p>
                                <div className="mt-6 text-center py-4 text-gray-700 dark:text-gray-300">Add items to your cart to see them here.</div>
                                <div className="mt-4 flex justify-center">
                                    <Link href="/" className="inline-block bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200">
                                        Shop Now
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
