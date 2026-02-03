import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, ref } = data;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();

    // Validate username format
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return NextResponse.json({ 
        error: 'Username must be 3-20 characters, alphanumeric and underscores only' 
      }, { status: 400 });
    }

    // If Supabase is configured, check for existing user
    if (supabase) {
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('username', normalizedUsername)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Username taken' }, { status: 409 });
      }

      // Reserve the username by creating an unpaid user
      const { error } = await supabase
        .from('users')
        .insert({
          username: normalizedUsername,
          referrer_id: ref || null,
          has_paid: false,
          links: {},
        });

      if (error) {
        // Could be race condition - username taken
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Username taken' }, { status: 409 });
        }
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      available: true,
      username: normalizedUsername,
      referrer: ref || null,
    });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
