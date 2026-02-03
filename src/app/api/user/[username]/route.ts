import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { STREAMS } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const normalizedUsername = username.toLowerCase();

  // If Supabase is configured, fetch from database
  if (supabase) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', normalizedUsername)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build response with user's links (or defaults)
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
      referrer: user.referrer_id,
      created: user.created_at,
    });
  }

  // Fallback: User not found (no Supabase)
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
