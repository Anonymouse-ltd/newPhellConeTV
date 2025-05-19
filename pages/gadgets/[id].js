import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import { useCart } from '../../components/CartContext';
import { useWishlist } from '../../components/WishlistContext';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function GadgetDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [gadget, setGadget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('cover.png');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [allGadgets, setAllGadgets] = useState([]);
    const [relatedGadgets, setRelatedGadgets] = useState([]);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const authToken = Cookies.get('authToken');
        const storedUserId = Cookies.get('userId');
        if (authToken && storedUserId) {
            setIsAuthenticated(true);
        }

        if (!router.isReady) return;

        if (id) {
            fetch(`/api/gadget-details/${id}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch gadget details. Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setGadget(data);
                    setLoading(false);
                })
                .catch(error => {
                    setError('Could not load gadget details. Please try again later.');
                    setLoading(false);
                });
        } else {
            setError('Invalid gadget ID. Please navigate from the home page.');
            setLoading(false);
        }
    }, [id, router.isReady]);

    // Fetch all gadgets for related products
    useEffect(() => {
        fetch('/api/gadgets')
            .then(res => res.json())
            .then(data => setAllGadgets(data))
            .catch(() => setAllGadgets([]));
    }, []);

    // Randomly select 4 related gadgets (excluding the current one)
    useEffect(() => {
        if (allGadgets.length > 0 && gadget) {
            const filtered = allGadgets.filter(g => g.id !== gadget.id);
            const shuffled = [...filtered].sort(() => 0.5 - Math.random());
            setRelatedGadgets(shuffled.slice(0, 4));
        }
    }, [allGadgets, gadget]);

    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    const handleAddToCart = () => {
        if (gadget) {
            addToCart(gadget);
            toast.success(`${gadget.name} added to cart!`, {
                position: "top-center",
                toastId: `cart-add-${gadget.id}`
            });
        }
    };

    const handleBuyNow = () => {
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

    const handleWishlistToggle = () => {
        if (gadget) {
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
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-lg text-gray-700">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-600">
                {error}
                <div className="mt-4">
                    <Link href="/" className="text-green-700 underline hover:text-green-900">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!gadget) {
        return (
            <div className="text-center py-10 text-gray-700">
                Gadget not found.
                <div className="mt-4">
                    <Link href="/" className="text-green-700 underline hover:text-green-900">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const cleanPrice = typeof gadget.price === 'string'
        ? parseFloat(gadget.price.replace(/[^0-9.]/g, ''))
        : gadget.price;
    const formattedPrice = isNaN(cleanPrice)
        ? 'Price unavailable'
        : `₱${cleanPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const baseImagePath = `/${gadget.brand.toLowerCase()}/${gadget.name.toLowerCase()}`;
    const largeImageSrc = `${baseImagePath}/${selectedImage}`;
    const thumbnailImages = ['cover.png'];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Head>
                <title>{`${gadget.name} - Phellcone TV`}</title>
            </Head>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-green-700">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href={`/brands/${gadget.brand.toLowerCase()}`} className="hover:text-green-700 capitalize">{gadget.brand}</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 font-medium">{gadget.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-md p-6">
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center group">
                            <img
                                src={largeImageSrc}
                                alt={`${gadget.name} large view`}
                                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.svg';
                                    e.target.alt = 'Image not available';
                                }}
                            />
                        </div>
                        <div className="flex gap-2 justify-center">
                            {thumbnailImages.map((img) => (
                                <button
                                    key={img}
                                    className={`w-16 h-16 border rounded-md overflow-hidden ${selectedImage === img ? 'border-green-600 border-2' : 'border-gray-200'}`}
                                    onClick={() => handleImageSelect(img)}
                                >
                                    <img
                                        src={`${baseImagePath}/${img}`}
                                        alt={`${gadget.name} thumbnail`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.svg';
                                            e.target.alt = 'Image not available';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{gadget.name}</h1>
                            <p className="text-sm text-gray-500 capitalize">Brand: {gadget.brand}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-semibold text-green-700">{formattedPrice}</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center text-lg font-semibold"
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="px-4 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-all duration-200 text-lg font-semibold"
                            >
                                Buy Now
                            </button>
                            <button
                                onClick={handleWishlistToggle}
                                className="px-4 bg-white border border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-lg font-semibold flex items-center justify-center"
                            >
                                {isInWishlist(gadget.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="flex items-center gap-2 mb-2">
                                <span className="text-green-600">✓</span> In Stock - Ships in 1-2 business days
                            </p>
                            <p className="flex items-center gap-2 mb-2">
                                <span className="text-green-600">✓</span> Free Shipping on orders over ₱1,000
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-green-600">✓</span> 30-Day Money-Back Guarantee
                            </p>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Highlights</h2>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                {gadget.os && <li className="flex items-start gap-2"><span className="text-green-600">•</span><span><strong>OS:</strong> {gadget.os}</span></li>}
                                {gadget.color && <li className="flex items-start gap-2"><span className="text-green-600">•</span><span><strong>Color:</strong> {gadget.color}</span></li>}
                                {gadget.storage && <li className="flex items-start gap-2"><span className="text-green-600">•</span><span><strong>Storage:</strong> {gadget.storage}</span></li>}
                                {gadget.ram && <li className="flex items-start gap-2"><span className="text-green-600">•</span><span><strong>RAM:</strong> {gadget.ram}</span></li>}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                {gadget.os && <li className="flex items-start gap-2"><span className="w-24 font-medium">OS:</span><span>{gadget.os}</span></li>}
                                {gadget.color && <li className="flex items-start gap-2"><span className="w-24 font-medium">Color:</span><span>{gadget.color}</span></li>}
                                {gadget.storage && <li className="flex items-start gap-2"><span className="w-24 font-medium">Storage:</span><span>{gadget.storage}</span></li>}
                                {gadget.ram && <li className="flex items-start gap-2"><span className="w-24 font-medium">RAM:</span><span>{gadget.ram}</span></li>}
                                {gadget.battery && <li className="flex items-start gap-2"><span className="w-24 font-medium">Battery:</span><span>{gadget.battery}</span></li>}
                                {gadget.display && <li className="flex items-start gap-2"><span className="w-24 font-medium">Display:</span><span>{gadget.display}</span></li>}
                                {gadget.processor && <li className="flex items-start gap-2"><span className="w-24 font-medium">Processor:</span><span>{gadget.processor}</span></li>}
                                {gadget.camera && <li className="flex items-start gap-2"><span className="w-24 font-medium">Camera:</span><span>{gadget.camera}</span></li>}
                            </ul>
                            {!gadget.os && !gadget.color && !gadget.storage && !gadget.ram && !gadget.battery && !gadget.display && !gadget.processor && !gadget.camera && (
                                <p className="text-gray-500 italic">No additional specifications available.</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Discover the {gadget.name} by {gadget.brand}, a cutting-edge device designed to elevate your experience. With top-tier features and premium build quality, this gadget is perfect for tech enthusiasts and everyday users alike. Explore its stunning design and powerful performance today.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedGadgets.length > 0 ? (
                            relatedGadgets.map(item => (
                                <div key={item.id} className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center h-48">
                                    <img
                                        src={`/${item.brand.toLowerCase()}/${item.name.toLowerCase()}/cover.png`}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded mb-2"
                                        onError={e => { e.target.src = '/placeholder-image.svg'; }}
                                    />
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">{item.brand}</div>
                                    <Link
                                        href={`/gadgets/${item.id}`}
                                        className="mt-2 text-green-700 hover:text-green-900 text-sm font-semibold"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))
                        ) : (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center h-48 text-gray-500 italic">
                                    <p>Related Product {i}</p>
                                    <p className="text-sm">Coming soon...</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 bg-gray-900 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
