import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-toastify';
import AnimatedBackground from '@/components/AnimatedBackground';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { redirect } = router.query; // Get redirect parameter from URL query

  useEffect(() => {
    // Check if user is already logged in
    const userId = Cookies.get('userId');
    const authToken = Cookies.get('authToken');
    if (userId && authToken) {
      toast.info('You are already logged in.', {
        position: "top-center",
        toastId: "already-logged-in"
      });
      router.push(redirect || '/');
    }
  }, [redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'An error occurred. Please try again.';
        toast.error(errorMessage, {
          position: "top-center",
          toastId: "login-error"
        });
      } else {
        const secretKey = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'my-secret-key-1234567890123456';
        const encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(data.user), secretKey).toString();
        Cookies.set('authToken', encryptedToken, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('userId', data.user.id.toString(), { expires: 7, secure: true, sameSite: 'Strict' });
        toast.success('Login successful! Welcome back.', {
          position: "top-center",
          toastId: "login-success"
        });
        // Redirect to the specified page from query parameter or default to home
        router.push(redirect || '/');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        position: "top-center",
        toastId: "login-error-catch"
      });
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      <Head>
        <title>Login - Phellcone TV</title>
      </Head>
      <AnimatedBackground />
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-sm bg-opacity-90">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
              htmlFor="password"
              className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="current-password"
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
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
          <p className="mt-2">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
