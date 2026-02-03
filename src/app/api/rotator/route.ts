import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ROTATOR_PRICE = 20; // $20 USDC one-time
const TREASURY_WALLET = process.env.TREASURY_WALLET || '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB61';

export async function GET() {
  // Get all rotator members
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Database not configured',
      rotator: [],
    });
  }
  
  const { data: entries, error } = await supabase
    .from('rotator')
    .select('username, created_at')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Rotator fetch error:', error);
    return NextResponse.json({ rotator: [] });
  }

  // Get a random member for the landing page redirect
  const members = entries || [];
  const featured = members.length > 0 
    ? members[Math.floor(Math.random() * members.length)]
    : null;

  return NextResponse.json({
    rotator: members,
    featured: featured?.username || null,
    count: members.length,
    price: ROTATOR_PRICE,
    treasury: TREASURY_WALLET,
    type: 'lifetime',
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, txHash } = data;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check user exists
    const { data: user } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already in rotator
    const { data: existing } = await supabase
      .from('rotator')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already in rotator!',
        member: true,
      });
    }

    // Add to rotator (lifetime)
    const { error } = await supabase
      .from('rotator')
      .insert({
        username: username.toLowerCase(),
        tx_hash: txHash || null,
        active: true,
      });

    if (error) {
      console.error('Rotator insert error:', error);
      return NextResponse.json({ error: 'Failed to add to rotator' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to the rotator! Lifetime access unlocked.',
      price: ROTATOR_PRICE,
      treasury: TREASURY_WALLET,
    });
  } catch (error) {
    console.error('Rotator error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
