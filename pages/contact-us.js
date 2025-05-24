import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';
import Header from '../components/Header';

export default function ContactUs() {
    const { theme } = useTheme();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <div style={{ visibility: 'hidden' }}></div>;
    }

    return (
        <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-5xl mx-auto px-4 py-12">
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className={`hover:${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Contact Us</span>
                </div>
                <h1 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Contact Us</h1>
                <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>We'd love to hear from you! Whether you have a question about our products, need assistance, or just want to share feedback, feel free to reach out.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                        <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Get in Touch</h2>
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fill out the form below, and we'll get back to you as soon as possible.</p>
                        <form>
                            <div className="mb-4">
                                <label htmlFor="name" className={`block mb-1 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Name</label>
                                <input type="text" id="name" className={`w-full p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`} required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className={`block mb-1 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
                                <input type="email" id="email" className={`w-full p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`} required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="message" className={`block mb-1 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Message</label>
                                <textarea id="message" rows="4" className={`w-full p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`} required></textarea>
                            </div>
                            <button type="submit" className={`w-full py-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>Send Message</button>
                        </form>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                        <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Contact Information</h2>
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>You can also reach us directly through the following channels:</p>
                        <ul className="space-y-4">
                            <li className="flex items-center">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-600'}`}>📧</span>
                                <a href="mailto:support@phellcone.com" className={`hover:underline ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>support@phellcone.com</a>
                            </li>
                            <li className="flex items-center">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-600'}`}>📞</span>
                                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>+639 1234 56789</span>
                            </li>
                            <li className="flex items-center">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-600'}`}>🏢</span>
                                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>P. Tuazon Blvd, Cubao, Quezon City, Metro Manila</span>
                            </li>
                        </ul>
                        <p className={`mt-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Our team is available Monday to Friday, 9:00 AM to 5:00 PM (PST). We aim to respond to all inquiries within 24-48 hours.</p>
                    </div>
                </div>
            </main>
            <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
