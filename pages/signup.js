import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-toastify';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function SignUp() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (pwd) => {
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasDigit = /[0-9]/.test(pwd);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const hasMinLength = pwd.length >= 8;
        return hasUpperCase && hasDigit && hasSpecialChar && hasMinLength;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== retypePassword) {
            toast.error('Passwords do not match.', {
                position: "top-center",
                toastId: "signup-password-mismatch"
            });
            setIsLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            toast.error('Password must be at least 8 characters long and include an uppercase letter, a digit, and a special character.', {
                position: "top-center",
                toastId: "signup-password-invalid"
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, email, birthdate, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || 'An error occurred. Please try again.';
                toast.error(errorMessage, {
                    position: "top-center",
                    toastId: "signup-error"
                });
            } else {
                toast.success('Sign up successful! You can now log in.', {
                    position: "top-center",
                    toastId: "signup-success"
                });
                router.push('/login');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.', {
                position: "top-center",
                toastId: "signup-error-catch"
            });
            console.error('Error during signup:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
            <Head>
                <title>Sign Up - Phellcone TV</title>
            </Head>
            <AnimatedBackground />
            <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-sm bg-opacity-90">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="name"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="name"
                        />
                    </div>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="username"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="off"
                        />
                    </div>
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
                        />
                    </div>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="birthdate"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Birthdate
                        </label>
                        <input
                            type="date"
                            id="birthdate"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="password"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoComplete="new-password"
                            />
                            {password && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col relative">
                        <label
                            htmlFor="retypePassword"
                            className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
                        >
                            Retype Password
                        </label>
                        <div className="relative">
                            <input
                                type={showRetypePassword ? 'text' : 'password'}
                                id="retypePassword"
                                placeholder="Retype your password"
                                value={retypePassword}
                                onChange={(e) => setRetypePassword(e.target.value)}
                                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoComplete="new-password"
                            />
                            {retypePassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowRetypePassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showRetypePassword ? 'Hide password' : 'Show password'}
                                >
                                    {showRetypePassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
