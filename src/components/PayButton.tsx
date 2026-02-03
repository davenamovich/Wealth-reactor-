'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface PayButtonProps {
  username: string;
  referrer?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PayButton({ username, referrer, onSuccess, onError }: PayButtonProps) {
  const { address, isConnected, isConnecting, connect, pay, checkPayment } = useWallet();
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState<'connect' | 'pay' | 'confirming'>('connect');
  const [hasWallet, setHasWallet] = useState(true);

  useEffect(() => {
    // Always assume wallet might be available (mobile apps inject later)
    setHasWallet(true);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      setStep('pay');
    } catch (err: any) {
      onError(err.message || 'Failed to connect wallet');
    }
  };

  const handlePay = async () => {
    if (!address) return;
    
    setIsPaying(true);
    setStep('confirming');

    try {
      await pay(username, referrer);
      
      // Verify payment
      const paid = await checkPayment(address);
      if (paid) {
        onSuccess();
      } else {
        onError('Payment not confirmed. Please try again.');
        setStep('pay');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.message?.includes('rejected') || err.message?.includes('denied')) {
        onError('Transaction rejected by user');
      } else if (err.message?.includes('insufficient')) {
        onError('Insufficient USDC balance. Need $30 USDC on Base.');
      } else {
        onError(err.message || 'Payment failed. Please try again.');
      }
      setStep('pay');
    } finally {
      setIsPaying(false);
    }
  };

  const [showWalletHelp, setShowWalletHelp] = useState(false);

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <button
          onClick={async () => {
            try {
              await handleConnect();
            } catch (err: any) {
              // If no wallet, show help
              if (err.message?.includes('No wallet') || err.message?.includes('install')) {
                setShowWalletHelp(true);
              }
            }
          }}
          disabled={isConnecting}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl disabled:opacity-50 text-lg active:scale-95 transition-transform"
        >
          {isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Connecting...
            </span>
          ) : (
            '🔗 Connect Wallet to Pay'
          )}
        </button>
        
        {showWalletHelp && (
          <div className="bg-gray-800 rounded-xl p-4 text-sm">
            <p className="text-gray-300 mb-3">No wallet detected. Install one:</p>
            <div className="flex gap-2">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-lg text-center text-xs"
              >
                MetaMask
              </a>
              <a
                href="https://www.coinbase.com/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg text-center text-xs"
              >
                Coinbase
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">Then refresh this page</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">Connected on Base</div>
          <div className="font-mono text-sm text-green-400">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
        <div className="text-green-400">✓</div>
      </div>

      <button
        onClick={handlePay}
        disabled={isPaying}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl disabled:opacity-50 text-lg active:scale-95 transition-transform"
      >
        {isPaying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            {step === 'confirming' ? 'Confirming...' : 'Approve in wallet...'}
          </span>
        ) : (
          '💳 Pay $30 USDC'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {step === 'pay' && 'You\'ll approve USDC then confirm payment'}
        {step === 'confirming' && 'Waiting for blockchain confirmation...'}
      </p>
    </div>
  );
}
