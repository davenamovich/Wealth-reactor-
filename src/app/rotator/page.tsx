'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PayButton from '@/components/PayButton';

interface RotatorEntry {
  username: string;
  created_at: string;
}

export default function RotatorPage() {
  const [rotator, setRotator] = useState<RotatorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRotator();
    const saved = localStorage.getItem('wealth_reactor_user');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || '');
    }
  }, []);

  useEffect(() => {
    if (username && rotator.length > 0) {
      setIsMember(rotator.some(r => r.username === username.toLowerCase()));
    }
  }, [username, rotator]);

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

  const handlePaymentSuccess = async () => {
    // Add to rotator
    await fetch('/api/rotator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    
    // Update local storage
    const saved = localStorage.getItem('wealth_reactor_user');
    if (saved) {
      const data = JSON.parse(saved);
      data.hasPaid = true;
      localStorage.setItem('wealth_reactor_user', JSON.stringify(data));
    }
    
    setMessage('🎉 Welcome to the rotator! Your page is now featured.');
    setIsMember(true);
    fetchRotator();
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">🔄 The Rotator</h1>
          <p className="text-gray-400">
            Pay $30 once. Get featured to EVERY visitor. Forever.
          </p>
        </div>

        {!username && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
            <div className="text-yellow-400 font-bold mb-2">⚠️ Create your page first</div>
            <p className="text-sm text-gray-400 mb-4">Set up your free page before joining the rotator</p>
            <Link href="/start" className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
              Create Free Page →
            </Link>
          </div>
        )}

        {/* Join Rotator */}
        {username && (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">🚀 Lifetime Traffic</h2>
                <p className="text-sm text-gray-400">Your page featured to all visitors</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-green-400">$30</div>
                <div className="text-xs text-gray-500">USDC on Base</div>
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-green-500/20 text-green-400">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {isMember ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-green-400 font-bold">You're in the rotator!</div>
                <div className="text-sm text-gray-400 mt-1">
                  Your page is being shown to visitors
                </div>
                <Link href={`/u/${username}`} className="inline-block mt-3 text-sm text-blue-400 hover:underline">
                  View your page →
                </Link>
              </div>
            ) : (
              <PayButton
                username={username}
                onSuccess={handlePaymentSuccess}
                onError={(err) => setError(err)}
              />
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4">What You Get</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">Lifetime spot in the rotator</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">Random visitors land on YOUR page</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">They sign up using YOUR affiliate links</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">You earn commissions from THEIR activity</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">Plus $6 for each referral who joins rotator</span>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Rotator Members</h2>
            <span className="text-sm text-green-400">{rotator.length} members</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : rotator.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-gray-400">No members yet.</div>
              <div className="text-green-400 font-bold">Be the first!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {rotator.map((entry, i) => (
                <div key={entry.username} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <Link href={`/u/${entry.username}`} className="flex items-center gap-3 hover:text-green-400">
                    <span className="text-gray-500 text-sm">#{i + 1}</span>
                    <span className="font-medium">@{entry.username}</span>
                  </Link>
                  <span className="text-xs text-green-500">✓ lifetime</span>
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
