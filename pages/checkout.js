import { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Cookies from 'js-cookie';
import { useTheme } from '../components/ThemeContext';
import { toast } from 'react-toastify';

export default function Checkout() {
    const { cartItems, clearCart } = useCart();
    const [orderResult, setOrderResult] = useState(null);
    const [buyerName, setBuyerName] = useState('');
    const [address, setAddress] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [userError, setUserError] = useState(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [images, setImages] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState(null);
    const { theme } = useTheme();
    const router = useRouter();
    const { buyNow } = router.query;

    useEffect(() => {
        setHasMounted(true);
        const userId = Cookies.get('userId');
        const authToken = Cookies.get('authToken');
        const loggedIn = !!(userId && authToken);
        setIsLoggedIn(loggedIn);

        if (!loggedIn) {
            toast.error('Please log in to access checkout.', {
                position: "top-center",
                toastId: "checkout-login-required"
            });
            router.push({
                pathname: '/login',
                query: { redirect: '/checkout' },
            });
        }
        if (buyNow) {
            try {
                const parsedItem = JSON.parse(buyNow);
                setBuyNowItem(parsedItem);
            } catch (error) {
                console.error('Error parsing buyNow item:', error);
                setBuyNowItem(null);
            }
        }
    }, [router, buyNow]);
    useEffect(() => {
        if (hasMounted && isLoggedIn) {
            const fetchUserDetails = async () => {
                try {
                    setLoadingUser(true);
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
                    if (data) {
                        setBuyerName(data.name || 'Unknown User');
                        setAddress(data.address || 'No Address Provided');
                        setUserError(null);
                    } else {
                        setBuyerName('Unknown User');
                        setAddress('No Address Provided');
                        setUserError('User details not found in database.');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    setUserError('Could not load user information. Using default values.');
                    setBuyerName('Unknown User');
                    setAddress('No Address Provided');
                } finally {
                    setLoadingUser(false);
                }
            };

            fetchUserDetails();
        }
    }, [hasMounted, isLoggedIn]);
    useEffect(() => {
        if (hasMounted) {
            const items = buyNowItem ? [buyNowItem] : cartItems;
            if (items.length > 0) {
                const fetchImages = async () => {
                    const imagesData = {};
                    for (const item of items) {
                        try {
                            const response = await fetch(`/api/get-images?brand=${encodeURIComponent(item.brand)}&gadgetName=${encodeURIComponent(item.name)}`);
                            if (response.ok) {
                                const data = await response.json();
                                imagesData[`${item.brand}-${item.name}`] = data;
                            } else {
                                imagesData[`${item.brand}-${item.name}`] = {
                                    coverImage: '/placeholder-image.jpg',
                                    allImages: ['/placeholder-image.jpg']
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching images for ${item.brand} ${item.name}:`, error);
                            imagesData[`${item.brand}-${item.name}`] = {
                                coverImage: '/placeholder-image.jpg',
                                allImages: ['/placeholder-image.jpg']
                            };
                        }
                    }
                    setImages(imagesData);
                };

                fetchImages();
            }
        }
    }, [hasMounted, cartItems, buyNowItem]);
    const hasOutOfStockItem = hasMounted && (buyNowItem ?
        (buyNowItem.selectedColorStock === 0 || buyNowItem.selectedColorStock === '0') :
        cartItems.some(item => (item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock) === 0)
    );

    const totalAmount = hasMounted ? (buyNowItem ?
        (typeof buyNowItem.price === 'string' ? parseFloat(buyNowItem.price.replace(/[^0-9.]/g, '')) : buyNowItem.price) * buyNowItem.quantity :
        cartItems.reduce((total, item) => {
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
            return total + (isNaN(itemPrice) ? 0 : itemPrice * item.quantity);
        }, 0)
    ) : 0;

    const formattedTotal = hasMounted ? (isNaN(totalAmount) ? 'Price unavailable' : `₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : 'Price unavailable';

    const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems;

    const getCoverImage = (brand, name) => {
        const key = `${brand}-${name}`;
        return images[key] && images[key].coverImage ? images[key].coverImage : '/placeholder-image.jpg';
    };
    const handleBuy = async () => {
        if (!hasMounted || isProcessing) return;

        setIsProcessing(true);
        try {
            const userId = Cookies.get('userId');
            if (!userId) {
                throw new Error('User ID not found in cookies.');
            }

            const response = await fetch('/api/store-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    cartItems: itemsToCheckout,
                    totalAmount
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error && errorData.error.includes('No address provided')) {
                    toast.error(errorData.error, {
                        position: "top-center",
                        toastId: 'purchase-address-error'
                    });
                    setIsProcessing(false);
                    return;
                }
                toast.error(errorData.error || 'Failed to store transaction.', {
                    position: "top-center",
                    toastId: 'purchase-error'
                });
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            setOrderResult(data.receiptData);
            setShowReceipt(true);
            if (!buyNowItem) {
                clearCart();
            }
            toast.success('Purchase completed successfully!', {
                position: "top-center",
                toastId: 'purchase-success'
            });
        } catch (error) {
            console.error('Error during purchase:', error);
            if (error.message.includes('No address provided')) {
                toast.error(error.message, {
                    position: "top-center",
                    toastId: 'purchase-address-error'
                });
            } else {
                toast.error('Failed to complete purchase. Please try again.', {
                    position: "top-center",
                    toastId: 'purchase-error'
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {!hasMounted || !isLoggedIn ? (
                <div style={{ visibility: 'hidden' }}></div>
            ) : (
                <>
                    <Header gadgets={[]} onSearchSelect={() => { }} />
                    <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
                        <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                            <Link href="/" className={`hover:${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Home</Link>
                            <span className="mx-2">›</span>
                            <Link href="/cart" className={`hover:${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Cart</Link>
                            <span className="mx-2">›</span>
                            <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Checkout</span>
                        </div>
                        <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-3xl font-bold mb-8`}>Checkout</h1>
                        {showReceipt ? (
                            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-8 max-w-2xl mx-auto`}>
                                <div className="flex justify-center items-center w-full mb-6">
                                    <img
                                        src="/logo.svg"
                                        alt="Phellcone TV Logo"
                                        className="h-16"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div className="w-full">
                                    <div className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-2xl font-bold mb-2`}>Hello, <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{orderResult.buyerName}</span></div>
                                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-base mb-1`}>Thank you for purchasing {orderResult.items.length} {orderResult.items.length === 1 ? 'item' : 'items'}.</div>
                                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-base mb-4`}>
                                        Your order <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-mono font-bold underline`}>#{orderResult.timestamp.replace(/\D/g, '').slice(-8)}</span> was paid.
                                    </div>
                                    <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t border-b py-4 mb-4`}>
                                        {orderResult.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 py-2">
                                                <img
                                                    src={getCoverImage(item.brand, item.name)}
                                                    alt={item.name}
                                                    className={`w-16 h-16 object-cover rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                                                    onError={e => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                                />
                                                <div className="flex-1">
                                                    <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>{item.name}</div>
                                                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{item.brand}</div>
                                                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Qty: <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{item.quantity}</span></div>
                                                    {item.color && <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Color: {item.color}</div>}
                                                </div>
                                                <div className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} font-mono`}>₱{item.total}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full mb-2 space-y-1">
                                        <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex justify-between text-base`}>
                                            <span>Subtotal:</span>
                                            <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>₱{orderResult.subtotal}</span>
                                        </div>
                                        {orderResult.discountApplied && (
                                            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex justify-between text-base`}>
                                                <span>Discount ({orderResult.discountType}, 20%):</span>
                                                <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>−₱{orderResult.discountAmount}</span>
                                            </div>
                                        )}
                                        <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex justify-between text-base`}>
                                            <span>Discounted Total:</span>
                                            <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>₱{orderResult.discountedTotal}</span>
                                        </div>
                                        <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex justify-between text-base`}>
                                            <span>Tax (VAT 12%):</span>
                                            <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>₱{orderResult.taxAmount}</span>
                                        </div>
                                        <div className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} flex justify-between text-lg font-bold`}>
                                            <span>Final Total:</span>
                                            <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>₱{orderResult.finalTotal}</span>
                                        </div>
                                    </div>
                                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} w-full rounded-xl p-4 mt-4 mb-2`}>
                                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Shipping Address</div>
                                        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>{orderResult.address}</div>
                                    </div>
                                    <div className="flex justify-center mt-6">
                                        <Link href="/" className={`py-2 px-4 rounded-lg ${theme === 'dark' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : itemsToCheckout.length === 0 ? (
                            <div className={`${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} rounded-2xl shadow-md p-6 text-center max-w-2xl mx-auto`}>
                                <p>Your cart is empty. Add items to proceed with checkout.</p>
                                <Link href="/" className={`mt-4 inline-block ${theme === 'dark' ? 'text-green-400 underline hover:text-green-300' : 'text-green-700 underline hover:text-green-900'}`}>
                                    Back to Home
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6 mb-6`}>
                                        <h2 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-xl font-semibold mb-4`}>Shipping Information</h2>
                                        {loadingUser ? (
                                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Loading user information...</p>
                                        ) : (
                                            <div>
                                                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name: <span className="font-semibold">{buyerName}</span></p>
                                                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Address: <span className="font-semibold">{address}</span></p>
                                                {userError && <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-sm mt-2`}>{userError}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6 sticky top-4`}>
                                        <h2 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-xl font-semibold mb-4`}>Order Summary {buyNowItem ? '(Buy Now)' : ''}</h2>
                                        {hasOutOfStockItem && (
                                            <div className={`${theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'} mb-4 p-3 rounded-lg`}>
                                                Some items in your order are out of stock. Please remove them before proceeding.
                                            </div>
                                        )}
                                        <ul className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                            {itemsToCheckout.map((item, idx) => {
                                                const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
                                                const itemTotal = isNaN(itemPrice) ? 'Price unavailable' : `₱${(itemPrice * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                return (
                                                    <li key={idx} className={`flex items-center gap-4 border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                                        <img
                                                            src={getCoverImage(item.brand, item.name)}
                                                            alt={item.name}
                                                            className={`w-16 h-16 object-cover rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                                                            onError={e => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                                        />
                                                        <div className="flex-1">
                                                            <div className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-semibold`}>{item.name}</div>
                                                            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{item.brand}</div>
                                                            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Qty: {item.quantity}</div>
                                                            {item.selectedColor && <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Color: {item.selectedColor}</div>}
                                                        </div>
                                                        <div className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} font-mono`}>{itemTotal}</div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                                            <div className="flex justify-between mb-2">
                                                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal:</span>
                                                <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formattedTotal}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Shipping:</span>
                                                <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Free</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Total:</span>
                                                <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{formattedTotal}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleBuy}
                                            disabled={hasOutOfStockItem || isProcessing}
                                            className={`w-full py-3 mt-6 rounded-lg font-semibold transition ${hasOutOfStockItem || isProcessing ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : theme === 'dark' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                        >
                                            {isProcessing ? 'Processing...' : 'Place Order'}
                                        </button>
                                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs text-center mt-2`}>By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                    <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm mt-auto">
                        © 2025 Phellcone TV. All rights reserved.
                    </footer>
                </>
            )}
        </div>
    );
}