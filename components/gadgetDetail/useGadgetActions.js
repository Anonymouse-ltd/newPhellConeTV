import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function useGadgetActions({
    gadget,
    selectedColor,
    selectedColorObj,
    quantity,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authToken = Cookies.get('authToken');
        const storedUserId = Cookies.get('userId');
        if (authToken && storedUserId) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleAddToCart = () => {
        if (selectedColorObj.stock === 0 || selectedColorObj.stock === '0') {
            toast.error(`${gadget.name} (${selectedColor}) is out of stock.`, {
                position: "top-center",
                toastId: `cart-add-fail-${gadget.id}-${selectedColor}`
            });
            return;
        }
        if (gadget) {
            const validQuantity = Number.isInteger(quantity) ? quantity : 1;
            const cartItem = { ...gadget, selectedColor, quantity: validQuantity, selectedColorStock: selectedColorObj.stock };
            addToCart(cartItem);
            toast.success(`${gadget.name} (${selectedColor}) added to cart!`, {
                position: "top-center",
                toastId: `cart-add-${gadget.id}-${selectedColor}`
            });
        }
    };

    const handleBuyNow = () => {
        if (selectedColorObj.stock === 0 || selectedColorObj.stock === '0') {
            toast.error(`${gadget.name} (${selectedColor}) is out of stock.`, {
                position: "top-center",
                toastId: `buy-now-fail-${gadget.id}-${selectedColor}`
            });
            return;
        }
        if (!isAuthenticated) {
            toast.error('Please log in to proceed with purchase.', {
                position: "top-center",
                toastId: "buy-now-login-required"
            });
            router.push('/login');
        } else {
            router.push('/checkout');
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            toast.info('Please log in to use the wishlist feature.', {
                position: "top-center",
                toastId: 'login-to-wishlist'
            });
            router.push('/login');
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

    return { handleAddToCart, handleBuyNow, handleWishlistToggle, isAuthenticated };
}
