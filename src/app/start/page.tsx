'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { STREAMS, PRICING } from '@/lib/config';
import Link from 'next/link';

interface UserData {
  username: string;
  links: Record<string, string>;
  hasPaid: boolean;
  currentStep: number;
}

function StartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');
  
  const [step, setStep] = useState<'username' | 'payment' | 'setup' | 'complete'>('username');
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentStream, setCurrentStream] = useState(0);
  const [linkInput, setLinkInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('wealth_reactor_user');
    if (saved) {
      const data = JSON.parse(saved) as UserData;
      setUserData(data);
      setUsername(data.username);
      if (data.hasPaid) {
        // If all streams are done, go to complete
        if (data.currentStep >= STREAMS.length) {
          setStep('complete');
        } else {
          setStep('setup');
          setCurrentStream(data.currentStep || 0);
        }
      } else {
        setStep('payment');
      }
    }
  }, []);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/user/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase(), ref }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Username taken');
        setLoading(false);
        return;
      }

      const newUserData: UserData = {
        username: username.toLowerCase(),
        links: {},
        hasPaid: false,
        currentStep: 0,
      };
      setUserData(newUserData);
      localStorage.setItem('wealth_reactor_user', JSON.stringify(newUserData));
      setStep('payment');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      setError('Enter your wallet address first');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: userData!.username,
          walletAddress,
        }),
      });
      
      const data = await res.json();
      
      if (data.verified) {
        const updated = { ...userData!, hasPaid: true };
        setUserData(updated);
        localStorage.setItem('wealth_reactor_user', JSON.stringify(updated));
        setStep('setup');
      } else {
        setError('Payment not found. Make sure you sent $30 USDC on Base to the treasury address.');
      }
    } catch (err) {
      setError('Verification failed. Try again.');
    }
    setVerifying(false);
  };

  const handleSaveLink = () => {
    const stream = STREAMS[currentStream];
    
    if (!linkInput.trim()) {
      setError('Please enter your referral link');
      return;
    }

    const newLinks = { ...userData!.links, [stream.id]: linkInput.trim() };
    const nextStep = currentStream + 1;
    
    const updated: UserData = {
      ...userData!,
      links: newLinks,
      currentStep: nextStep,
    };
    
    setUserData(updated);
    localStorage.setItem('wealth_reactor_user', JSON.stringify(updated));
    setLinkInput('');
    setError('');

    if (nextStep >= STREAMS.length) {
      // Save user data
      fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      // Add to rotator
      fetch('/api/rotator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: updated.username }),
      });
      setStep('complete');
    } else {
      setCurrentStream(nextStep);
    }
  };

  const skipStream = () => {
    const stream = STREAMS[currentStream];
    const newLinks = { ...userData!.links, [stream.id]: stream.defaultUrl };
    const nextStep = currentStream + 1;
    
    const updated: UserData = {
      ...userData!,
      links: newLinks,
      currentStep: nextStep,
    };
    
    setUserData(updated);
    localStorage.setItem('wealth_reactor_user', JSON.stringify(updated));
    setLinkInput('');

    if (nextStep >= STREAMS.length) {
      // Save user data
      fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      // Add to rotator
      fetch('/api/rotator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: updated.username }),
      });
      setStep('complete');
    } else {
      setCurrentStream(nextStep);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Progress */}
        {step !== 'complete' && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>{step === 'setup' ? `${Math.min(currentStream + 1, STREAMS.length)}/${STREAMS.length}` : step === 'payment' ? '2/3' : '1/3'}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                style={{ 
                  width: step === 'username' ? '10%' 
                    : step === 'payment' ? '30%' 
                    : `${30 + (currentStream / STREAMS.length) * 70}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Step: Username */}
        {step === 'username' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h1 className="text-2xl font-black mb-2">Choose Your Handle</h1>
            <p className="text-gray-400 text-sm mb-6">
              This will be your unique referral URL: <span className="text-white">wealthreactor.io/u/{username || '___'}</span>
            </p>
            
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                  setError('');
                }}
                placeholder="username"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 mb-4"
                maxLength={20}
              />
              
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              
              <button
                type="submit"
                disabled={loading || !username}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>

            {ref && (
              <p className="mt-4 text-xs text-gray-600 text-center">
                Referred by: <span className="text-gray-400">{ref}</span>
              </p>
            )}
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h1 className="text-2xl font-black mb-2">🔄 Join The Rotator</h1>
            <p className="text-gray-400 text-sm mb-6">
              Pay once. Get traffic forever. Your links shown to every visitor.
            </p>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold">Lifetime Rotator Access</span>
                <div className="text-right">
                  <div className="text-3xl font-black text-green-400">${PRICING.accessFee}</div>
                  <div className="text-xs text-gray-400">USDC on Base</div>
                </div>
              </div>
              
              <div className="border-t border-green-500/30 pt-4 mt-4 space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">Smart Contract (Base):</div>
                  <div className="bg-black/50 rounded-lg p-2 font-mono text-xs text-yellow-400 break-all">
                    0xa6Ca8A21eDEe7f59833d189A357fA8032811b6c6
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-sm font-bold text-blue-400 mb-2">💳 Pay via Smart Contract:</div>
                  <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Click button below to open BaseScan</li>
                    <li>Connect wallet → Switch to Base network</li>
                    <li>First: Approve USDC on the USDC contract</li>
                    <li>Then: Call <code className="bg-black/50 px-1 rounded">pay</code> with username: <code className="text-yellow-400">{userData?.username}</code></li>
                  </ol>
                </div>

                <a 
                  href="https://basescan.org/address/0xa6Ca8A21eDEe7f59833d189A357fA8032811b6c6#writeContract"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold text-center"
                >
                  🔗 Open Contract on BaseScan →
                </a>

                <div>
                  <div className="text-xs text-gray-400 mb-2">Your wallet address (for verification):</div>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm font-mono focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span> Lifetime spot in the rotator
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span> Auto $6 to your referrer
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span> Auto $3 to L2 referrer
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span> Withdraw your earnings anytime
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <button
              onClick={handlePayment}
              disabled={verifying || !walletAddress}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl disabled:opacity-50 text-lg active:scale-95 transition-transform"
            >
              {verifying ? '🔍 Checking Contract...' : '✓ Verify My Payment'}
            </button>
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              Click after paying via the smart contract
            </p>
          </div>
        )}

        {/* Step: Setup Streams */}
        {step === 'setup' && STREAMS[currentStream] && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{STREAMS[currentStream].icon}</div>
              <h1 className="text-2xl font-black">{STREAMS[currentStream].name}</h1>
              <p className="text-yellow-400 text-sm">{STREAMS[currentStream].tagline}</p>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              {STREAMS[currentStream].description}
            </p>

            {/* Promo Code Modal */}
            {showPromoModal && STREAMS[currentStream].promoCode && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">📋</div>
                    <h3 className="text-xl font-bold">Copy Promo Code First!</h3>
                    <p className="text-sm text-gray-400 mt-1">You'll need this when signing up</p>
                  </div>
                  
                  <div className="bg-black rounded-xl p-4 mb-4">
                    <div className="text-xs text-gray-500 mb-2">Your Promo Code:</div>
                    <div className="font-mono text-2xl text-yellow-400 text-center font-bold">
                      {STREAMS[currentStream].promoCode}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(STREAMS[currentStream].promoCode!);
                      setPromoCopied(true);
                    }}
                    className={`w-full py-3 font-bold rounded-xl mb-3 transition-all ${
                      promoCopied 
                        ? 'bg-green-500 text-black' 
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                  >
                    {promoCopied ? '✓ Copied!' : '📋 Copy Code'}
                  </button>
                  
                  <a
                    href={STREAMS[currentStream].defaultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setShowPromoModal(false);
                      setPromoCopied(false);
                    }}
                    className={`block w-full py-3 text-center font-bold rounded-xl transition-all ${
                      promoCopied
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    {promoCopied ? 'Continue to ' + STREAMS[currentStream].name + ' →' : 'Copy code first'}
                  </a>
                  
                  <button
                    onClick={() => {
                      setShowPromoModal(false);
                      setPromoCopied(false);
                    }}
                    className="w-full py-2 text-gray-500 text-sm mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {STREAMS[currentStream].promoCode ? (
              <button
                onClick={() => setShowPromoModal(true)}
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-center font-bold rounded-xl mb-4 transition-colors"
              >
                Sign Up for {STREAMS[currentStream].name} →
              </button>
            ) : (
              <a
                href={STREAMS[currentStream].defaultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-center font-bold rounded-xl mb-4 transition-colors"
              >
                Sign Up for {STREAMS[currentStream].name} →
              </a>
            )}

            {STREAMS[currentStream].promoCode && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="text-xs text-yellow-400 mb-1">⚠️ Promo Code Required</div>
                <div className="font-mono text-lg text-yellow-400">{STREAMS[currentStream].promoCode}</div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Paste YOUR referral link:
              </label>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  setError('');
                }}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={skipStream}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 font-bold rounded-xl transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSaveLink}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black mb-2">You&apos;re In!</h1>
            <p className="text-gray-400 mb-6">
              Your wealth reactor is now active. Share your page to earn commissions.
            </p>

            <div className="bg-black/50 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-500 mb-2">Your Referral Link</div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${userData?.username}`}
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/u/${userData?.username}`)}
                  className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <Link
              href={`/u/${userData?.username}`}
              className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl"
            >
              View My Page →
            </Link>
          </div>
        )}

        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-white">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </main>
    }>
      <StartContent />
    </Suspense>
  );
}
