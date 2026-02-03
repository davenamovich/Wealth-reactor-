'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Fetch user data from API
      const res = await fetch(`/api/user/${username.toLowerCase().trim()}`);
      
      if (!res.ok) {
        setError('Username not found. Did you sign up?');
        setLoading(false);
        return;
      }

      const userData = await res.json();

      // Save to localStorage
      localStorage.setItem('wealth_reactor_user', JSON.stringify({
        username: userData.username,
        links: userData.links || {},
        hasPaid: userData.hasPaid || false,
        currentStep: 5, // Completed
      }));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Welcome Back 👋</h1>
          <p className="text-gray-400">Log in to your Wealth Reactor account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Log In →'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="text-gray-600 text-sm">Don't have an account?</div>
          <Link
            href="/start"
            className="block w-full py-3 bg-gray-800 hover:bg-gray-700 font-bold rounded-xl"
          >
            Sign Up →
          </Link>
        </div>

        <Link href="/" className="block text-center mt-8 text-sm text-gray-600 hover:text-white">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
