'use client';

import { useState } from 'react';
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
      if (err.message?.includes('rejected')) {
        onError('Transaction rejected');
      } else if (err.message?.includes('insufficient')) {
        onError('Insufficient USDC balance');
      } else {
        onError(err.message || 'Payment failed');
      }
      setStep('pay');
    } finally {
      setIsPaying(false);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl disabled:opacity-50 text-lg active:scale-95 transition-transform"
      >
        {isConnecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Connecting...
          </span>
        ) : (
          '🔗 Connect Wallet'
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">Connected</div>
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
            {step === 'confirming' ? 'Confirming...' : 'Processing...'}
          </span>
        ) : (
          '💳 Pay $30 USDC'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {step === 'pay' && 'Click to approve USDC & pay'}
        {step === 'confirming' && 'Waiting for blockchain confirmation...'}
      </p>
    </div>
  );
}
