'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Log In</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none placeholder-gray-400 italic"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none placeholder-gray-400 italic"
        />
        {error && <p className="text-red-400 mb-4 text-center font-medium">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-cyan-500 text-gray-900 p-3 rounded-lg glow-button hover:bg-cyan-400 transition-colors font-semibold"
        >
          Log In
        </button>
        <p className="mt-4 text-center text-gray-300">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-cyan-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}