import Link from 'next/link';

export default function GadgetDetailRelated({ relatedGadgets }) {
    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedGadgets.length > 0 ? (
                    relatedGadgets.map(item => (
                        <div key={item.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center h-48">
                            <img
                                src={item.imgSrc || `/${item.brand.toLowerCase()}/${item.name.toLowerCase()}/cover.png`}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded mb-2"
                                onError={(e) => {
                                    e.target.alt = 'Image not available';
                                }}
                            />
                            <div className="font-bold text-gray-900 dark:text-gray-100">{item.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.brand}</div>
                            <Link
                                href={`/gadgets/${item.id}`}
                                className="mt-2 text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm font-semibold"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400 italic">
                            <p>Related Product {i}</p>
                            <p className="text-sm">Coming soon...</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
