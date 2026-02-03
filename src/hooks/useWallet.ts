'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS, USDC_ADDRESS, CONTRACT_ABI, USDC_ABI, ACCESS_FEE } from '@/lib/contract';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);

  // Check for wallet on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWallet(!!window.ethereum);
      
      // Check if already connected
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Please open in a browser');
      }
      
      if (!window.ethereum) {
        // Try to trigger wallet connection anyway (some wallets inject late)
        throw new Error('No wallet detected. Please install MetaMask or Coinbase Wallet, then refresh.');
      }

      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);

        // Switch to Base network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Base chainId
          });
        } catch (switchError: any) {
          // Add Base network if not exists
          if (switchError.code === 4902 || switchError.code === -32603) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          } else {
            console.error('Switch error:', switchError);
          }
        }

        return accounts[0];
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const pay = useCallback(async (username: string, referrer?: string) => {
    if (!address || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
    });

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Check USDC allowance
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    });

    // Approve if needed
    if (BigInt(allowance as bigint) < BigInt(ACCESS_FEE)) {
      const approveHash = await walletClient.writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, BigInt(ACCESS_FEE)],
        account: address as `0x${string}`,
      });

      // Wait for approval
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }

    // Call pay function
    const referrerAddress = referrer && referrer.startsWith('0x') 
      ? referrer as `0x${string}`
      : '0x0000000000000000000000000000000000000000' as `0x${string}`;

    const payHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'pay',
      args: [username, referrerAddress],
      account: address as `0x${string}`,
    });

    // Wait for payment confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: payHash });

    return receipt;
  }, [address]);

  const checkPayment = useCallback(async (walletAddress: string) => {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'hasPaid',
      args: [walletAddress as `0x${string}`],
    });

    return result as boolean;
  }, []);

  return {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    pay,
    checkPayment,
    isConnected: !!address,
  };
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
