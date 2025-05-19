import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        brand: '',
        name: '',
        price: '',
        os: '',
        color: '',
        storage: '',
        ram: '',
        battery: '',
        display: '',
        processor: '',
        camera: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                brand: product.brand || '',
                name: product.name || '',
                price: product.price || '',
                os: product.os || '',
                color: product.color || '',
                storage: product.storage || '',
                ram: product.ram || '',
                battery: product.battery || '',
                display: product.display || '',
                processor: product.processor || '',
                camera: product.camera || ''
            });
        }
    }, [product]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = product ? `/api/edit-product/${product.id}` : '/api/add-product';
            const method = product ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error(product ? 'Failed to update product' : 'Failed to add product');
            }
            onSuccess();
            onClose();
            toast.success(product ? 'Product updated successfully.' : 'Product added successfully.', {
                position: "top-center",
            });
        } catch (error) {
            console.error(product ? 'Error updating product:' : 'Error adding product:', error);
            toast.error(product ? 'Failed to update product.' : 'Failed to add product.', {
                position: "top-center",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Brand</label>
                <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Price (₱)</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">OS</label>
                <input
                    type="text"
                    name="os"
                    value={formData.os}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Color</label>
                <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Storage</label>
                <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">RAM</label>
                <input
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Battery</label>
                <input
                    type="text"
                    name="battery"
                    value={formData.battery}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Display</label>
                <input
                    type="text"
                    name="display"
                    value={formData.display}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Processor</label>
                <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1 font-medium">Camera</label>
                <input
                    type="text"
                    name="camera"
                    value={formData.camera}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    {product ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </form>
    );
}
