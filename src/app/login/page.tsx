'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [wallet, setWallet] = useState('');
  const [loginMethod, setLoginMethod] = useState<'username' | 'wallet'>('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userData;
      
      if (loginMethod === 'username') {
        const res = await fetch(`/api/user/${username.toLowerCase().trim()}`);
        if (!res.ok) {
          setError('Username not found. Did you sign up?');
          setLoading(false);
          return;
        }
        userData = await res.json();
      } else {
        // Login by wallet
        const res = await fetch(`/api/user/by-wallet?wallet=${wallet.trim()}`);
        if (!res.ok) {
          setError('Wallet not found. Make sure you linked your wallet during signup.');
          setLoading(false);
          return;
        }
        userData = await res.json();
      }

      // Save to localStorage
      localStorage.setItem('wealth_reactor_user', JSON.stringify({
        username: userData.username,
        links: userData.links || {},
        hasPaid: userData.hasPaid || false,
        wallet: userData.wallet || wallet,
        currentStep: 5,
      }));

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

        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLoginMethod('username')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              loginMethod === 'username' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Username
          </button>
          <button
            onClick={() => setLoginMethod('wallet')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              loginMethod === 'wallet' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Wallet Address
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMethod === 'username' ? (
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
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (loginMethod === 'username' ? !username.trim() : !wallet.trim())}
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
