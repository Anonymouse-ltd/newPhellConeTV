import ProductForm from '@/components/admin/ProductForm';

export default function Products({ products, isLoadingData, showAddForm, showEditForm, currentProduct, onAddProduct, onEditProduct, onRemoveProduct, onFormClose }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-green-700">Manage Products</h3>
                <button
                    onClick={onAddProduct}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Add Product
                </button>
            </div>
            {(showAddForm || showEditForm) && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-green-700 mb-4">
                        {showAddForm ? 'Add New Product' : 'Edit Product'}
                    </h4>
                    <ProductForm
                        product={showEditForm ? currentProduct : null}
                        onClose={onFormClose}
                        onSuccess={onFormClose}
                    />
                </div>
            )}
            {isLoadingData ? (
                <div className="text-center py-4 text-gray-700">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-4 text-gray-700">No products found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Brand</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{product.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{product.brand}</td>
                                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {typeof product.price === 'string'
                                            ? `₱${parseFloat(product.price.replace(/[^0-9.]/g, '')).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                            : `₱${product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 flex gap-2">
                                        <button
                                            onClick={() => onEditProduct(product.id)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onRemoveProduct(product.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
