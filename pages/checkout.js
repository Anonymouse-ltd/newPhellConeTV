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
    const { theme } = useTheme();
    const router = useRouter();
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
    }, [router]);

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
        if (hasMounted && cartItems.length > 0) {
            const fetchImages = async () => {
                const imagesData = {};
                for (const item of cartItems) {
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
    }, [hasMounted, cartItems]);

    const hasOutOfStockItem = hasMounted && cartItems.some(item => {
        return (item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock) === 0;
    });

    const totalAmount = hasMounted ? cartItems.reduce((total, item) => {
        const itemPrice = typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
            : item.price;
        return total + (isNaN(itemPrice) ? 0 : itemPrice * item.quantity);
    }, 0) : 0;

    const formattedTotal = hasMounted ? (isNaN(totalAmount)
        ? 'Price unavailable'
        : `₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : 'Price unavailable';
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
                    cartItems,
                    totalAmount
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (
                    errorData.error &&
                    errorData.error.includes('No address provided')
                ) {
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
            console.log('Transaction response:', data);
            setOrderResult(data.receiptData);
            setShowReceipt(true);
            clearCart();
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


    const getCoverImage = (brand, name) => {
        const key = `${brand}-${name}`;
        return images[key] && images[key].coverImage ? images[key].coverImage : '/placeholder-image.jpg';
    };
    if (!hasMounted || !isLoggedIn) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header gadgets={[]} onSearchSelect={() => { }} />
                <main className="flex-grow max-w-7xl mx-auto px-4 py-8 text-center">
                    <p className="text-gray-700 dark:text-gray-300 text-lg">Redirecting to login...</p>
                </main>
                <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-900 dark:bg-gray-800 mt-auto">
                    © 2025 Phellcone TV. All rights reserved.
                </footer>
            </div>
        );
    }
    return (
        <div className={`flex flex-col min-h-screen ${hasMounted ? (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50') : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <div className={`flex items-center text-sm ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} mb-4`}>
                    <Link href="/" className={`hover:${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/cart" className={`hover:${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>Cart</Link>
                    <span className="mx-2">›</span>
                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>Checkout</span>
                </div>
                <h1 className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} text-2xl font-bold mb-6`}>Checkout</h1>
                {showReceipt ? (
                    <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} min-w-[340px] max-w-md rounded-2xl shadow-2xl border border-gray-200 p-8 flex flex-col items-center`}>
                        <div className="flex justify-center items-center w-full">
                            <img
                                src="/logo.svg"
                                alt="Phellcone TV Logo"
                                className="mb-6"
                                style={{
                                    width: '200%',
                                    height: '200%',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <div className="w-full">
                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} text-2xl font-extrabold mb-2`}>Hello, <span className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : 'text-green-600'}`}>{orderResult.buyerName}</span></div>
                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'} text-base mb-1`}>Thank you for purchasing {orderResult.items.length} {orderResult.items.length === 1 ? 'item' : 'items'}.</div>
                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'} text-base mb-4`}>
                                Your order <span className={`${hasMounted ? (theme === 'dark' ? 'text-white' : 'text-black') : 'text-black'} font-mono font-bold underline`}>#{orderResult.timestamp.replace(/\D/g, '').slice(-8)}</span> was paid.
                            </div>
                            <div className={`${hasMounted ? (theme === 'dark' ? 'border-gray-700' : 'border-gray-200') : 'border-gray-200'} border-t border-b py-4 mb-4`}>
                                {orderResult.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-2">
                                        <img
                                            src={getCoverImage(item.brand, item.name)}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            onError={e => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                        />
                                        <div className="flex-1">
                                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-900'} font-semibold`}>{item.name}</div>
                                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs`}>{item.brand}</div>
                                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs`}>Qty: <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-200' : 'text-gray-700') : 'text-gray-700'} font-medium`}>{item.quantity}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="w-full mb-2 space-y-1">
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} flex justify-between text-base`}>
                                    <span>Subtotal:</span>
                                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>₱{orderResult.subtotal}</span>
                                </div>
                                {orderResult.discountApplied && (
                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} flex justify-between text-base`}>
                                        <span>Discount ({orderResult.discountType}, 20%):</span>
                                        <span className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : 'text-green-600'}`}>−₱{orderResult.discountAmount}</span>
                                    </div>
                                )}
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} flex justify-between text-base`}>
                                    <span>Discounted Total:</span>
                                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>₱{orderResult.discountedTotal}</span>
                                </div>
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} flex justify-between text-base`}>
                                    <span>Tax (VAT 12%):</span>
                                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>₱{orderResult.taxAmount}</span>
                                </div>
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} flex justify-between text-lg font-bold`}>
                                    <span>Final Total:</span>
                                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : 'text-green-600'}`}>₱{orderResult.finalTotal}</span>
                                </div>
                            </div>
                            <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50') : 'bg-gray-50'} w-full rounded-xl p-4 mt-4 mb-2`}>
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs mb-1`}>Shipping Address</div>
                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-900'} font-semibold`}>{orderResult.address}</div>
                            </div>
                        </div>
                    </div>
                ) : hasMounted && cartItems.length === 0 ? (
                    <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500') : 'bg-white text-gray-500'} rounded-2xl shadow-md p-6 text-center`}>
                        <p>Your cart is empty. Add items to proceed with checkout.</p>
                        <Link href="/" className={`mt-4 inline-block ${hasMounted ? (theme === 'dark' ? 'text-green-400 underline hover:text-green-300' : 'text-green-700 underline hover:text-green-900') : 'text-green-700 underline hover:text-green-900'}`}>
                            Back to Home
                        </Link>
                    </div>
                ) : hasMounted ? (
                    <div className="flex flex-col gap-6 justify-center items-center">
                        <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} min-w-[340px] max-w-md rounded-2xl shadow-md p-6`}>
                            <div className="flex flex-col gap-4 mb-4">
                                {hasMounted && (
                                    <>
                                        <div className="flex justify-center items-center w-full">
                                            <img
                                                src="/logo.svg"
                                                alt="Phellcone TV Logo"
                                                className="mb-2"
                                                style={{
                                                    width: '200%',
                                                    height: '200%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                        <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-center text-xs mb-2`}>
                                            P. Tuazon Blvd, Cubao, Quezon City, Metro Manila
                                        </div>
                                    </>
                                )}
                            </div>
                            <h2 className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} text-lg font-semibold mb-2`}>Order Summary</h2>
                            {hasMounted && hasOutOfStockItem && (
                                <div className={`${hasMounted ? (theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') : 'bg-red-100 text-red-700'} mb-4 p-3 rounded-lg`}>
                                    Some items in your cart are out of stock. Please remove them before proceeding.
                                </div>
                            )}
                            <ul className="space-y-4 mb-4">
                                {hasMounted && cartItems.map((item, idx) => {
                                    const itemStock = item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock;
                                    const isItemOutOfStock = itemStock === 0;
                                    const itemPrice = typeof item.price === 'string'
                                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                                        : item.price;
                                    const formattedPrice = isNaN(itemPrice) ? 'Price unavailable'
                                        : `₱${itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    const totalItemPrice = isNaN(itemPrice)
                                        ? 'Price unavailable'
                                        : `₱${(itemPrice * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    return (
                                        <li key={`${item.id}-${item.selectedColor}-${idx}`} className="flex items-center gap-4 border-b border-gray-200 pb-2">
                                            <img
                                                src={getCoverImage(item.brand, item.name)}
                                                alt={item.name}
                                                className="w-14 h-14 object-cover rounded"
                                                onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                            />
                                            <div className="flex-1">
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-semibold`}>{item.name}</div>
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs`}>{item.brand}</div>
                                                {item.selectedColor && (
                                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs`}>Color: {item.selectedColor}</div>
                                                )}
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-xs`}>Quantity: {item.quantity}</div>
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'} font-bold text-sm`}>{formattedPrice} (Total: {totalItemPrice})</div>
                                                {isItemOutOfStock && (
                                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') : 'text-red-600'} text-xs font-semibold`}>Out of Stock</div>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="border-t border-gray-200 pt-4">
                                {hasMounted && (
                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} flex justify-between text-base font-bold mb-4`}>
                                        <span>Total Amount:</span>
                                        <span className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>{formattedTotal}</span>
                                    </div>
                                )}
                                {hasMounted && (
                                    <button
                                        onClick={handleBuy}
                                        className={`w-full py-3 rounded-lg text-white text-lg font-semibold transition-all duration-200 ${hasOutOfStockItem || cartItems.length === 0 || isProcessing
                                            ? 'bg-red-600 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        disabled={hasOutOfStockItem || cartItems.length === 0 || isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Buy'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-6">
                        <p>Loading...</p>
                    </div>
                )}
            </main>
            <footer className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-900 text-gray-400') : 'bg-gray-900 text-gray-400'} p-6 text-center text-sm mt-auto`}>
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
