import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';

export default function ContactUs() {
    const { theme } = useTheme();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <div className={`flex flex-col min-h-screen ${hasMounted ? (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50') : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-5xl mx-auto px-4 py-12">
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className={`hover:${hasMounted ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : 'text-green-700'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>Contact Us</span>
                </div>
                <h1 className={`text-3xl font-bold mb-8 ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Contact Us</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} rounded-2xl shadow-md p-8`}>
                        <h2 className={`text-xl font-semibold mb-4 ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Get in Touch</h2>
                        <p className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} mb-6`}>We're here to help with any questions or concerns. Reach out to us through the following methods or send us an email directly.</p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${hasMounted ? (theme === 'dark' ? 'bg-gray-700 text-green-400' : 'bg-gray-100 text-green-700') : 'bg-gray-100 text-green-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`font-medium ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Location</h3>
                                    <p className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>P. Tuazon Blvd, Cubao, Quezon City, Metro Manila</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${hasMounted ? (theme === 'dark' ? 'bg-gray-700 text-green-400' : 'bg-gray-100 text-green-700') : 'bg-gray-100 text-green-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`font-medium ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Email</h3>
                                    <p className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>phellconetv@support.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${hasMounted ? (theme === 'dark' ? 'bg-gray-700 text-green-400' : 'bg-gray-100 text-green-700') : 'bg-gray-100 text-green-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h5c0-1.333.78-2 2-2s2 .667 2 2h5a2 2 0 012 2v2c0 .667-.4 1.6-1.2 2.4a16.64 16.64 0 01-3.3 2.867C10.52 14.89 9 16 7 16c-1.6 0-2.933-.478-4.4-1.867A16.64 16.64 0 011.2 9.4C.4 8.533 0 7.6 0 6.999V5zm3.283 3.805A11.593 11.593 0 017 11c1.402 0 2.48-.43 3.172-1.195a13.403 13.403 0 001.545-1.58c.464-.566.748-1.284.748-2.225 0-.862-.33-1.58-.988-2.153-.384-.336-.847-.502-1.384-.502-1.17 0-1.993.758-2.467 2.274-.204.65-.31 1.376-.31 2.227 0 .78.139 1.533.416 2.246.314.809.48 1.67.48 2.582 0 1.489-.615 2.582-1.845 3.28-1.431.813-2.981 1.22-4.521 1.22-1.792 0-3.52-.541-5.178-1.622-1.417-.922-2.524-2.181-3.32-3.777-.708-1.414-1.06-2.95-1.06-4.608 0-1.537.392-2.952 1.175-4.244 1.009-1.66 2.392-2.981 4.148-3.963 1.915-1.067 4.073-1.6 6.474-1.6 1.793 0 3.53.36 5.271 1.08 1.74.718 3.248 1.703 4.524 2.952 1.276 1.249 2.283 2.703 3.02 4.363.737 1.659 1.106 3.437 1.106 5.336 0 1.793-.392 3.493-1.175 5.1-.783 1.606-1.845 2.985-3.187 4.136-1.341 1.15-2.882 2.049-4.622 2.696-1.739.646-3.587.97-5.543.97-2.222 0-4.336-.494-6.341-1.483-1.432-.707-2.758-1.658-3.98-2.852a13.45 13.45 0 01-2.768-3.364 12.134 12.134 0 01-1.788-4.244c-.428-1.538-.428-3.129 0-4.672.429-1.544 1.217-2.989 2.365-4.335 1.147-1.347 2.521-2.417 4.122-3.21 1.6-.794 3.319-1.19 5.156-1.19 1.793 0 3.493.392 5.1 1.175 1.606.783 2.985 1.845 4.136 3.187 1.15 1.341 2.049 2.882 2.696 4.622.646 1.739.97 3.587.97 5.543 0 2.222-.494 4.336-1.483 6.341-.707 1.432-1.658 2.758-2.852 3.98a13.45 13.45 0 01-3.364 2.768 12.134 12.134 0 01-4.244 1.788c-1.538.428-3.129.428-4.672 0-1.544-.429-2.989-1.217-4.335-2.365-1.347-1.147-2.417-2.521-3.21-4.122-.794-1.6-1.19-3.319-1.19-5.156 0-1.793.392-3.493 1.175-5.1 1.66-3.317 4.603-5.491 8.244-6.275 1.022-.222 2.099-.333 3.232-.333 1.793 0 3.493.392 5.1 1.175 1.606.783 2.985 1.845 4.136 3.187 1.15 1.341 2.049 2.882 2.696 4.622.646 1.739.97 3.587.97 5.543 0 2.222-.494 4.336-1.483 6.341-.707 1.432-1.658 2.758-2.852 3.98a13.45 13.45 0 01-3.364 2.768c-1.237.616-2.556.924-3.956.924-1.17 0-2.267-.247-3.29-.74-1.023-.494-1.917-1.176-2.683-2.046-.765-.87-1.368-1.891-1.808-3.063-.44-1.172-.66-2.416-.66-3.732 0-1.793.392-3.493 1.175-5.1 1.66-3.317 4.603-5.491 8.244-6.275.444-.096.89-.144 1.337-.144z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`font-medium ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Phone</h3>
                                    <p className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>+63 123 456 7890</p>
                                </div>
                            </div>
                        </div>
                        <a
                            href="mailto:phellconetv@support.com"
                            className={`mt-6 inline-block w-full text-center py-3 rounded-lg text-white font-semibold transition-all duration-200 ${hasMounted ? (theme === 'dark' ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700') : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            Contact Support
                        </a>
                    </div>
                    <div className={`${hasMounted ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : 'bg-white'} rounded-2xl shadow-md p-8`}>
                        <h2 className={`text-xl font-semibold mb-4 ${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'}`}>Business Hours</h2>
                        <p className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'} mb-6`}>Our team is available during the following hours. For urgent matters, please email us.</p>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>Monday - Friday</span>
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>Saturday</span>
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>Sunday & Holidays</span>
                                <span className={`${hasMounted ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : 'text-gray-900'} font-medium`}>Closed</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className={`text-sm font-medium mb-2 ${hasMounted ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'}`}>Customer Support</h3>
                            <p className={`text-sm ${hasMounted ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>For immediate assistance, our support team is just an email away. We strive to respond within 24-48 hours.</p>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
