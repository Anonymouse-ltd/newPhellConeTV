import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart } from '../../components/CartContext';
import { useWishlist } from '../../components/WishlistContext';
import GadgetDetailHeader from '../../components/gadgetDetail/GadgetDetailHeader';
import GadgetDetailImages from '../../components/gadgetDetail/GadgetDetailImages';
import GadgetDetailInfo from '../../components/gadgetDetail/GadgetDetailInfo';
import GadgetDetailSpecs from '../../components/gadgetDetail/GadgetDetailSpecs';
import GadgetDetailRelated from '../../components/gadgetDetail/GadgetDetailRelated';
import useColorMapping from '../../components/gadgetDetail/useColorMapping';
import useGadgetActions from '../../components/gadgetDetail/useGadgetActions';
import { findCoverImage, findAllImages } from '../../components/gadgetDetail/utils';

export default function GadgetDetail({ gadget, images = [], relatedGadgets = [] }) {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : '');
    const colors = Array.isArray(gadget.colors) ? gadget.colors : [];
    const [selectedColor, setSelectedColor] = useState(colors[0]?.color || '');
    const selectedColorObj = colors.find(c => c.color === selectedColor) || { stock: 0 };
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const { getBackgroundColor } = useColorMapping(colors);
    const { handleAddToCart, handleBuyNow, handleWishlistToggle } = useGadgetActions({
        gadget,
        selectedColor,
        selectedColorObj,
        quantity,
        addToCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    });

    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setQuantity(1);
    };

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) {
            setQuantity(1);
        } else if (val > selectedColorObj.stock) {
            setQuantity(selectedColorObj.stock);
        } else {
            setQuantity(val);
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

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <GadgetDetailHeader gadget={gadget} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
                    <GadgetDetailImages
                        images={images}
                        selectedImage={selectedImage}
                        handleImageSelect={handleImageSelect}
                        gadgetName={gadget.name}
                    />
                    <GadgetDetailInfo
                        gadget={gadget}
                        formattedPrice={formattedPrice}
                        colors={colors}
                        selectedColor={selectedColor}
                        selectedColorObj={selectedColorObj}
                        quantity={quantity}
                        handleColorSelect={handleColorSelect}
                        handleQuantityChange={handleQuantityChange}
                        handleAddToCart={handleAddToCart}
                        handleBuyNow={handleBuyNow}
                        handleWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        getBackgroundColor={getBackgroundColor}
                    />
                </div>
                <GadgetDetailSpecs gadget={gadget} />
                <GadgetDetailRelated relatedGadgets={relatedGadgets} />
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
        const gadgetEndpoint = `${apiBaseUrl}/api/gadget-details/${id}`;

        const gadgetRes = await fetch(gadgetEndpoint);
        if (!gadgetRes.ok) {
            throw new Error(`Failed to fetch gadget details: ${gadgetRes.status}`);
        }
        const gadget = await gadgetRes.json();

        const allGadgetsEndpoint = `${apiBaseUrl}/api/gadgets`;

        const allGadgetsRes = await fetch(allGadgetsEndpoint);
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
