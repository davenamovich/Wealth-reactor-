import { NextResponse } from 'next/server';
import { STREAMS } from '@/lib/config';

// Shared in-memory store (in production, use Supabase)
const users: Map<string, {
  username: string;
  links: Record<string, string>;
  hasPaid: boolean;
  referrer?: string;
}> = new Map();

// Seed with default user for testing
users.set('magicdave', {
  username: 'magicdave',
  links: {
    crinkl: 'https://crinkl.it.com/welcome?ref=PMA6J5A',
    gohighlevel: 'https://go.e1ulife.com/?affid=magicdave',
    mgames: 'https://magicdave.memegames.ai/',
    rebet: 'U-DAV-NAM-KV',
    amplivo: 'https://amplivo.com/sponsor/Magicdave',
  },
  hasPaid: true,
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  const user = users.get(username.toLowerCase());
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Return public profile data
  return NextResponse.json({
    username: user.username,
    links: user.links,
  });
}
