export default function GadgetDetailInfo({
    gadget,
    formattedPrice,
    colors,
    selectedColor,
    selectedColorObj,
    quantity,
    handleColorSelect,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    handleWishlistToggle,
    isInWishlist,
    getBackgroundColor
}) {
    const isOutOfStock = selectedColorObj.stock === 0 || selectedColorObj.stock === '0'; // Ensure string '0' is handled

    // Debug log to check stock value
    console.log(`Selected Color: ${selectedColor}, Stock: ${selectedColorObj.stock}, Is Out of Stock: ${isOutOfStock}`);

    return (
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
                                disabled={false} // Allow selection even if stock is 0
                            >
                                <span
                                    className="inline-block w-4 h-4 rounded-full border mr-2"
                                    style={{
                                        backgroundColor: getBackgroundColor(color),
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
                    disabled={isOutOfStock}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isOutOfStock ? 'Out of stock' : `Max: ${selectedColorObj.stock}`}
                </span>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 rounded-lg text-white text-lg font-semibold flex items-center justify-center transition-all duration-200 ${isOutOfStock
                            ? 'bg-red-600 dark:bg-red-700 cursor-not-allowed'
                            : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'
                        }`}
                    disabled={isOutOfStock || quantity < 1}
                >
                    {isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
                </button>
                <button
                    onClick={handleBuyNow}
                    className={`px-4 py-3 rounded-lg text-white text-lg font-semibold transition-all duration-200 ${isOutOfStock
                            ? 'bg-red-600 dark:bg-red-700 cursor-not-allowed'
                            : 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-500'
                        }`}
                    disabled={isOutOfStock || quantity < 1}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
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
    );
}
