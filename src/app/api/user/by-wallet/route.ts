import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { STREAMS } from '@/lib/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', wallet.toLowerCase())
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Build streams with user's custom links
  const streams = STREAMS.map(stream => ({
    id: stream.id,
    name: stream.name,
    tagline: stream.tagline,
    icon: stream.icon,
    url: user.links?.[stream.id] || stream.defaultUrl,
    isCustom: !!user.links?.[stream.id] && user.links[stream.id] !== stream.defaultUrl,
    promoCode: stream.promoCode,
  }));

  return NextResponse.json({
    username: user.username,
    links: user.links || {},
    streams,
    hasPaid: user.has_paid,
    wallet: user.wallet_address,
    created: user.created_at,
  });
}
