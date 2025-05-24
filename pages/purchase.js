import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Header from '../components/Header';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';
import { toast } from 'react-toastify';

function groupByMonth(transactions) {
    const groups = {};
    transactions.forEach(tx => {
        const date = new Date(tx.order_date);
        const year = date.getFullYear();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const key = `${year}-${month}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
    });
    return groups;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
}

async function fetchOrderDetails(orders) {
    const gadgetDetails = await Promise.all(orders.map(async order => {
        try {
            const id = order.id;
            const gadgetRes = await fetch(`/api/gadget-details/${id}`);
            if (!gadgetRes.ok) return null;
            const gadget = await gadgetRes.json();
            const brand = gadget.brand ? gadget.brand.toLowerCase() : '';
            const name = gadget.name ? gadget.name.toLowerCase() : '';
            const imgRes = await fetch(`/api/get-images?brand=${encodeURIComponent(brand)}&gadgetName=${encodeURIComponent(name)}`);
            let coverImage = '/placeholder-image.jpg';
            if (imgRes.ok) {
                const imgData = await imgRes.json();
                coverImage = imgData.coverImage || '/placeholder-image.jpg';
            }
            return {
                id,
                name: gadget.name || 'Unknown',
                brand: gadget.brand || 'Unknown',
                coverImage,
                color: order.color || 'N/A',
                qty: order.qty || 1
            };
        } catch {
            return null;
        }
    }));
    return gadgetDetails.filter(Boolean);
}

export default function Purchase() {
    const [transactions, setTransactions] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
    const [hasMounted, setHasMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 2;
    const { theme } = useTheme();

    useEffect(() => {
        setHasMounted(true);
        const userId = Cookies.get('userId');
        const authToken = Cookies.get('authToken');
        const loggedIn = !!(userId && authToken);
        setIsLoggedIn(loggedIn);
        if (!loggedIn) {
            toast.error('Please log in to view your purchases.', {
                position: "top-center",
                toastId: "purchase-login-required"
            });
            window.location.href = '/login?redirect=/Purchase';
        }
    }, []);

    useEffect(() => {
        if (hasMounted && isLoggedIn) {
            const userId = Cookies.get('userId');
            if (!userId) return;
            fetch(`/api/transactions/user?userId=${userId}`)
                .then(res => res.json())
                .then(data => setTransactions(data))
                .catch(() => setTransactions([]));
        }
    }, [hasMounted, isLoggedIn]);

    const grouped = groupByMonth(transactions);
    const groupKeys = Object.keys(grouped).sort((a, b) => new Date(b.split('-')[0], new Date(`${b.split('-')[1]} 1`).getMonth()) - new Date(a.split('-')[0], new Date(`${a.split('-')[1]} 1`).getMonth()));
    const totalPages = Math.ceil(groupKeys.length / perPage);
    const paginatedKeys = groupKeys.slice((page - 1) * perPage, page * perPage);

    const handleViewReceipt = async (receipt, orders) => {
        setSelectedReceipt(receipt);
        if (orders && orders.length > 0) {
            let parsedOrders = orders;
            if (typeof orders === 'string') {
                try {
                    parsedOrders = JSON.parse(orders);
                } catch {
                    parsedOrders = [];
                }
            }
            const details = await fetchOrderDetails(parsedOrders);
            setSelectedOrderDetails(details);
        } else {
            setSelectedOrderDetails([]);
        }
    };

    if (!hasMounted) {
        return <div style={{ visibility: 'hidden' }}></div>;
    }

    return (
        <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center text-sm mb-4">
                    <Link href="/" className={`hover:${theme === 'dark' ? 'text-green-400' : 'text-green-700'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>My Purchases</span>
                </div>
                <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>My Purchases</h1>
                {groupKeys.length === 0 ? (
                    <div className={`${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} rounded-2xl shadow-md p-8 text-center`}>
                        <p>No purchases found.</p>
                        <Link href="/" className={`mt-4 inline-block underline ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-900'}`}>
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {paginatedKeys.map(monthKey => (
                            <section key={monthKey}>
                                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{monthKey}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {grouped[monthKey].map(tx => {
                                        let receipt = {};
                                        try {
                                            receipt = typeof tx.receipts === 'string' ? JSON.parse(tx.receipts) : tx.receipts;
                                        } catch {
                                            receipt = {};
                                        }
                                        const items = receipt.items || [];
                                        let orders = tx.orders || [];
                                        if (typeof orders === 'string') {
                                            try { orders = JSON.parse(orders); } catch { orders = []; }
                                        }
                                        return (
                                            <div
                                                key={tx.id}
                                                className={`${theme === 'dark'
                                                    ? 'bg-gray-800 border-gray-700'
                                                    : 'bg-white border-gray-200'} border rounded-2xl shadow-lg p-6 flex flex-col justify-between transition hover:shadow-2xl`}
                                            >
                                                <div>
                                                    <div className={`font-semibold text-lg mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {items.length > 0
                                                            ? items.map(i => i.name).join(', ')
                                                            : 'Purchased Item(s)'}
                                                    </div>
                                                    <div className="text-gray-500 text-sm mb-2">
                                                        {formatDate(tx.order_date)}
                                                    </div>
                                                    <div className="text-gray-500 text-xs mb-2">
                                                        Status: <span className="font-semibold">{tx.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 mt-4">
                                                    <div className={`font-bold text-xl ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>₱{receipt.finalTotal || tx.total_amount}</div>
                                                    <button
                                                        className={`underline font-semibold text-sm ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-900'}`}
                                                        onClick={() => handleViewReceipt(receipt, orders)}
                                                    >
                                                        View Receipt
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                className={`px-4 py-2 rounded ${page === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : theme === 'dark'
                                        ? 'bg-green-700 text-white hover:bg-green-800'
                                        : 'bg-green-700 text-white hover:bg-green-800'}`}
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >Previous</button>
                            <span className={`px-4 py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{page} / {totalPages}</span>
                            <button
                                className={`px-4 py-2 rounded ${page === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : theme === 'dark'
                                        ? 'bg-green-700 text-white hover:bg-green-800'
                                        : 'bg-green-700 text-white hover:bg-green-800'}`}
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >Next</button>
                        </div>
                    </div>
                )}
                {selectedReceipt && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className={`${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-2xl p-8 max-w-lg w-full relative shadow-2xl`}>
                            <button
                                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700"
                                onClick={() => { setSelectedReceipt(null); setSelectedOrderDetails([]); }}
                            >×</button>
                            <div className="mb-4">
                                <div className="text-2xl font-bold mb-2">Receipt</div>
                                <div className="text-gray-700 mb-1">Buyer: <span className="font-semibold">{selectedReceipt.buyerName}</span></div>
                                <div className="text-gray-700 mb-1">Address: <span className="font-semibold">{selectedReceipt.address}</span></div>
                                <div className="text-gray-500 mb-2">{selectedReceipt.timestamp}</div>
                            </div>
                            {selectedOrderDetails.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-base font-semibold mb-2">Items</div>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedOrderDetails.map(item => (
                                            <div key={item.id} className="flex flex-col items-center w-28">
                                                <img src={item.coverImage} alt={item.name} className="w-20 h-20 object-cover rounded mb-1 border" />
                                                <div className="text-xs font-semibold text-center">{item.name}</div>
                                                <div className="text-xs text-gray-500 text-center">{item.brand}</div>
                                                <div className="text-xs text-gray-500 text-center">Color: {item.color}</div>
                                                <div className="text-xs text-gray-500 text-center">Qty: {item.qty}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="border-t border-b py-4 mb-4">
                                {selectedReceipt.items && selectedReceipt.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1">
                                        <div>
                                            <div className="font-semibold">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.brand}</div>
                                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                            <div className="text-xs text-gray-500">Color: {item.color}</div>
                                        </div>
                                        <div className="font-mono">₱{item.total}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1 mb-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₱{selectedReceipt.subtotal}</span>
                                </div>
                                {selectedReceipt.discountApplied && (
                                    <div className="flex justify-between">
                                        <span>Discount ({selectedReceipt.discountType}, 20%):</span>
                                        <span>-₱{selectedReceipt.discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Discounted Total:</span>
                                    <span>₱{selectedReceipt.discountedTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (VAT 12%):</span>
                                    <span>₱{selectedReceipt.taxAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-700 text-lg">
                                    <span>Final Total:</span>
                                    <span>₱{selectedReceipt.finalTotal}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
