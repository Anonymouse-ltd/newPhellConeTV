import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        brand: '',
        name: '',
        price: '',
        os: '',
        colors: [{ color: '', stock: '' }],
        storage: '',
        ram: '',
        battery: '',
        display: '',
        processor: '',
        camera: ''
    });

    useEffect(() => {
        if (product) {
            let colorsData = [{ color: '', stock: '' }];
            try {
                if (product.colors && typeof product.colors === 'string') {
                    colorsData = JSON.parse(product.colors) || [{ color: '', stock: '' }];
                } else if (Array.isArray(product.colors)) {
                    colorsData = product.colors.length > 0 ? product.colors : [{ color: '', stock: '' }];
                } else if (product.color) {
                    colorsData = [{ color: product.color, stock: '' }];
                }
            } catch (e) {
                console.error('Error parsing colors:', e);
            }
            setFormData({
                brand: product.brand || '',
                name: product.name || '',
                price: product.price || '',
                os: product.os || '',
                colors: colorsData,
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

    const handleColorChange = (e, index) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedColors = [...prev.colors];
            updatedColors[index][name] = value;
            return { ...prev, colors: updatedColors };
        });
    };

    const handleAddColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, { color: '', stock: '' }]
        }));
    };

    const handleRemoveColor = (index) => {
        setFormData(prev => {
            const updatedColors = prev.colors.filter((_, i) => i !== index);
            return { ...prev, colors: updatedColors.length > 0 ? updatedColors : [{ color: '', stock: '' }] };
        });
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
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Brand</label>
                <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Price (₱)</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">OS</label>
                <input
                    type="text"
                    name="os"
                    value={formData.os}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Colors & Stock</label>
                {formData.colors.map((colorData, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                        <input
                            type="text"
                            name="color"
                            value={colorData.color}
                            onChange={(e) => handleColorChange(e, index)}
                            placeholder="Color (e.g., White)"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                        <input
                            type="number"
                            name="stock"
                            value={colorData.stock}
                            onChange={(e) => handleColorChange(e, index)}
                            placeholder="Stock"
                            className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            min="0"
                        />
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveColor(index)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddColor}
                    className="mt-2 bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                >
                    + Add Color
                </button>
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Storage</label>
                <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">RAM</label>
                <input
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Battery</label>
                <input
                    type="text"
                    name="battery"
                    value={formData.battery}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Display</label>
                <input
                    type="text"
                    name="display"
                    value={formData.display}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Processor</label>
                <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Camera</label>
                <input
                    type="text"
                    name="camera"
                    value={formData.camera}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 transition"
                >
                    {product ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </form>
    );
}
