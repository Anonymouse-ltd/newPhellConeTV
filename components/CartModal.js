import Link from 'next/link';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function CartModal({ open, onClose }) {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const [isVisible, setIsVisible] = useState(open);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        const userId = Cookies.get('userId');
        const authToken = Cookies.get('authToken');
        setIsLoggedIn(!!(userId && authToken));
    }, []);

    const handleClearCart = () => {
        clearCart();
        toast.info('All items removed from cart.', {
            position: "top-center",
            toastId: "cart-clear-all"
        });
    };

    const handleCheckout = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            toast.error('Please log in to proceed to checkout.', {
                position: "top-center",
                toastId: "checkout-login-required"
            });

            router.push({
                pathname: '/login',
                query: { redirect: '/checkout' },
            });
        }
    };

    const hasOutOfStockItem = cartItems.some(item => {
        return (item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock) === 0;
    });

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 z-50 flex justify-end overflow-hidden">
            <div
                className={`w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col ${open ? 'animate-slide-in-right' : 'animate-slide-out-right'}`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-2xl">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Your cart is empty.</div>
                    ) : (
                        <>
                            <ul className="space-y-4">
                                {cartItems.map((item, idx) => {
                                    const itemStock = item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock;
                                    const isItemOutOfStock = itemStock === 0;

                                    return (
                                        <li key={`${item.id}-${item.selectedColor}-${idx}`} className="flex items-center gap-4">
                                            <img src={encodeURI(`/${item.brand.toLowerCase()}/${item.name.toLowerCase()}/cover.png`)} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{item.brand}</div>
                                                {item.selectedColor && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Color: {item.selectedColor}</div>
                                                )}
                                                <div className="text-green-700 dark:text-green-400 font-bold">₱{item.price}</div>
                                                {isItemOutOfStock && (
                                                    <div className="text-sm text-red-600 dark:text-red-400 font-semibold">Out of Stock</div>
                                                )}
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300">x{item.quantity}</div>
                                            <button onClick={() => removeFromCart(item.id, item.selectedColor)} className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xl">🗑️</button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <button
                                onClick={handleClearCart}
                                className="mt-4 w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 py-2 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200"
                            >
                                Clear All Items
                            </button>
                        </>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/checkout"
                        className={`block w-full text-center text-white py-2 rounded transition ${cartItems.length === 0 || hasOutOfStockItem
                            ? 'bg-red-600 dark:bg-red-700 cursor-not-allowed'
                            : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'
                            }`}
                        tabIndex={cartItems.length === 0 || hasOutOfStockItem ? -1 : 0}
                        aria-disabled={cartItems.length === 0 || hasOutOfStockItem}
                        style={{ pointerEvents: cartItems.length === 0 || hasOutOfStockItem ? 'none' : 'auto' }}
                        onClick={handleCheckout}
                    >
                        {cartItems.length === 0 ? 'Go to Checkout' : hasOutOfStockItem ? 'Out of Stock' : 'Go to Checkout'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
