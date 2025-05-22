import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import CartModal from './CartModal';
import { useCart } from './CartContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeContext';
import { toast } from 'react-toastify';
export default function Header({ gadgets = [], onSearchSelect }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);

    const { cartItems } = useCart();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (hasMounted) {
            const authToken = Cookies.get('authToken');
            const storedUserId = Cookies.get('userId');
            if (authToken && storedUserId) {
                setIsAuthenticated(true);
                setUserId(storedUserId);
                fetchUserDetails(storedUserId);
            }
        }
    }, [hasMounted]);

    useEffect(() => {
        if (hasMounted) {
            const totalCount = cartItems.reduce((sum, item) => sum + (Number.isInteger(item.quantity) ? item.quantity : 0), 0);
            console.log(`Cart item count updated: ${totalCount}`);
            setCartItemCount(totalCount);
        }
    }, [cartItems, hasMounted]);

    useEffect(() => {
        if (hasMounted && searchQuery) {
            const results = gadgets.filter(gadget =>
                gadget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gadget.brand.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, gadgets, hasMounted]);

    const fetchUserDetails = async (userId) => {
        try {
            const res = await fetch(`/api/user-details/${userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.avatar) {
                    setAvatarUrl(data.avatar);
                }
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectResult = (gadget) => {
        setSearchQuery('');
        setSearchResults([]);
        router.push(`/gadgets/${gadget.id}`);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };
    const { clearCart } = useCart();
    const handleLogout = () => {
        Cookies.remove('authToken');
        Cookies.remove('userId');
        clearCart();
        setIsAuthenticated(false);
        setUserId(null);
        setAvatarUrl('');
        toast.info('Logged out successfully. Cart cleared.', {
            position: "top-center",
            toastId: 'logout-success'
        });
        router.push('/');
    };


    return (
        <>
            <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <img src="/logo.svg" alt="Phellcone TV Logo" className="h-16 w-auto cursor-pointer" />
                        </Link>
                    </div>
                    <div className="flex-1 flex justify-center relative">
                        <div className="relative w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search gadgets..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90 transition-all duration-200 focus:shadow-md"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
                            {hasMounted && searchResults.length > 0 && (
                                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 mt-1 max-h-96 overflow-y-auto">
                                    {searchResults.map(result => {
                                        const imgSrc = encodeURI(`/${result.brand.toLowerCase()}/${result.name.toLowerCase()}/cover.png`);
                                        return (
                                            <div
                                                key={result.id}
                                                className="flex items-center p-3 hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer rounded-lg transition-all duration-200"
                                                onClick={() => handleSelectResult(result)}
                                            >
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={imgSrc}
                                                        alt={`${result.name} cover`}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{result.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{result.brand}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        {hasMounted && (
                            <button onClick={() => setCartOpen(true)} className="relative flex items-center group" aria-label="Open cart">
                                <ShoppingCartIcon className="h-7 w-7 text-green-700 dark:text-green-400 group-hover:text-green-900 dark:group-hover:text-green-300 transition-all duration-200" />
                                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">
                                    {cartItemCount}
                                </span>
                            </button>
                        )}
                        {hasMounted && (
                            <button
                                onClick={toggleTheme}
                                className="flex items-center bg-green-100 dark:bg-gray-700 p-2 rounded-full hover:bg-green-200 dark:hover:bg-gray-600 transition-all duration-200"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <SunIcon className="h-6 w-6 text-green-700" />
                                ) : (
                                    <MoonIcon className="h-6 w-6 text-green-400" />
                                )}
                            </button>
                        )}
                        {hasMounted && isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center gap-2 bg-green-100 dark:bg-gray-700 p-2 rounded-full hover:bg-green-200 dark:hover:bg-gray-600 transition-all duration-200"
                                    aria-label="Profile options"
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="User Avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="h-6 w-6 text-green-700 dark:text-green-400" />
                                    )}
                                </button>
                                {isProfileDropdownOpen && (
                                    <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 border border-green-200 dark:border-gray-700 rounded-xl shadow-lg z-30 mt-1 min-w-[180px]">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 rounded-t-xl transition-all duration-200 text-gray-800 dark:text-gray-200"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/transactions"
                                            className="block px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 text-gray-800 dark:text-gray-200"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            Transactions
                                        </Link>
                                        <Link
                                            href="/wishlist"
                                            className="block px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 text-gray-800 dark:text-gray-200"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            Wishlist
                                        </Link>
                                        <Link
                                            href="/purchase"
                                            className="block px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 text-gray-800 dark:text-gray-200"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            Purchase
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 text-gray-800 dark:text-gray-200"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 rounded-b-xl text-red-500 dark:text-red-400 transition-all duration-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : hasMounted ? (
                            <Link href="/login" className="px-4 py-2 rounded-full bg-green-100 dark:bg-gray-700 text-green-700 dark:text-green-400 font-semibold hover:bg-green-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
                                Login
                            </Link>
                        ) : null}
                    </div>
                </div>
            </header>
            {hasMounted && <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />}
        </>
    );
}
