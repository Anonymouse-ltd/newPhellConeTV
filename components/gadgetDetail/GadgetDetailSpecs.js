export default function GadgetDetailSpecs({ gadget }) {
    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Specifications</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        {gadget.os && <li className="flex items-start gap-2"><span className="w-24 font-medium">OS:</span><span>{gadget.os}</span></li>}
                        {gadget.storage && <li className="flex items-start gap-2"><span className="w-24 font-medium">Storage:</span><span>{gadget.storage}</span></li>}
                        {gadget.ram && <li className="flex items-start gap-2"><span className="w-24 font-medium">RAM:</span><span>{gadget.ram}</span></li>}
                        {gadget.battery && <li className="flex items-start gap-2"><span className="w-24 font-medium">Battery:</span><span>{gadget.battery}</span></li>}
                        {gadget.display && <li className="flex items-start gap-2"><span className="w-24 font-medium">Display:</span><span>{gadget.display}</span></li>}
                        {gadget.processor && <li className="flex items-start gap-2"><span className="w-24 font-medium">Processor:</span><span>{gadget.processor}</span></li>}
                        {gadget.camera && <li className="flex items-start gap-2"><span className="w-24 font-medium">Camera:</span><span>{gadget.camera}</span></li>}
                    </ul>
                    {!gadget.os && !gadget.storage && !gadget.ram && !gadget.battery && !gadget.display && !gadget.processor && !gadget.camera && (
                        <p className="text-gray-500 dark:text-gray-400 italic">No additional specifications available.</p>
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        Discover the {gadget.name} by {gadget.brand}, a cutting-edge device designed to elevate your experience. With top-tier features and premium build quality, this gadget is perfect for tech enthusiasts and everyday users alike. Explore its stunning design and powerful performance today.
                    </p>
                </div>
            </div>
        </div>
    );
}
