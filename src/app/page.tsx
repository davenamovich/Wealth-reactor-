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
            🔥 Early Access — First 100 get priority leads
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
            {SITE.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
            {SITE.tagline}
          </p>
          
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Set up 5 passive income streams in 10 minutes. Get your own referral page. 
            Earn 20% L1 + 10% L2 commissions forever.
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

      {/* Income Streams Preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">The 5 Streams</h2>
          <p className="text-center text-gray-500 mb-12">Each one is free to join. You earn from all 5 + referral commissions.</p>
          
          <div className="grid gap-4">
            {STREAMS.map((stream, i) => (
              <div 
                key={stream.id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="text-4xl">{stream.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{stream.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">Free</span>
                  </div>
                  <p className="text-sm text-gray-400">{stream.tagline}</p>
                </div>
                <div className="text-2xl font-black text-gray-700">#{i + 1}</div>
              </div>
            ))}
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
