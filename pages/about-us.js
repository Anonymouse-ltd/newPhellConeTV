import Header from '../components/Header';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';

export default function AboutUs() {
    const { theme } = useTheme();

    const teamMembers = [
        {
            name: "Charles Andrei S. Alarcon",
            position: "Chief Executive Officer",
            quote: "Innovation drives us to connect people with technology seamlessly.",
            image: "/placeholder-image.jpg"
        },
        {
            name: "Ricky Roldan",
            position: "Head of Product Development",
            quote: "Crafting gadgets that inspire is my passion and purpose.",
            image: "/placeholder-image.jpg"
        },
        {
            name: "Shane Nicole Sumat",
            position: "Marketing Director",
            quote: "Building bridges between cutting-edge tech and our customers.",
            image: "/placeholder-image.jpg"
        },
        {
            name: "Jan Gabrielle Intod",
            position: "Customer Experience Manager",
            quote: "Your satisfaction is the heart of everything we do.",
            image: "/placeholder-image.jpg"
        },
        {
            name: "Keon Byerly Hernandez",
            position: "Lead Technical Engineer",
            quote: "Solving tomorrow's problems with today's technology.",
            image: "/placeholder-image.jpg"
        }
    ];

    return (
        <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className={`hover:${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Home</Link>
                    <span className="mx-2">›</span>
                    <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>About Us</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="flex flex-col justify-between">
                        <div>
                            <div className="text-sm font-semibold text-yellow-600 mb-2">How It Started</div>
                            <h1 className={`text-4xl font-bold mb-4 leading-tight ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                Our Dream is<br />Global Gadget Access
                            </h1>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                                Phellcone TV was founded by a team of passionate tech enthusiasts and industry experts. Our mission is to make the latest electronic gadgets accessible to everyone, everywhere. We believe technology should empower and inspire, not intimidate or exclude.
                                <br /><br />
                                With dedication and innovation, we built a platform that connects people to authentic gadgets, trusted brands, and real support. Our journey is driven by a commitment to quality, transparency, and customer satisfaction—because you deserve the best in every device you own.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-5 flex flex-col items-center`}>
                                <div className="text-xl font-bold text-green-700">5+</div>
                                <div className="text-xs text-gray-500 mt-1 text-center">Years Experience</div>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-5 flex flex-col items-center`}>
                                <div className="text-xl font-bold text-green-700">50+</div>
                                <div className="text-xs text-gray-500 mt-1 text-center">Brands Offered</div>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-5 flex flex-col items-center`}>
                                <div className="text-xl font-bold text-green-700">10K+</div>
                                <div className="text-xs text-gray-500 mt-1 text-center">Happy Customers</div>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-5 flex flex-col items-center`}>
                                <div className="text-xl font-bold text-green-700">99%</div>
                                <div className="text-xs text-gray-500 mt-1 text-center">Positive Reviews</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full h-72 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                                src="/placeholder-image.jpg"
                                alt="About Phellcone TV"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                </div>
                <section className="mb-16">
                    <h2 className={`text-2xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Meet the Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamMembers.map((member, index) => (
                            <div key={index} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg overflow-hidden transition transform hover:-translate-y-1 hover:shadow-xl`}>
                                <div className="w-full h-56 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="p-5 text-center">
                                    <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{member.name}</h3>
                                    <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{member.position}</div>
                                    <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>"{member.quote}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
