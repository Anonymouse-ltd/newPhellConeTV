import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedWishlist = localStorage.getItem('wishlistItems');
            return storedWishlist ? JSON.parse(storedWishlist) : [];
        }
        return [];
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    const addToWishlist = (gadget) => {
        setWishlistItems((prev) => {
            if (prev.find(item => item.id === gadget.id)) {
                return prev;
            }
            return [...prev, gadget];
        });
    };

    const removeFromWishlist = (id) => {
        setWishlistItems((prev) => prev.filter(item => item.id !== id));
    };

    const isInWishlist = (id) => {
        return wishlistItems.some(item => item.id === id);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
