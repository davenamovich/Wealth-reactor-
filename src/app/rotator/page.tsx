'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

interface RotatorEntry {
  username: string;
  expires_at: string;
}

export default function RotatorPage() {
  const { address, isConnected } = useAccount();
  const [rotator, setRotator] = useState<RotatorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRotator();
    // Load username from localStorage
    const saved = localStorage.getItem('wealth_reactor_user');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || '');
    }
  }, []);

  const fetchRotator = async () => {
    try {
      const res = await fetch('/api/rotator');
      const data = await res.json();
      setRotator(data.rotator || []);
    } catch (error) {
      console.error('Failed to fetch rotator:', error);
    }
    setLoading(false);
  };

  const joinRotator = async () => {
    if (!username) {
      setMessage('Please sign up first to get a username');
      return;
    }

    setJoining(true);
    setMessage('');

    try {
      // For MVP: Just add to rotator (payment integration coming)
      const res = await fetch('/api/rotator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username,
          txHash: 'beta-free', // Placeholder for MVP
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('🎉 You\'re in the rotator for 24 hours!');
        fetchRotator();
      } else {
        setMessage(data.error || 'Failed to join rotator');
      }
    } catch (error) {
      setMessage('Something went wrong');
    }
    setJoining(false);
  };

  const isInRotator = rotator.some(r => r.username === username.toLowerCase());

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">🔄 The Rotator</h1>
          <p className="text-gray-400">
            Pay $20 USDC to get featured for 24 hours. Random visitors see YOUR profile.
          </p>
        </div>

        {/* Wallet Connect */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Wallet</span>
            <ConnectButton />
          </div>
          
          {!username && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
              ⚠️ Sign up first to get your username before joining the rotator
              <Link href="/start" className="block mt-2 underline">
                Sign up →
              </Link>
            </div>
          )}
        </div>

        {/* Join Rotator */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Join the Rotator</h2>
              <p className="text-sm text-gray-400">Get featured to all visitors</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">$20</div>
              <div className="text-xs text-gray-500">for 24 hours</div>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('🎉') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {isInRotator ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-green-400 font-bold">✓ You're in the rotator!</div>
              <div className="text-sm text-gray-400 mt-1">
                Expires: {new Date(rotator.find(r => r.username === username.toLowerCase())?.expires_at || '').toLocaleString()}
              </div>
              <button
                onClick={joinRotator}
                disabled={joining}
                className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
              >
                {joining ? 'Processing...' : 'Extend +24h ($20)'}
              </button>
            </div>
          ) : (
            <button
              onClick={joinRotator}
              disabled={joining || !username}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {joining ? 'Processing...' : '🚀 Join Rotator (Free Beta)'}
            </button>
          )}
          
          <p className="text-xs text-gray-600 text-center mt-3">
            USDC payment on Base coming soon
          </p>
        </div>

        {/* Active Rotator */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Active in Rotator</h2>
            <span className="text-sm text-gray-500">{rotator.length} users</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : rotator.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No one in rotator yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {rotator.map((entry, i) => (
                <div key={entry.username} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <Link href={`/u/${entry.username}`} className="flex items-center gap-3 hover:text-yellow-400">
                    <span className="text-gray-500 text-sm">#{i + 1}</span>
                    <span className="font-medium">@{entry.username}</span>
                  </Link>
                  <span className="text-xs text-gray-600">
                    {Math.ceil((new Date(entry.expires_at).getTime() - Date.now()) / (1000 * 60 * 60))}h left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-white">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
