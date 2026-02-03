import { NextResponse } from 'next/server';

// In-memory store for MVP (shared with check route in production via DB)
// This is a workaround - in production use Supabase
const users: Map<string, {
  username: string;
  links: Record<string, string>;
  hasPaid: boolean;
  referrer?: string;
  created: string;
}> = new Map();

// Export for use by other routes
export { users };

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, links, hasPaid } = data;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Get existing or create new
    const existing = users.get(username.toLowerCase());
    
    users.set(username.toLowerCase(), {
      username: username.toLowerCase(),
      links: links || existing?.links || {},
      hasPaid: hasPaid ?? existing?.hasPaid ?? false,
      referrer: existing?.referrer,
      created: existing?.created || new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      user: users.get(username.toLowerCase()),
    });
  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
