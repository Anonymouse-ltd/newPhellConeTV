import { useState, useEffect } from 'react';

export default function Banner() {
    const banners = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg'];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleIndicatorClick = (idx) => setCurrentIndex(idx);

    return (
        <div className="max-w-5xl mx-auto my-8 rounded-3xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.02] bg-gradient-to-r from-green-100 via-white to-blue-100 dark:bg-gradient-to-r dark:from-green-900 dark:via-gray-800 dark:to-blue-900 relative">
            <div className="relative w-full h-64 overflow-hidden">
                {banners.map((banner, idx) => (
                    <img
                        key={idx}
                        src={banner}
                        alt={`Banner ${idx + 1}`}
                        className={`w-full h-full object-cover absolute top-0 left-0 transition-transform duration-700 ease-in-out ${idx === currentIndex
                                ? 'translate-x-0 z-10'
                                : idx < currentIndex
                                    ? '-translate-x-full z-0'
                                    : 'translate-x-full z-0'
                            }`}
                        draggable={false}
                    />
                ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        className={`w-3 h-3 rounded-full focus:outline-none transition-colors duration-300 ${idx === currentIndex ? 'bg-green-600 dark:bg-green-400 scale-110' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        onClick={() => handleIndicatorClick(idx)}
                        aria-label={`Go to banner ${idx + 1}`}
                        style={{ border: 'none', outline: 'none' }}
                    />
                ))}
            </div>
        </div>
    );
}
