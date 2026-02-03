'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STREAMS, PRICING } from '@/lib/config';

interface UserData {
  username: string;
  links: Record<string, string>;
  hasPaid: boolean;
  currentStep: number;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    l1Referrals: 0,
    l2Referrals: 0,
    totalEarned: 0,
    pendingPayout: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('wealth_reactor_user');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const copyLink = () => {
    if (userData) {
      navigator.clipboard.writeText(`${window.location.origin}/u/${userData.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = () => {
    if (userData && navigator.share) {
      navigator.share({
        title: 'Wealth Reactor',
        text: '5 income streams, one link. Join me!',
        url: `${window.location.origin}/u/${userData.username}`,
      });
    } else {
      copyLink();
    }
  };

  if (!userData) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black mb-4">Not Logged In</h1>
          <p className="text-gray-400 mb-6">You need to sign up first.</p>
          <Link
            href="/start"
            className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl"
          >
            Get Started →
          </Link>
        </div>
      </main>
    );
  }

  const completedStreams = Object.keys(userData.links).length;
  const l1Earnings = stats.l1Referrals * PRICING.accessFee * PRICING.l1Commission;
  const l2Earnings = stats.l2Referrals * PRICING.accessFee * PRICING.l2Commission;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">Dashboard</h1>
            <p className="text-gray-400">@{userData.username}</p>
          </div>
          <Link
            href={`/u/${userData.username}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            View Public Page
          </Link>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
          <div className="text-sm text-yellow-400 mb-2">Your Referral Link</div>
          <div className="flex gap-2 mb-4">
            <input
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${userData.username}`}
              className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <button
            onClick={shareLink}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl"
          >
            📤 Share Link
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-green-400">{stats.l1Referrals}</div>
            <div className="text-sm text-gray-400">Direct Referrals (L1)</div>
            <div className="text-xs text-gray-600 mt-1">${l1Earnings.toFixed(2)} earned</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-blue-400">{stats.l2Referrals}</div>
            <div className="text-sm text-gray-400">Network Referrals (L2)</div>
            <div className="text-xs text-gray-600 mt-1">${l2Earnings.toFixed(2)} earned</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-yellow-400">${(l1Earnings + l2Earnings).toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-purple-400">{completedStreams}/5</div>
            <div className="text-sm text-gray-400">Streams Active</div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="text-sm font-bold mb-3">Commission Structure</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">L1 (Direct)</span>
              <span className="text-green-400">{PRICING.l1Commission * 100}% = ${PRICING.accessFee * PRICING.l1Commission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">L2 (Network)</span>
              <span className="text-blue-400">{PRICING.l2Commission * 100}% = ${PRICING.accessFee * PRICING.l2Commission}</span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
              <span className="text-gray-400">Access Fee</span>
              <span className="text-white">${PRICING.accessFee} USDC</span>
            </div>
          </div>
        </div>

        {/* Your Streams */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="text-sm font-bold mb-3">Your Income Streams</div>
          <div className="space-y-3">
            {STREAMS.map((stream) => {
              const userLink = userData.links[stream.id];
              const isDefault = userLink === stream.defaultUrl;
              return (
                <div key={stream.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stream.icon}</span>
                    <div>
                      <div className="font-medium">{stream.name}</div>
                      <div className="text-xs text-gray-500">
                        {userLink ? (isDefault ? 'Using default link' : 'Custom link set') : 'Not configured'}
                      </div>
                    </div>
                  </div>
                  {userLink ? (
                    <span className="text-green-400 text-sm">✓ Active</span>
                  ) : (
                    <Link href="/start" className="text-yellow-400 text-sm">Setup →</Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/start"
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-center font-bold rounded-xl"
          >
            Edit Streams
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('wealth_reactor_user');
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-red-900/50 hover:bg-red-900 text-red-400 font-bold rounded-xl"
          >
            Logout
          </button>
        </div>

        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-white">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
