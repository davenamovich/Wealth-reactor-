'use client';

import { useState } from 'react';
import { SITE, STREAMS, PRICING } from '@/lib/config';
import Link from 'next/link';

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-block px-4 py-1 mb-6 text-sm font-mono bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            🔄 The Rotator — Pay Once, Get Traffic Forever
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-transparent bg-clip-text">
            {SITE.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
            $30 gets you in the rotator. Your affiliate links shown to EVERY visitor. Forever.
          </p>
          
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Set up 5 crypto income streams. Join the rotator. Random visitors see YOUR page.
            Plus earn $6 per referral + $3 from their referrals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/start"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              Get Access — ${PRICING.accessFee}
            </Link>
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-xl transition-all"
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-black text-green-400">5</div>
              <div className="text-xs text-gray-500 uppercase">Income Streams</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400">20%</div>
              <div className="text-xs text-gray-500 uppercase">L1 Commission</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-400">10%</div>
              <div className="text-xs text-gray-500 uppercase">L2 Commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {showDemo && (
        <section className="py-16 px-6 bg-gradient-to-b from-black to-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  💳
                </div>
                <h3 className="font-bold mb-2">1. Pay Once</h3>
                <p className="text-sm text-gray-400">
                  ${PRICING.accessFee} unlocks lifetime access to all 5 income streams + your own referral page.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  🔗
                </div>
                <h3 className="font-bold mb-2">2. Set Up Links</h3>
                <p className="text-sm text-gray-400">
                  Sign up for each platform and save YOUR referral links. Takes ~10 minutes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  💰
                </div>
                <h3 className="font-bold mb-2">3. Share & Earn</h3>
                <p className="text-sm text-gray-400">
                  Share your page. Earn 20% when referrals pay, 10% when their referrals pay.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Income Streams - LIVE LINKS */}
      <section className="py-16 px-6 bg-gradient-to-b from-black to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">🚀 Start Earning Now</h2>
          <p className="text-center text-gray-400 mb-8">Click any stream below to sign up FREE and start earning crypto</p>
          
          <div className="grid gap-4">
            {STREAMS.map((stream) => (
              <a 
                key={stream.id}
                href={stream.defaultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-green-500/50 hover:from-green-500/10 hover:to-emerald-500/10 transition-all group"
              >
                <div className="text-5xl">{stream.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">{stream.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">FREE</span>
                  </div>
                  <p className="text-sm text-gray-400">{stream.tagline}</p>
                  {stream.promoCode && (
                    <p className="text-xs text-yellow-400 mt-1">Code: {stream.promoCode}</p>
                  )}
                </div>
                <div className="text-green-400 text-2xl group-hover:translate-x-1 transition-transform">→</div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">Want your OWN referral page with YOUR links?</p>
            <Link
              href="/start"
              className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Create Your Free Page →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Ready to Start?</h2>
          <p className="text-gray-400 mb-8">
            One payment. Five income streams. Unlimited referral earnings.
          </p>
          <Link
            href="/start"
            className="inline-block px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            Get Started — ${PRICING.accessFee}
          </Link>
          <p className="mt-4 text-xs text-gray-600">
            Powered by USDC on Base • Instant access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <span>© 2026 {SITE.name}</span>
          <div className="flex gap-4">
            <Link href="/api/docs" className="hover:text-white">API</Link>
            <a href="https://www.thebtcexperiment.com/trenches?ref=BTCEXP1" target="_blank" rel="noopener" className="hover:text-white">BTC Experiment</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
// Tue Feb  3 13:22:49 UTC 2026
