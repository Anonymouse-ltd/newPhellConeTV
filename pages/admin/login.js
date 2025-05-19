import { useState } from 'react';
import { useRouter } from 'next/router';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed. Please try again.');
                setLoading(false);
                return;
            }

            localStorage.setItem('adminToken', data.token);
            router.push('/admin/dashboard');
        } catch (err) {
            console.error('Error during login:', err);
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
            <AnimatedBackground />
            <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-sm bg-opacity-90">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="email"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="password"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    <p>© 2025 Phellcone TV Admin. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
