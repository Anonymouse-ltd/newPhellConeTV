import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '@/components/admin/Sidebar';
import Overview from '@/components/admin/Overview';
import Products from '@/components/admin/Products';
import Transactions from '@/components/admin/Transactions';
import Users from '@/components/admin/Users';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
            setLoading(false);
            fetchProducts();
            fetchTransactions();
            fetchUsers();
        }
    }, [router]);

    const fetchProducts = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch('/api/gadgets');
            if (!res.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products.', {
                position: "top-center",
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchTransactions = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch('/api/transactions');
            if (!res.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions.', {
                position: "top-center",
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users.', {
                position: "top-center",
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        if (section === 'products' && products.length === 0) {
            fetchProducts();
        } else if (section === 'transactions' && transactions.length === 0) {
            fetchTransactions();
        } else if (section === 'users' && users.length === 0) {
            fetchUsers();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast.success('Logged out successfully.', {
            position: "top-center",
        });
        router.push('/admin/login');
    };

    const handleAddProduct = () => {
        setShowAddForm(true);
    };

    const handleEditProduct = async (id) => {
        try {
            const res = await fetch(`/api/gadget-details/${id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch product details');
            }
            const data = await res.json();
            setCurrentProduct(data);
            setShowEditForm(true);
        } catch (error) {
            console.error('Error fetching product for edit:', error);
            toast.error('Failed to load product details.', {
                position: "top-center",
            });
        }
    };

    const handleRemoveProduct = async (id) => {
        if (confirm('Are you sure you want to remove this product?')) {
            try {
                const res = await fetch(`/api/remove-product/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    throw new Error('Failed to remove product');
                }
                setProducts(products.filter(product => product.id !== id));
                toast.success('Product removed successfully.', {
                    position: "top-center",
                });
            } catch (error) {
                console.error('Error removing product:', error);
                toast.error('Failed to remove product.', {
                    position: "top-center",
                });
            }
        }
    };

    const handleFormClose = () => {
        setShowAddForm(false);
        setShowEditForm(false);
        setCurrentProduct(null);
        fetchProducts();
    };

    if (loading) {
        return <div className="text-center py-10 text-lg text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} onLogout={handleLogout} />
            <div className="flex-1 ml-64">
                <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
                    <h1 className="text-xl font-bold text-green-700 dark:text-green-400">
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </h1>
                </header>
                <main className="max-w-6xl mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-400">Welcome, Admin</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
                        {activeSection === 'overview' && (
                            <Overview
                                productsCount={products.length}
                                transactionsCount={transactions.length}
                                usersCount={users.length}
                                onSectionChange={handleSectionChange}
                            />
                        )}
                        {activeSection === 'products' && (
                            <Products
                                products={products}
                                isLoadingData={isLoadingData}
                                showAddForm={showAddForm}
                                showEditForm={showEditForm}
                                currentProduct={currentProduct}
                                onAddProduct={handleAddProduct}
                                onEditProduct={handleEditProduct}
                                onRemoveProduct={handleRemoveProduct}
                                onFormClose={handleFormClose}
                            />
                        )}
                        {activeSection === 'transactions' && (
                            <Transactions transactions={transactions} isLoadingData={isLoadingData} />
                        )}
                        {activeSection === 'users' && (
                            <Users users={users} isLoadingData={isLoadingData} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
