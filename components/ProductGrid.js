import Link from 'next/link';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { toast } from 'react-toastify';

export default function ProductGrid({ gadgets, loading }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const handleAddToCart = (gadget) => {
        addToCart(gadget);
        toast.success(`${gadget.name} added to cart!`, {
            position: "top-center",
            toastId: `cart-add-${gadget.id}`
        });
    };

    const handleWishlistToggle = (gadget) => {
        if (isInWishlist(gadget.id)) {
            removeFromWishlist(gadget.id);
            toast.info(`${gadget.name} removed from wishlist.`, {
                position: "top-center",
                toastId: `wishlist-remove-${gadget.id}`
            });
        } else {
            addToWishlist(gadget);
            toast.success(`${gadget.name} added to wishlist!`, {
                position: "top-center",
                toastId: `wishlist-add-${gadget.id}`
            });
        }
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
                        const imgSrc = encodeURI(`/${gadget.brand}/${gadget.name}/cover.png`);
                        const cleanPrice = typeof gadget.price === 'string'
                            ? parseFloat(gadget.price.replace(/[^0-9.]/g, ''))
                            : gadget.price;
                        return (
                            <li key={gadget.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6 flex flex-col hover:shadow-xl dark:hover:shadow-gray-600 transition-all duration-300 group">
                                <Link href={`/gadgets/${gadget.id}`} className="flex flex-col h-full">
                                    <div className="h-52 w-full bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={imgSrc}
                                            alt={`${gadget.name} cover`}
                                            className="max-h-full max-w-full object-contain rounded-xl bg-white dark:bg-gray-800"
                                            style={{ display: 'block', margin: '0 auto' }}
                                        />
                                    </div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{gadget.name}</div>
                                    <div className="text-gray-500 dark:text-gray-400 capitalize text-sm mb-2">{gadget.brand}</div>
                                    <div className="text-green-700 dark:text-green-400 font-semibold text-lg mb-4">
                                        {isNaN(cleanPrice)
                                            ? 'Price unavailable'
                                            : `₱${cleanPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                    </div>
                                </Link>
                                <div className="flex mt-2 ml-auto gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(gadget)}
                                        className="text-2xl transition hover:scale-125 text-green-700 dark:text-green-400"
                                        title="Add to cart"
                                    >
                                        🛒
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleWishlistToggle(gadget)}
                                        className="text-2xl transition hover:scale-125 text-red-500 dark:text-red-400"
                                        title={isInWishlist(gadget.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        {isInWishlist(gadget.id) ? '❤️' : '🤍'}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
