export default function Sidebar({ activeSection, onSectionChange, onLogout }) {
    return (
        <aside className="bg-white w-64 h-screen p-5 border-r border-gray-200 flex flex-col">
            <div className="mb-8 flex flex-col items-center">
                <img src="/logo.svg" alt="Phellcone TV Logo" className="h-20 w-auto mb-2" />
                <h1 className="text-xl font-bold text-green-700">Admin Dashboard</h1>
            </div>
            <nav className="space-y-1 flex-1">
                <button
                    onClick={() => onSectionChange('overview')}
                    className={`w-full text-left px-4 py-3 rounded ${activeSection === 'overview' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => onSectionChange('products')}
                    className={`w-full text-left px-4 py-3 rounded ${activeSection === 'products' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Products
                </button>
                <button
                    onClick={() => onSectionChange('transactions')}
                    className={`w-full text-left px-4 py-3 rounded ${activeSection === 'transactions' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => onSectionChange('users')}
                    className={`w-full text-left px-4 py-3 rounded ${activeSection === 'users' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Users
                </button>
                <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded mt-2"
                >
                    Logout
                </button>
            </nav>
        </aside>
    );
}
