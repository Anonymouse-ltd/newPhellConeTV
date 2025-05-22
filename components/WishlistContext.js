import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = Cookies.get('userId');
        setIsLoggedIn(!!userId);
        if (userId) {
            fetchWishlistFromDatabase(userId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWishlistFromDatabase = async (userId) => {
        try {
            setLoading(true);
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
                // Fetch full gadget details for each ID
                const items = [];
                for (const id of data.wishlist) {
                    try {
                        const gadgetResponse = await fetch(`/api/gadget-details/${id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (gadgetResponse.ok) {
                            const gadget = await gadgetResponse.json();
                            if (gadget) {
                                items.push(gadget);
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching gadget with ID ${id}:`, error);
                    }
                }
                setWishlistItems(items);
            } else {
                setWishlistItems([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist from database:', error);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const updateWishlistInDatabase = async (updatedWishlistIds, userId) => {
        try {
            const response = await fetch(`/api/update-wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ userId, wishlist: updatedWishlistIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to update wishlist in database.');
            }
            return true;
        } catch (error) {
            console.error('Error updating wishlist in database:', error);
            toast.error('Failed to update wishlist. Please try again.', {
                position: "top-center",
                toastId: 'wishlist-update-error'
            });
            return false;
        }
    };

    const addToWishlist = async (gadget) => {
        if (!isLoggedIn) {
            toast.info('Please log in to use the wishlist feature.', {
                position: "top-center",
                toastId: 'login-to-wishlist'
            });
            return false;
        }

        setWishlistItems((prev) => {
            if (prev.find(item => item.id === gadget.id)) {
                return prev;
            }
            const updatedItems = [...prev, gadget];
            const updatedIds = updatedItems.map(item => item.id);
            updateWishlistInDatabase(updatedIds, Cookies.get('userId'));
            return updatedItems;
        });
        toast.success(`${gadget.name} added to wishlist!`, {
            position: "top-center",
            toastId: `wishlist-add-${gadget.id}`
        });
        return true;
    };

    const removeFromWishlist = async (id) => {
        if (!isLoggedIn) {
            toast.info('Please log in to use the wishlist feature.', {
                position: "top-center",
                toastId: 'login-to-wishlist'
            });
            return false;
        }

        setWishlistItems((prev) => {
            const updatedItems = prev.filter(item => item.id !== id);
            const updatedIds = updatedItems.map(item => item.id);
            updateWishlistInDatabase(updatedIds, Cookies.get('userId'));
            return updatedItems;
        });
        toast.info('Item removed from wishlist.', {
            position: "top-center",
            toastId: `wishlist-remove-${id}`
        });
        return true;
    };

    const isInWishlist = (id) => {
        return wishlistItems.some(item => item.id === id);
    };

    const setWishlistItemsFromDatabase = (items) => {
        setWishlistItems(items);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, setWishlistItems: setWishlistItemsFromDatabase }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
