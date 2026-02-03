'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { STREAMS, SITE } from '@/lib/config';
import Link from 'next/link';

interface UserProfile {
  username: string;
  links: Record<string, string>;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/user/${username}`);
        if (!res.ok) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProfile(data);
      } catch {
        setError('Failed to load profile');
      }
      setLoading(false);
    };

    if (username) {
      loadProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This profile doesn\'t exist.'}</p>
          <Link href="/start" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
            Create Your Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-6 px-6 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            {SITE.name}
          </Link>
          <Link 
            href={`/start?ref=${username}`}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm"
          >
            Join Now
          </Link>
        </div>
      </header>

      {/* Profile */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* User Info */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-black text-black">
              {username.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-black">@{username}</h1>
            <p className="text-gray-400">Wealth Reactor Member</p>
          </div>

          {/* Streams */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
              💰 Income Streams
            </h2>
            
            {STREAMS.map((stream) => {
              const userLink = profile.links[stream.id] || stream.defaultUrl;
              
              return (
                <a
                  key={stream.id}
                  href={userLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-xl border border-gray-700 hover:border-gray-600 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{stream.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg group-hover:text-yellow-400 transition-colors">
                        {stream.name}
                      </h3>
                      <p className="text-sm text-gray-400">{stream.tagline}</p>
                    </div>
                    <div className="text-gray-600 group-hover:text-white transition-colors">
                      →
                    </div>
                  </div>
                  
                  {stream.promoCode && profile.links[stream.id]?.includes(stream.promoCode) && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-xs text-gray-500">Promo: </span>
                      <span className="font-mono text-yellow-400">{stream.promoCode}</span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">Want your own income streams?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Set up 5 passive income sources in 10 minutes.
            </p>
            <Link
              href={`/start?ref=${username}`}
              className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-600">
          Powered by <Link href="/" className="text-yellow-400 hover:underline">{SITE.name}</Link>
        </div>
      </footer>
    </main>
  );
}
