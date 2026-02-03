import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, links, hasPaid, referrer } = data;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();

    // If Supabase is configured, use it
    if (supabase) {
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('username', normalizedUsername)
        .single();

      if (existing) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            links: links || existing.links,
            has_paid: hasPaid ?? existing.has_paid,
          })
          .eq('username', normalizedUsername);

        if (error) {
          console.error('Supabase update error:', error);
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true,
          user: { ...existing, links, has_paid: hasPaid },
        });
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            username: normalizedUsername,
            links: links || {},
            has_paid: hasPaid || false,
            referrer_id: referrer || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true,
          user: newUser,
        });
      }
    }

    // Fallback: return success (data stored in localStorage on client)
    return NextResponse.json({ 
      success: true,
      message: 'Stored locally (Supabase not configured)',
    });
  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
