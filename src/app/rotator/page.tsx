'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RotatorEntry {
  username: string;
  created_at: string;
}

export default function RotatorPage() {
  const [rotator, setRotator] = useState<RotatorEntry[]>([]);
  const [treasury, setTreasury] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isMember, setIsMember] = useState(false);

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
      setTreasury(data.treasury || '');
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
      const res = await fetch('/api/rotator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username,
          txHash: 'beta-free',
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('🎉 ' + data.message);
        setIsMember(true);
        fetchRotator();
      } else {
        setMessage(data.error || 'Failed to join rotator');
      }
    } catch (error) {
      setMessage('Something went wrong');
    }
    setJoining(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">🔄 The Rotator</h1>
          <p className="text-gray-400">
            One-time $20 USDC = Lifetime featured spot. Random visitors see YOUR links.
          </p>
        </div>

        {!username && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
            <div className="text-yellow-400 font-bold mb-2">⚠️ Sign up first</div>
            <p className="text-sm text-gray-400 mb-4">You need a username to join the rotator</p>
            <Link href="/start" className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
              Sign up →
            </Link>
          </div>
        )}

        {/* Join Rotator */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">🚀 Lifetime Access</h2>
              <p className="text-sm text-gray-400">One payment, forever featured</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-green-400">$20</div>
              <div className="text-xs text-gray-500">USDC on Base</div>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('🎉') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {isMember ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">✓</div>
              <div className="text-green-400 font-bold">You're a lifetime member!</div>
              <div className="text-sm text-gray-400 mt-1">
                Your link is in the rotation forever
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Instructions */}
              {treasury && (
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-2">Send $20 USDC (Base) to:</div>
                  <div className="font-mono text-sm text-yellow-400 break-all mb-3">
                    {treasury}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(treasury);
                      setMessage('Address copied!');
                      setTimeout(() => setMessage(''), 2000);
                    }}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    📋 Copy Address
                  </button>
                </div>
              )}

              <button
                onClick={joinRotator}
                disabled={joining || !username}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl disabled:opacity-50"
              >
                {joining ? 'Processing...' : '🎁 Join Free (Beta Launch!)'}
              </button>
              
              <p className="text-xs text-gray-600 text-center">
                Beta users get in free. Payment required after launch.
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4">How The Rotator Works</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-green-400">1.</span>
              <span className="text-gray-400">Pay $20 USDC once (lifetime access)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">2.</span>
              <span className="text-gray-400">Your profile joins the rotation pool</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">3.</span>
              <span className="text-gray-400">Random visitors get redirected to YOUR profile</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">4.</span>
              <span className="text-gray-400">They sign up using YOUR affiliate links</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">5.</span>
              <span className="text-gray-400">You earn commissions forever 💰</span>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Rotator Members</h2>
            <span className="text-sm text-green-400">{rotator.length} lifetime members</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : rotator.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No members yet. Be the first! 🚀
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
