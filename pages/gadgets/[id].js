import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import { useCart } from '../../components/CartContext';
import { useWishlist } from '../../components/WishlistContext';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import fs from 'fs';
import path from 'path';

export default function GadgetDetail({ gadget, images = [], relatedGadgets = [] }) {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : '');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const colors = Array.isArray(gadget.colors) ? gadget.colors : [];
    const [selectedColor, setSelectedColor] = useState(colors[0]?.color || '');
    const selectedColorObj = colors.find(c => c.color === selectedColor) || { stock: 0 };
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const authToken = Cookies.get('authToken');
        const storedUserId = Cookies.get('userId');
        if (authToken && storedUserId) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setQuantity(1);
    };

    const handleQuantityChange = (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > selectedColorObj.stock) val = selectedColorObj.stock;
        setQuantity(val);
    };

    const handleAddToCart = () => {
        if (gadget) {
            const cartItem = { ...gadget, selectedColor, quantity };
            addToCart(cartItem);
            toast.success(`${gadget.name} (${selectedColor}) added to cart!`, {
                position: "top-center",
                toastId: `cart-add-${gadget.id}-${selectedColor}`
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
        return <div className="text-center py-10 text-lg text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-600 dark:text-red-400">
                {error}
                <div className="mt-4">
                    <Link href="/" className="text-green-700 dark:text-green-400 underline hover:text-green-900 dark:hover:text-green-300">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!gadget) {
        return (
            <div className="text-center py-10 text-gray-700 dark:text-gray-300">
                Gadget not found.
                <div className="mt-4">
                    <Link href="/" className="text-green-700 dark:text-green-400 underline hover:text-green-900 dark:hover:text-green-300">
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

    const largeImageSrc = selectedImage || (images.length > 0 ? images[0] : '');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head>
                <title>{`${gadget.name} - Phellcone TV`}</title>
            </Head>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Link href="/" className="hover:text-green-700 dark:hover:text-green-400">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href={`/brands/${gadget.brand.toLowerCase()}`} className="hover:text-green-700 dark:hover:text-green-400 capitalize">{gadget.brand}</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{gadget.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center group">
                            <img
                                src={largeImageSrc}
                                alt={`${gadget.name} large view`}
                                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.alt = 'Image not available';
                                }}
                            />
                        </div>
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                            {images.map((img) => (
                                <button
                                    key={img}
                                    className={`w-16 h-16 border rounded-md overflow-hidden flex-shrink-0 ${selectedImage === img ? 'border-green-600 dark:border-green-400 border-2' : 'border-gray-200 dark:border-gray-700'}`}
                                    onClick={() => handleImageSelect(img)}
                                >
                                    <img
                                        src={img}
                                        alt={`${gadget.name} thumbnail`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.alt = 'Image not available';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{gadget.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">Brand: {gadget.brand}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-semibold text-green-700 dark:text-green-400">{formattedPrice}</span>
                        </div>
                        {colors.length > 0 && (
                            <div className="mb-4">
                                <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Color:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map(({ color, stock }) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorSelect(color)}
                                            className={`flex items-center px-4 py-2 rounded border transition
                                                ${selectedColor === color
                                                    ? 'border-green-600 bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-100'
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                                            disabled={stock <= 0}
                                        >
                                            <span
                                                className="inline-block w-4 h-4 rounded-full border mr-2"
                                                style={{
                                                    backgroundColor: color.toLowerCase(),
                                                    borderColor: selectedColor === color ? '#16a34a' : '#d1d5db'
                                                }}
                                            />
                                            <span>{color}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mb-4 flex items-center gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Quantity:</span>
                            <input
                                type="number"
                                min={1}
                                max={selectedColorObj.stock || 1}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                disabled={selectedColorObj.stock === 0}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedColorObj.stock > 0 ? `Max: ${selectedColorObj.stock}` : 'Out of stock'}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 flex items-center justify-center text-lg font-semibold"
                                disabled={selectedColorObj.stock === 0 || quantity < 1}
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="px-4 bg-yellow-500 dark:bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-all duration-200 text-lg font-semibold"
                                disabled={selectedColorObj.stock === 0 || quantity < 1}
                            >
                                Buy Now
                            </button>
                            <button
                                onClick={handleWishlistToggle}
                                className="px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg font-semibold flex items-center justify-center"
                            >
                                {isInWishlist(gadget.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="flex items-center gap-2 mb-2">
                                <span className="text-green-600 dark:text-green-400">✓</span> In Stock - Ships in 1-2 business days
                            </p>
                            <p className="flex items-center gap-2 mb-2">
                                <span className="text-green-600 dark:text-green-400">✓</span> Free Shipping on orders over ₱1,000
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span> 30-Day Money-Back Guarantee
                            </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Product Highlights</h2>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                                {gadget.os && <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">•</span><span><strong>OS:</strong> {gadget.os}</span></li>}
                                {gadget.storage && <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">•</span><span><strong>Storage:</strong> {gadget.storage}</span></li>}
                                {gadget.ram && <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">•</span><span><strong>RAM:</strong> {gadget.ram}</span></li>}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Specifications</h3>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                                {gadget.os && <li className="flex items-start gap-2"><span className="w-24 font-medium">OS:</span><span>{gadget.os}</span></li>}
                                {gadget.storage && <li className="flex items-start gap-2"><span className="w-24 font-medium">Storage:</span><span>{gadget.storage}</span></li>}
                                {gadget.ram && <li className="flex items-start gap-2"><span className="w-24 font-medium">RAM:</span><span>{gadget.ram}</span></li>}
                                {gadget.battery && <li className="flex items-start gap-2"><span className="w-24 font-medium">Battery:</span><span>{gadget.battery}</span></li>}
                                {gadget.display && <li className="flex items-start gap-2"><span className="w-24 font-medium">Display:</span><span>{gadget.display}</span></li>}
                                {gadget.processor && <li className="flex items-start gap-2"><span className="w-24 font-medium">Processor:</span><span>{gadget.processor}</span></li>}
                                {gadget.camera && <li className="flex items-start gap-2"><span className="w-24 font-medium">Camera:</span><span>{gadget.camera}</span></li>}
                            </ul>
                            {!gadget.os && !gadget.storage && !gadget.ram && !gadget.battery && !gadget.display && !gadget.processor && !gadget.camera && (
                                <p className="text-gray-500 dark:text-gray-400 italic">No additional specifications available.</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                Discover the {gadget.name} by {gadget.brand}, a cutting-edge device designed to elevate your experience. With top-tier features and premium build quality, this gadget is perfect for tech enthusiasts and everyday users alike. Explore its stunning design and powerful performance today.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedGadgets.length > 0 ? (
                            relatedGadgets.map(item => (
                                <div key={item.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center h-48">
                                    <img
                                        src={item.imgSrc || `/${item.brand.toLowerCase()}/${item.name.toLowerCase()}/cover.png`}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded mb-2"
                                        onError={(e) => {
                                            e.target.alt = 'Image not available';
                                        }}
                                    />
                                    <div className="font-bold text-gray-900 dark:text-gray-100">{item.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.brand}</div>
                                    <Link
                                        href={`/gadgets/${item.id}`}
                                        className="mt-2 text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm font-semibold"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))
                        ) : (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400 italic">
                                    <p>Related Product {i}</p>
                                    <p className="text-sm">Coming soon...</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { id } = context.params;
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const gadgetRes = await fetch(`${apiBaseUrl}/api/gadget-details/${id}`);
        if (!gadgetRes.ok) {
            throw new Error(`Failed to fetch gadget details: ${gadgetRes.status}`);
        }
        const gadget = await gadgetRes.json();

        const allGadgetsRes = await fetch(`${apiBaseUrl}/api/gadgets`);
        if (!allGadgetsRes.ok) {
            throw new Error(`Failed to fetch all gadgets: ${allGadgetsRes.status}`);
        }
        const allGadgets = await allGadgetsRes.json();

        const filtered = allGadgets.filter(g => g.id !== gadget.id);
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        const relatedGadgets = shuffled.slice(0, 4).map(item => {
            const imgSrc = findCoverImage(item.brand, item.name);
            return { ...item, imgSrc };
        });

        const images = findAllImages(gadget.brand, gadget.name);

        return {
            props: {
                gadget,
                images,
                relatedGadgets
            }
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                gadget: null,
                images: [],
                relatedGadgets: []
            }
        };
    }
}

function findCoverImage(brand, gadgetName) {
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase());
    const folderVariations = [
        gadgetName.toLowerCase(),
        gadgetName.toUpperCase(),
        gadgetName
    ];
    for (const folder of folderVariations) {
        const folderPath = path.join(baseDir, folder);
        try {
            if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                for (const file of files) {
                    const fileNameWithoutExt = path.basename(file, path.extname(file)).toLowerCase();
                    if (fileNameWithoutExt === 'cover') {
                        return `/${brand.toLowerCase()}/${folder}/${file}`;
                    }
                }
            }
        } catch (err) {
            console.error(`Error checking folder ${folderPath}:`, err);
        }
    }
    return `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/cover.png`;
}

function findAllImages(brand, gadgetName) {
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase());
    const folderVariations = [
        gadgetName.toLowerCase(),
        gadgetName.toUpperCase(),
        gadgetName
    ];
    for (const folder of folderVariations) {
        const folderPath = path.join(baseDir, folder);
        try {
            if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                return files
                    .filter(file => {
                        const ext = path.extname(file).toLowerCase();
                        return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
                    })
                    .map(file => `/${brand.toLowerCase()}/${folder}/${file}`);
            }
        } catch (err) {
            console.error(`Error checking folder ${folderPath}:`, err);
        }
    }
    return [];
}
