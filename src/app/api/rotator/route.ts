import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ROTATOR_PRICE = 20; // $20 USDC for 24 hours
const ROTATOR_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  // Get active rotator entries (not expired)
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Database not configured',
      rotator: [],
    });
  }

  const now = new Date().toISOString();
  
  const { data: entries, error } = await supabase
    .from('rotator')
    .select('username, expires_at')
    .gt('expires_at', now)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Rotator fetch error:', error);
    return NextResponse.json({ rotator: [] });
  }

  // Get a random active user for the landing page redirect
  const activeUsers = entries || [];
  const featured = activeUsers.length > 0 
    ? activeUsers[Math.floor(Math.random() * activeUsers.length)]
    : null;

  return NextResponse.json({
    rotator: activeUsers,
    featured: featured?.username || null,
    count: activeUsers.length,
    price: ROTATOR_PRICE,
    duration: '24 hours',
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

    // Calculate expiry (24 hours from now)
    const expiresAt = new Date(Date.now() + ROTATOR_DURATION_MS).toISOString();

    // Check if user already in rotator
    const { data: existing } = await supabase
      .from('rotator')
      .select('*')
      .eq('username', username.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existing) {
      // Extend existing entry
      const newExpiry = new Date(new Date(existing.expires_at).getTime() + ROTATOR_DURATION_MS).toISOString();
      
      await supabase
        .from('rotator')
        .update({ expires_at: newExpiry, tx_hash: txHash })
        .eq('id', existing.id);

      return NextResponse.json({
        success: true,
        message: 'Rotator time extended',
        expires_at: newExpiry,
      });
    }

    // Add new entry
    const { error } = await supabase
      .from('rotator')
      .insert({
        username: username.toLowerCase(),
        expires_at: expiresAt,
        tx_hash: txHash,
      });

    if (error) {
      console.error('Rotator insert error:', error);
      return NextResponse.json({ error: 'Failed to add to rotator' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Added to rotator for 24 hours',
      expires_at: expiresAt,
      price: ROTATOR_PRICE,
    });
  } catch (error) {
    console.error('Rotator error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
