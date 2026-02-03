import { NextResponse } from 'next/server';
import { PRICING, STREAMS } from '@/lib/config';

/**
 * Agent API - Full suite for AI agents to participate in the flywheel
 * 
 * Agents can:
 * 1. Register themselves
 * 2. Get referral links
 * 3. Check their earnings
 * 4. View their referral tree
 * 5. Register webhooks for real-time notifications
 */

// In-memory store (replace with Supabase in production)
const agentStore = new Map<string, {
  id: string;
  wallet: string;
  referrer?: string;
  createdAt: number;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}>();

const referralStats = new Map<string, {
  l1Referrals: string[];
  l2Referrals: string[];
  totalEarned: number;
  pendingPayout: number;
}>();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action } = data;

    switch (action) {
      case 'register':
        return handleRegister(data);
      case 'get_link':
        return handleGetLink(data);
      case 'stats':
        return handleStats(data);
      case 'set_webhook':
        return handleSetWebhook(data);
      default:
        return NextResponse.json({ 
          error: 'Unknown action',
          available_actions: ['register', 'get_link', 'stats', 'set_webhook'],
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleRegister(data: { agent_id: string; wallet: string; referrer?: string; metadata?: Record<string, any> }) {
  const { agent_id, wallet, referrer, metadata } = data;

  if (!agent_id || !wallet) {
    return NextResponse.json({ 
      error: 'agent_id and wallet required',
      example: {
        action: 'register',
        agent_id: 'my_cool_bot',
        wallet: '0x...',
        referrer: 'parent_agent', // optional
        metadata: { platform: 'telegram' }, // optional
      }
    }, { status: 400 });
  }

  // Validate wallet format
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
  }

  // Check if already registered
  if (agentStore.has(agent_id)) {
    const existing = agentStore.get(agent_id)!;
    return NextResponse.json({
      success: true,
      message: 'Agent already registered',
      agent: {
        id: existing.id,
        wallet: existing.wallet,
        referrer: existing.referrer,
        registered_at: new Date(existing.createdAt).toISOString(),
      }
    });
  }

  // Register new agent
  agentStore.set(agent_id, {
    id: agent_id,
    wallet,
    referrer,
    createdAt: Date.now(),
    metadata,
  });

  // Initialize stats
  referralStats.set(agent_id, {
    l1Referrals: [],
    l2Referrals: [],
    totalEarned: 0,
    pendingPayout: 0,
  });

  // Track as referral if has referrer
  if (referrer && referralStats.has(referrer)) {
    const parentStats = referralStats.get(referrer)!;
    parentStats.l1Referrals.push(agent_id);
    
    // Track L2 for grandparent
    const parentAgent = agentStore.get(referrer);
    if (parentAgent?.referrer && referralStats.has(parentAgent.referrer)) {
      const grandparentStats = referralStats.get(parentAgent.referrer)!;
      grandparentStats.l2Referrals.push(agent_id);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthreactor.io';

  return NextResponse.json({
    success: true,
    message: 'Agent registered successfully',
    agent: {
      id: agent_id,
      wallet,
      referrer,
      registered_at: new Date().toISOString(),
    },
    referral_link: `${baseUrl}/start?ref=${agent_id}`,
    next_steps: [
      'Share your referral_link with users',
      'When they pay $30 access fee, you earn $6 (20%)',
      'When THEIR referrals pay, you earn $3 (10%)',
      'Set up a webhook to get notified of new referrals',
    ],
  });
}

async function handleGetLink(data: { agent_id: string }) {
  const { agent_id } = data;

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthreactor.io';

  return NextResponse.json({
    success: true,
    agent_id,
    referral_link: `${baseUrl}/start?ref=${agent_id}`,
    embed_html: `<a href="${baseUrl}/start?ref=${agent_id}">Start earning with Wealth Reactor</a>`,
    commission_rates: {
      l1: `$${PRICING.accessFee * PRICING.l1Commission} (${PRICING.l1Commission * 100}%)`,
      l2: `$${PRICING.accessFee * PRICING.l2Commission} (${PRICING.l2Commission * 100}%)`,
    },
    streams_preview: STREAMS.map(s => s.name),
  });
}

async function handleStats(data: { agent_id: string }) {
  const { agent_id } = data;

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
  }

  const stats = referralStats.get(agent_id) || {
    l1Referrals: [],
    l2Referrals: [],
    totalEarned: 0,
    pendingPayout: 0,
  };

  const agent = agentStore.get(agent_id);

  return NextResponse.json({
    success: true,
    agent_id,
    wallet: agent?.wallet || 'not_registered',
    stats: {
      l1_count: stats.l1Referrals.length,
      l2_count: stats.l2Referrals.length,
      total_referrals: stats.l1Referrals.length + stats.l2Referrals.length,
      l1_earnings: stats.l1Referrals.length * PRICING.accessFee * PRICING.l1Commission,
      l2_earnings: stats.l2Referrals.length * PRICING.accessFee * PRICING.l2Commission,
      total_earned: stats.totalEarned,
      pending_payout: stats.pendingPayout,
    },
    referral_tree: {
      l1: stats.l1Referrals,
      l2: stats.l2Referrals,
    },
  });
}

async function handleSetWebhook(data: { agent_id: string; webhook_url: string }) {
  const { agent_id, webhook_url } = data;

  if (!agent_id || !webhook_url) {
    return NextResponse.json({ 
      error: 'agent_id and webhook_url required',
      example: {
        action: 'set_webhook',
        agent_id: 'my_bot',
        webhook_url: 'https://myserver.com/webhooks/wealth-reactor',
      }
    }, { status: 400 });
  }

  // Validate URL
  try {
    new URL(webhook_url);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
  }

  const agent = agentStore.get(agent_id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not registered. Call register first.' }, { status: 404 });
  }

  agent.webhookUrl = webhook_url;

  return NextResponse.json({
    success: true,
    message: 'Webhook registered',
    agent_id,
    webhook_url,
    events: [
      'new_l1_referral',
      'new_l2_referral', 
      'commission_earned',
      'payout_sent',
    ],
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Wealth Reactor Agent API',
    version: '1.0',
    description: 'API for AI agents to participate in the affiliate flywheel',
    base_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthreactor.io',
    
    actions: {
      register: {
        description: 'Register a new agent',
        required: ['agent_id', 'wallet'],
        optional: ['referrer', 'metadata'],
      },
      get_link: {
        description: 'Get referral link for an agent',
        required: ['agent_id'],
      },
      stats: {
        description: 'Get earnings and referral stats',
        required: ['agent_id'],
      },
      set_webhook: {
        description: 'Register webhook for real-time notifications',
        required: ['agent_id', 'webhook_url'],
      },
    },

    economics: {
      access_fee: `$${PRICING.accessFee} USDC`,
      l1_commission: `${PRICING.l1Commission * 100}% ($${PRICING.accessFee * PRICING.l1Commission})`,
      l2_commission: `${PRICING.l2Commission * 100}% ($${PRICING.accessFee * PRICING.l2Commission})`,
      payout: 'Pull-based - call withdraw() on contract',
    },

    contract: {
      address: '0xa6Ca8A21eDEe7f59833d189A357fA8032811b6c6',
      network: 'Base',
      chain_id: 8453,
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      functions: {
        pay: 'pay(string username, address referrer) - Pay $30 USDC',
        withdraw: 'withdraw() - Claim your earnings',
        checkPayment: 'checkPayment(address) - Check if user paid',
        getEarnings: 'getEarnings(address) - Check pending earnings',
      },
      basescan: 'https://basescan.org/address/0xa6Ca8A21eDEe7f59833d189A357fA8032811b6c6',
    },

    flywheel: {
      step1: 'Agent registers with wallet',
      step2: 'Agent shares referral link',
      step3: 'Users sign up and pay $30',
      step4: 'Agent earns $6 L1 commission',
      step5: 'User shares THEIR link',
      step6: 'Agent earns $3 L2 when user\'s referrals pay',
      step7: 'Agents can refer OTHER agents too',
    },

    income_streams: STREAMS.map(s => ({
      id: s.id,
      name: s.name,
      tagline: s.tagline,
    })),

    example_curl: `curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthreactor.io'}/api/agent \\
  -H "Content-Type: application/json" \\
  -d '{"action": "register", "agent_id": "my_bot", "wallet": "0x..."}'`,
  });
}
