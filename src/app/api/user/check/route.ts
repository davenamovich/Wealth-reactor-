import { NextResponse } from 'next/server';

// In-memory store for MVP (replace with Supabase in production)
const users: Map<string, object> = new Map();

export async function POST(request: Request) {
  try {
    const { username, ref } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Username too short' }, { status: 400 });
    }

    // Check if username exists
    if (users.has(username.toLowerCase())) {
      return NextResponse.json({ error: 'Username taken' }, { status: 409 });
    }

    // Reserve the username
    users.set(username.toLowerCase(), {
      username: username.toLowerCase(),
      referrer: ref,
      created: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      username: username.toLowerCase(),
      referrer: ref || null,
    });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
