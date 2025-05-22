import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from './WishlistContext';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function ProductGrid({ gadgets, loading }) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userId = Cookies.get('userId');
        setIsLoggedIn(!!userId);
    }, []);

    const handleWishlistToggle = async (gadget) => {
        if (!isLoggedIn) {
            toast.info('Please log in to use the wishlist feature.', {
                position: "top-center",
                toastId: 'login-to-wishlist'
            });
            return;
        }

        try {
            const userId = Cookies.get('userId');
            if (!userId) {
                throw new Error('User ID not found in cookies.');
            }

            if (isInWishlist(gadget.id)) {
                removeFromWishlist(gadget.id);
                toast.info(`${gadget.name} removed from wishlist.`, {
                    position: "top-center",
                    toastId: `wishlist-remove-${gadget.id}`
                });

                const response = await fetch(`/api/user-details/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.wishlist && Array.isArray(data.wishlist)) {
                        const updatedWishlist = data.wishlist.filter(id => id !== gadget.id);
                        await fetch(`/api/user-details/${userId}/update-wishlist`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ wishlist: updatedWishlist }),
                        });
                    }
                }
            } else {
                addToWishlist(gadget);
                toast.success(`${gadget.name} added to wishlist!`, {
                    position: "top-center",
                    toastId: `wishlist-add-${gadget.id}`
                });

                const response = await fetch(`/api/user-details/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.wishlist && Array.isArray(data.wishlist)) {
                        const updatedWishlist = [...data.wishlist, gadget.id];
                        await fetch(`/api/user-details/${userId}/update-wishlist`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ wishlist: updatedWishlist }),
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            toast.error('Failed to update wishlist. Please try again.', {
                position: "top-center",
                toastId: 'wishlist-error'
            });
        }
    };

    const getColorNames = (colors) => {
        if (!colors) return '';
        if (typeof colors === 'string') {
            try {
                colors = JSON.parse(colors);
            } catch (e) {
                return colors;
            }
        }
        if (Array.isArray(colors)) {
            return colors.map(colorObj => colorObj.color).filter(Boolean).join(', ');
        }
        return '';
    };

    const fixImgSrc = (imgSrc) => {
        if (imgSrc && imgSrc.includes('weihua/weihua nova y72/cover.png')) {
            return imgSrc.replace('weihua nova y72', 'weihua nova Y72');
        }
        return imgSrc;
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
            <h2 className="text-3xl font-extrabold mb-8 text-green-700 dark:text-green-400 tracking-tight">All Gadgets</h2>
            {loading ? (
                <div className="text-center text-lg text-gray-700 dark:text-gray-300">Loading...</div>
            ) : gadgets.length === 0 ? (
                <div className="text-center text-lg text-gray-700 dark:text-gray-300">No gadgets available at the moment.</div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {gadgets.map(gadget => {
                        const cleanPrice = typeof gadget.price === 'string'
                            ? parseFloat(gadget.price.replace(/[^0-9.]/g, ''))
                            : gadget.price;
                        const colorNames = getColorNames(gadget.colors);
                        return (
                            <li key={gadget.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6 flex flex-col hover:shadow-xl dark:hover:shadow-gray-600 transition-all duration-300 group">
                                <Link href={`/gadgets/${gadget.id}`} className="flex flex-col h-full">
                                    <div className="h-52 w-full bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={fixImgSrc(gadget.imgSrc)}
                                            alt={`${gadget.name} cover`}
                                            className="max-h-full max-w-full object-contain rounded-xl bg-white dark:bg-gray-800"
                                            style={{ display: 'block', margin: '0 auto' }}
                                            onError={(e) => {
                                                e.target.alt = 'Image not available';
                                            }}
                                        />
                                    </div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{gadget.name}</div>
                                    <div className="text-gray-500 dark:text-gray-400 capitalize text-sm mb-2">{gadget.brand}</div>
                                    {colorNames && (
                                        <div className="text-gray-600 dark:text-gray-400 text-xs mb-2 truncate">Colors: {colorNames}</div>
                                    )}
                                    <div className="text-green-700 dark:text-green-400 font-semibold text-lg mb-4">
                                        {isNaN(cleanPrice)
                                            ? 'Price unavailable'
                                            : `₱${cleanPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                    </div>
                                </Link>
                                <div className="flex justify-center gap-2 mt-4">
                                    <Link
                                        href={`/gadgets/${gadget.id}`}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-full font-semibold transition shadow"
                                        style={{ minWidth: 100, textAlign: 'center', borderRadius: '9999px' }}
                                    >
                                        View Item
                                    </Link>
                                    {isLoggedIn && (
                                        <button
                                            type="button"
                                            onClick={() => handleWishlistToggle(gadget)}
                                            className="w-10 h-10 flex items-center justify-center text-2xl transition hover:scale-125 text-red-500 dark:text-red-400 bg-white dark:bg-gray-700 rounded-full shadow"
                                            title={isInWishlist(gadget.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                            style={{ borderRadius: '9999px' }}
                                        >
                                            {isInWishlist(gadget.id) ? '❤️' : '🤍'}
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
