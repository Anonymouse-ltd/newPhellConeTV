import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Cookies from 'js-cookie';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export default function Settings() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: '',
        phone: '',
        address: '',
        avatar: '',
        birthday: '',
        is_pwd: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

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

    useEffect(() => {
        if (avatarFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(avatarFile);
        } else {
            setAvatarPreview(userDetails.avatar || '');
        }
    }, [avatarFile, userDetails.avatar]);

    const fetchUserDetails = async (id) => {
        try {
            const res = await fetch(`/api/user-details/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setUserDetails({
                        name: data.name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        avatar: data.avatar || '',
                        birthday: data.birthday || '',
                        is_pwd: data.is_pwd || false
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details.', {
                position: "top-center",
                toastId: "settings-load-error"
            });
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let avatarUrl = userDetails.avatar;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('userId', userId || '');
                formData.append('image', avatarFile);
                const uploadRes = await fetch('/api/upload-avatar', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(uploadData.error || 'Failed to upload avatar');
                }
                avatarUrl = uploadData.url;
                setUserDetails(prev => ({ ...prev, avatar: avatarUrl }));
            }

            const updateRes = await fetch(`/api/update-user-details/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userDetails,
                    avatar: avatarUrl
                }),
                credentials: 'include',
            });

            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                throw new Error(updateData.error || 'Failed to update profile');
            }

            toast.success('Profile updated successfully.', {
                position: "top-center",
                toastId: "settings-success"
            });
            router.push('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile.', {
                position: "top-center",
                toastId: "settings-error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-lg text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900">
            <Head>
                <title>Settings - Phellcone TV</title>
            </Head>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold mb-8 text-green-700 dark:text-green-400 tracking-tight">Settings</h1>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-6">Update Profile</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Avatar</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-all duration-200 flex items-center gap-2">
                                    <CameraIcon className="h-5 w-5" />
                                    Change Avatar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={userDetails.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={userDetails.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Birthday</label>
                            <input
                                type="date"
                                name="birthday"
                                value={userDetails.birthday}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Age</label>
                            <div className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 font-medium">
                                {userDetails.birthday ? calculateAge(userDetails.birthday) : 'Not set'}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Address</label>
                            <textarea
                                name="address"
                                value={userDetails.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                rows="3"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                <input
                                    type="checkbox"
                                    name="is_pwd"
                                    checked={userDetails.is_pwd}
                                    onChange={handleInputChange}
                                    className="mr-2 text-green-600 dark:text-green-400"
                                />
                                Person with Disability (PWD)
                            </label>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-4">
                            <Link href="/profile" className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-12">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
