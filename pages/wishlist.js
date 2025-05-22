import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { useTheme } from '../components/ThemeContext';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export default function Wishlist() {
    const [hasMounted, setHasMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        setHasMounted(true);
        const userId = Cookies.get('userId');
        setIsLoggedIn(!!userId);
    }, []);

    useEffect(() => {
        if (hasMounted && isLoggedIn) {
            const fetchUserWishlist = async () => {
                try {
                    setLoading(true);
                    const userId = Cookies.get('userId');
                    if (!userId) {
                        throw new Error('User ID not found in cookies.');
                    }

                    const response = await fetch(`/api/user-details/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch user details.');
                    }

                    const data = await response.json();
                    if (data && data.wishlist && Array.isArray(data.wishlist)) {
                        setWishlistIds(data.wishlist);
                    } else {
                        setWishlistIds([]);
                    }
                } catch (error) {
                    console.error('Error fetching user wishlist:', error);
                    setWishlistIds([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserWishlist();
        }
    }, [hasMounted, isLoggedIn]);

    useEffect(() => {
        if (hasMounted && wishlistIds.length > 0) {
            const fetchWishlistItems = async () => {
                try {
                    setLoading(true);
                    const items = [];
                    for (const id of wishlistIds) {
                        try {
                            const response = await fetch(`/api/gadget-details/${id}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.ok) {
                                const gadget = await response.json();
                                if (gadget) {
                                    items.push(gadget);
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching gadget with ID ${id}:`, error);
                        }
                    }
                    setWishlistItems(items);
                } catch (error) {
                    console.error('Error fetching wishlist items:', error);
                    setWishlistItems([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchWishlistItems();
        } else if (hasMounted) {
            setWishlistItems([]);
            setLoading(false);
        }
    }, [hasMounted, wishlistIds]);

    useEffect(() => {
        if (hasMounted && wishlistItems.length > 0) {
            const fetchImages = async () => {
                const imagesData = {};
                for (const item of wishlistItems) {
                    try {
                        const response = await fetch(`/api/get-images?brand=${encodeURIComponent(item.brand)}&gadgetName=${encodeURIComponent(item.name)}`);
                        if (response.ok) {
                            const data = await response.json();
                            imagesData[`${item.brand}-${item.name}`] = data;
                        } else {
                            imagesData[`${item.brand}-${item.name}`] = { coverImage: '/placeholder-image.jpg' };
                        }
                    } catch (error) {
                        console.error(`Error fetching image for ${item.brand}/${item.name}:`, error);
                        imagesData[`${item.brand}-${item.name}`] = { coverImage: '/placeholder-image.jpg' };
                    }
                }
                setImages(imagesData);
            };

            fetchImages();
        }
    }, [hasMounted, wishlistItems]);

    const getCoverImage = (brand, name) => {
        const key = `${brand}-${name}`;
        return images[key] ? images[key].coverImage : '/placeholder-image.jpg';
    };

    const handleRemoveFromWishlist = async (id) => {
        try {
            const userId = Cookies.get('userId');
            if (!userId) {
                throw new Error('User ID not found in cookies.');
            }
            const updatedWishlist = wishlistIds.filter(wishlistId => wishlistId !== id);
            const response = await fetch(`/api/user-details/${userId}/update-wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ wishlist: updatedWishlist }),
            });

            if (!response.ok) {
                throw new Error('Failed to update wishlist in database.');
            }

            setWishlistIds(updatedWishlist);
            setWishlistItems(wishlistItems.filter(item => item.id !== id));
            toast.success('Item removed from wishlist.', {
                position: "top-center",
                toastId: `wishlist-remove-${id}`
            });
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            toast.error('Failed to remove item from wishlist. Please try again.', {
                position: "top-center",
                toastId: 'wishlist-remove-error'
            });
        }
    };

    return (
        <div className={`flex flex-col min-h-screen ${hasMounted ? (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50') : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <div className={`flex items-center text-sm ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} mb-4`}>
                    <Link href="/" className={`hover:${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <span className={`font-medium ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Wishlist</span>
                </div>
                <h1 className={`text-2xl font-bold mb-6 ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Your Wishlist</h1>
                {hasMounted ? (
                    !isLoggedIn ? (
                        <div className={`text-center ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-700') : 'text-gray-700'}`}>
                            <p>Please log in to view your wishlist.</p>
                            <Link href="/login" className={`mt-4 inline-block ${hasMounted ? (theme === 'dark' ? 'text-green-400 underline hover:text-green-300' : 'text-green-700 underline hover:text-green-900') : 'text-green-700 underline hover:text-green-900'}`}>Log In</Link>
                        </div>
                    ) : loading ? (
                        <div className={`text-center py-10 text-lg ${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'}`}>Loading...</div>
                    ) : wishlistItems.length === 0 ? (
                        <div className={`text-center ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-700') : 'text-gray-700'}`}>
                            <p>Your wishlist is empty.</p>
                            <Link href="/" className={`mt-4 inline-block ${hasMounted ? (theme === 'dark' ? 'text-green-400 underline hover:text-green-300' : 'text-green-700 underline hover:text-green-900') : 'text-green-700 underline hover:text-green-900'}`}>Back to Home</Link>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {wishlistItems.map((item) => (
                                <li key={item.id} className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} rounded-2xl shadow-md p-6 flex flex-col hover:shadow-xl transition-all duration-300 group`}>
                                    <Link href={`/gadgets/${item.id}`} className="flex flex-col h-full">
                                        <div className={`h-52 w-full ${hasMounted ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100') : 'bg-gray-100'} rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                                            <img
                                                src={getCoverImage(item.brand, item.name)}
                                                alt={`${item.name} cover`}
                                                className="max-h-full max-w-full object-contain rounded-xl"
                                                onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                            />
                                        </div>
                                        <div className={`font-bold text-lg truncate ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>{item.name}</div>
                                        <div className={`capitalize text-sm mb-2 ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'}`}>{item.brand}</div>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        className={`mt-auto transition-all duration-200 text-lg font-semibold ${hasMounted ? (theme === 'dark' ? 'text-red-400 hover:text-red-600' : 'text-red-500 hover:text-red-700') : 'text-red-500 hover:text-red-700'}`}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <div className={`text-center py-10 text-lg ${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'}`}>Loading...</div>
                )}
            </main>
            <footer className={`p-6 text-center text-sm ${hasMounted ? (theme === 'dark' ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-900') : 'text-gray-500 bg-gray-900'} mt-auto`}>
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
