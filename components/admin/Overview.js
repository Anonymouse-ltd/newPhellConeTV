export default function Overview({ productsCount, transactionsCount, usersCount, onSectionChange }) {
    return (
        <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Dashboard Overview</h3>
            <p className="text-gray-700 mb-6">Manage your e-commerce platform from here. Use the sidebar to navigate between sections.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
                    <h4 className="text-2xl font-bold text-green-700 mb-2">{productsCount}</h4>
                    <p className="text-gray-600">Total Products</p>
                    <button
                        onClick={() => onSectionChange('products')}
                        className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                    >
                        Manage Products
                    </button>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <h4 className="text-2xl font-bold text-blue-700 mb-2">{transactionsCount}</h4>
                    <p className="text-gray-600">Total Transactions</p>
                    <button
                        onClick={() => onSectionChange('transactions')}
                        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        View Transactions
                    </button>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
                    <h4 className="text-2xl font-bold text-purple-700 mb-2">{usersCount}</h4>
                    <p className="text-gray-600">Total Users</p>
                    <button
                        onClick={() => onSectionChange('users')}
                        className="mt-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
                    >
                        Manage Users
                    </button>
                </div>
            </div>
        </div>
    );
}
