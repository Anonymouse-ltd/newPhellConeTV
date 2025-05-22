import { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Header from '../components/Header';
import { useTheme } from '../components/ThemeContext';

export default function Cart() {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const [isClearing, setIsClearing] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [images, setImages] = useState({});
    const { theme } = useTheme();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (hasMounted) {
            const fetchImages = async () => {
                const imagesData = {};
                for (const item of cartItems) {
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

    const handleClearCart = () => {
        setIsClearing(true);
        clearCart();
        toast.info('All items removed from cart.', {
            position: "top-center",
            toastId: "cart-clear-all"
        });
        setTimeout(() => setIsClearing(false), 500);
    };

    const handleRemoveItem = (id, color) => {
        removeFromCart(id, color);
        toast.info('Item removed from cart.', {
            position: "top-center",
            toastId: `cart-remove-${id}-${color || 'default'}`
        });
    };

    const getCoverImage = (brand, name) => {
        const key = `${brand}-${name}`;
        return images[key] ? images[key].coverImage : '/placeholder-image.jpg';
    };

    return (
        <div className={`flex flex-col min-h-screen ${hasMounted ? (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50') : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
                <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} rounded-2xl shadow-md p-6 w-full max-w-md`}>
                    <div className={`flex items-center text-sm ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} mb-4`}>
                        <Link href="/" className={`hover:${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>Home</Link>
                        <span className="mx-2">›</span>
                        <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>Cart</span>
                    </div>
                    <h1 className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} text-2xl font-bold mb-6`}>Your Cart</h1>

                    {hasMounted && cartItems.length === 0 ? (
                        <div className={`text-center ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} py-6`}>
                            <p>Your cart is empty. Add items to start shopping.</p>
                            <Link href="/" className={`mt-4 inline-block ${hasMounted ? (theme === 'dark' ? 'text-green-400 underline hover:text-green-300' : 'text-green-700 underline hover:text-green-900') : 'text-green-700 underline hover:text-green-900'}`}>
                                Back to Home
                            </Link>
                        </div>
                    ) : hasMounted ? (
                        <>
                            {hasOutOfStockItem && (
                                <div className={`${hasMounted ? (theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') : 'bg-red-100 text-red-700'} mb-4 p-3 rounded-lg`}>
                                    Some items in your cart are out of stock. Please remove them before proceeding to checkout.
                                </div>
                            )}
                            <ul className="space-y-4 mb-6">
                                {cartItems.map((item, idx) => {
                                    const itemStock = item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock;
                                    const isItemOutOfStock = itemStock === 0;
                                    const itemPrice = typeof item.price === 'string'
                                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                                        : item.price;
                                    const formattedPrice = isNaN(itemPrice)
                                        ? 'Price unavailable'
                                        : `₱${itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                                    return (
                                        <li key={`${item.id}-${item.selectedColor}-${idx}`} className="flex items-center gap-4 border-b border-gray-200 pb-2">
                                            <img
                                                src={getCoverImage(item.brand, item.name)}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.alt = 'Image not available'; }}
                                            />
                                            <div className="flex-1">
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-semibold`}>{item.name}</div>
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-sm`}>{item.brand}</div>
                                                {item.selectedColor && (
                                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} text-sm`}>Color: {item.selectedColor}</div>
                                                )}
                                                <div className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'} font-bold`}>{formattedPrice}</div>
                                                {isItemOutOfStock && (
                                                    <div className={`${hasMounted ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') : 'text-red-600'} text-sm font-semibold`}>Out of Stock</div>
                                                )}
                                            </div>
                                            <div className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'}`}>x{item.quantity}</div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id, item.selectedColor)}
                                                className={`ml-2 ${hasMounted ? (theme === 'dark' ? 'text-red-400 hover:text-red-600' : 'text-red-500 hover:text-red-700') : 'text-red-500 hover:text-red-700'} text-xl`}
                                            >
                                                🗑️
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className={`flex justify-between text-lg font-bold ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} mb-4`}>
                                <span>Total Amount:</span>
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>{formattedTotal}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleClearCart}
                                    className={`flex-1 py-3 rounded-lg ${hasMounted ? (theme === 'dark' ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200') : 'bg-red-100 text-red-700 hover:bg-red-200'} font-semibold transition-all duration-200`}
                                    disabled={isClearing}
                                >
                                    Clear All Items
                                </button>
                                <Link
                                    href="/checkout"
                                    className={`px-4 py-3 rounded-lg text-white text-lg font-semibold transition-all duration-200 ${cartItems.length === 0 || hasOutOfStockItem
                                            ? 'bg-red-600 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    tabIndex={cartItems.length === 0 || hasOutOfStockItem ? -1 : 0}
                                    aria-disabled={cartItems.length === 0 || hasOutOfStockItem}
                                    style={{ pointerEvents: cartItems.length === 0 || hasOutOfStockItem ? 'none' : 'auto' }}
                                >
                                    {cartItems.length === 0 ? 'Go to Checkout' : hasOutOfStockItem ? 'Out of Stock' : 'Go to Checkout'}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={`text-center ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'} py-6`}>
                            <p>Loading...</p>
                        </div>
                    )}
                </div>
            </main>
            <footer className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-900 text-gray-400') : 'bg-gray-900 text-gray-400'} p-6 text-center text-sm mt-auto`}>
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
