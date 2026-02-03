import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CONTRACT_ADDRESS } from '@/lib/contract';

const BASE_RPC = 'https://mainnet.base.org';

// Check if user has paid via smart contract
async function checkContractPayment(walletAddress: string): Promise<{ paid: boolean; username: string }> {
  try {
    // Call checkPayment(address) on the contract
    // Function selector for checkPayment(address): 0x3b56fdc6
    const data = '0x3b56fdc6000000000000000000000000' + walletAddress.slice(2).toLowerCase();
    
    const response = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESS,
          data,
        }, 'latest'],
      }),
    });

    const result = await response.json();
    
    if (result.result && result.result !== '0x') {
      // Decode the response (bool paid, string username)
      const hex = result.result.slice(2);
      const paid = parseInt(hex.slice(0, 64), 16) === 1;
      
      // Decode username string
      let username = '';
      if (paid && hex.length > 128) {
        const offset = parseInt(hex.slice(64, 128), 16) * 2;
        const length = parseInt(hex.slice(offset, offset + 64), 16);
        const usernameHex = hex.slice(offset + 64, offset + 64 + length * 2);
        username = Buffer.from(usernameHex, 'hex').toString('utf8');
      }
      
      return { paid, username };
    }
    
    return { paid: false, username: '' };
  } catch (error) {
    console.error('Error checking contract payment:', error);
    return { paid: false, username: '' };
  }
}

export async function POST(request: Request) {
  try {
    const { username, walletAddress } = await request.json();

    if (!username || !walletAddress) {
      return NextResponse.json({ error: 'Username and wallet required' }, { status: 400 });
    }

    // Check smart contract for payment
    const { paid } = await checkContractPayment(walletAddress);

    if (!paid) {
      return NextResponse.json({ 
        verified: false, 
        message: 'Payment not found. Complete payment via the smart contract.',
        contract: CONTRACT_ADDRESS,
      });
    }

    // Update user as paid in database
    if (supabase) {
      await supabase
        .from('users')
        .update({ 
          has_paid: true,
          wallet_address: walletAddress.toLowerCase(),
        })
        .eq('username', username.toLowerCase());

      // Add to rotator
      await supabase
        .from('rotator')
        .upsert({
          username: username.toLowerCase(),
          active: true,
        }, { onConflict: 'username' });
    }

    return NextResponse.json({ 
      verified: true, 
      message: 'Payment verified! Welcome to the rotator.',
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet required' }, { status: 400 });
  }

  const { paid, username } = await checkContractPayment(wallet);
  
  return NextResponse.json({ 
    wallet,
    hasPaid: paid,
    username: username || null,
    contract: CONTRACT_ADDRESS,
  });
}
