import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_KEY = 'wr_admin_2026';

function checkAuth(key: string | null): boolean {
  return key === ADMIN_KEY;
}

// Toggle active status
export async function POST(request: Request) {
  const { username, active, key } = await request.json();
  
  if (!checkAuth(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { error } = await supabase
    .from('rotator')
    .update({ active })
    .eq('username', username.toLowerCase());

  if (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Add to rotator
export async function PUT(request: Request) {
  const { username, key } = await request.json();
  
  if (!checkAuth(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { error } = await supabase
    .from('rotator')
    .upsert({
      username: username.toLowerCase(),
      active: true,
    }, { onConflict: 'username' });

  if (error) {
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Remove from rotator
export async function DELETE(request: Request) {
  const { username, key } = await request.json();
  
  if (!checkAuth(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { error } = await supabase
    .from('rotator')
    .delete()
    .eq('username', username.toLowerCase());

  if (error) {
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
