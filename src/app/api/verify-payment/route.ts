import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TREASURY = '0x04D1e136AAd78F04aC68FbC26F8d61b23B1F88CA';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const REQUIRED_AMOUNT = 30_000_000; // $30 USDC (6 decimals)
const BASE_RPC = 'https://mainnet.base.org';

// Check USDC transfers to treasury
async function checkUSDCTransfers(fromAddress: string): Promise<boolean> {
  try {
    // Get recent USDC transfer events to treasury from this address
    const response = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getLogs',
        params: [{
          address: USDC_BASE,
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
            '0x000000000000000000000000' + fromAddress.slice(2).toLowerCase(), // from
            '0x000000000000000000000000' + TREASURY.slice(2).toLowerCase(), // to
          ],
          fromBlock: 'earliest',
          toBlock: 'latest',
        }],
      }),
    });

    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      // Check if any transfer is >= $30
      for (const log of data.result) {
        const amount = parseInt(log.data, 16);
        if (amount >= REQUIRED_AMOUNT) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking transfers:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { username, walletAddress } = await request.json();

    if (!username || !walletAddress) {
      return NextResponse.json({ error: 'Username and wallet required' }, { status: 400 });
    }

    // Check blockchain for payment
    const hasPaid = await checkUSDCTransfers(walletAddress);

    if (!hasPaid) {
      return NextResponse.json({ 
        verified: false, 
        message: 'Payment not found. Send $30 USDC to treasury.',
        treasury: TREASURY,
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

  const hasPaid = await checkUSDCTransfers(wallet);
  
  return NextResponse.json({ 
    wallet,
    hasPaid,
    treasury: TREASURY,
    required: '$30 USDC on Base',
  });
}
