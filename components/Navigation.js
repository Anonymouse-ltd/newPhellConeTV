import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const BRANDS = ['Weihua', 'Smasnug', 'Xiaomai', 'Popo', 'Papple'];

export default function Navigation({ selectedBrand, onBrandChange }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
        <nav className="flex justify-center gap-8 py-3 font-medium text-green-700 dark:text-green-400 bg-white/90 dark:bg-gray-900/90 shadow-sm mb-4 relative z-20">
            <div className="relative">
                <button
                    className="capitalize hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-1 transition-all duration-200"
                    onClick={toggleDropdown}
                >
                    {selectedBrand === 'All' ? 'All Brands' : selectedBrand}
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 border border-green-200 dark:border-gray-700 rounded-xl shadow-lg z-20 mt-1 min-w-[160px] max-h-96 overflow-y-auto">
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-t-xl transition-all duration-200 text-green-700 dark:text-green-400"
                            onClick={() => {
                                onBrandChange('All');
                                setIsDropdownOpen(false);
                            }}
                        >
                            All Brands
                        </button>
                        {BRANDS.map((brand) => (
                            <button
                                key={brand}
                                className="block w-full text-left px-4 py-2 hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200 text-green-700 dark:text-green-400"
                                onClick={() => {
                                    onBrandChange(brand);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <a href="#" className="capitalize hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-gray-800 px-4 py-2 rounded-full transition-all duration-200">Contact Us</a>
            <a href="#" className="capitalize hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-gray-800 px-4 py-2 rounded-full transition-all duration-200">About Us</a>
        </nav>
    );
}
