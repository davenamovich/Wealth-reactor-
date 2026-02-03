import { NextResponse } from 'next/server';
import { PRICING, STREAMS } from '@/lib/config';

/**
 * API for AI Agents to create referrals
 * 
 * POST /api/refer
 * {
 *   "referrer": "agent_username",      // The agent's username
 *   "referred_email": "user@email.com", // New user's email (optional)
 *   "referred_wallet": "0x..."          // New user's wallet (optional)
 * }
 * 
 * Returns:
 * {
 *   "success": true,
 *   "referral_link": "https://site.com/start?ref=agent_username",
 *   "commission_rate": { "l1": 0.20, "l2": 0.10 },
 *   "streams": [...]
 * }
 */

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { referrer } = data;

    if (!referrer) {
      return NextResponse.json({ 
        error: 'Referrer username required',
        example: {
          referrer: 'your_username',
        }
      }, { status: 400 });
    }

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthreactor.io';
    const referralLink = `${baseUrl}/start?ref=${referrer}`;

    return NextResponse.json({
      success: true,
      referral_link: referralLink,
      referrer,
      commission_rate: {
        l1: PRICING.l1Commission,
        l2: PRICING.l2Commission,
        access_fee: PRICING.accessFee,
      },
      streams: STREAMS.map(s => ({
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        default_link: s.defaultUrl,
      })),
      instructions: 'Share the referral_link. When users sign up and pay, you earn L1 commission. When their referrals pay, you earn L2.',
    });
  } catch (error) {
    console.error('Refer API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  // Documentation endpoint
  return NextResponse.json({
    name: 'Wealth Reactor Referral API',
    version: '1.0',
    endpoints: {
      'POST /api/refer': {
        description: 'Generate a referral link for an AI agent',
        body: {
          referrer: 'string (required) - your username',
        },
        response: {
          referral_link: 'string - shareable link',
          commission_rate: 'object - l1/l2 percentages',
          streams: 'array - income streams info',
        },
      },
      'GET /api/user/{username}': {
        description: 'Get public profile data for a user',
        response: {
          username: 'string',
          links: 'object - saved referral links',
        },
      },
    },
    commission_structure: {
      l1: '20% of access fee',
      l2: '10% of access fee',
      access_fee: `$${PRICING.accessFee} USDC`,
    },
  });
}
