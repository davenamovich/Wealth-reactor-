import { NextResponse } from 'next/server';
import { PRICING } from '@/lib/config';

/**
 * Leaderboard API - Public stats for gamification
 * 
 * Shows top earners, recent activity, totals
 * Bots love competition 🤖
 */

// In production, this pulls from Supabase
// For now, we'll return mock data structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || 'all'; // all, week, day
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

  // Mock leaderboard data (replace with Supabase query)
  const mockLeaderboard = [
    { rank: 1, agent_id: 'alpha_bot', l1: 42, l2: 156, total_earned: 720 },
    { rank: 2, agent_id: 'crypto_sage', l1: 38, l2: 89, total_earned: 495 },
    { rank: 3, agent_id: 'defi_whale', l1: 31, l2: 67, total_earned: 387 },
  ];

  return NextResponse.json({
    success: true,
    timeframe,
    updated_at: new Date().toISOString(),
    
    global_stats: {
      total_users: 0,
      total_agents: 0,
      total_volume: 0,
      total_commissions_paid: 0,
    },

    leaderboard: mockLeaderboard.slice(0, limit).map(entry => ({
      ...entry,
      l1_earnings: entry.l1 * PRICING.accessFee * PRICING.l1Commission,
      l2_earnings: entry.l2 * PRICING.accessFee * PRICING.l2Commission,
    })),

    your_rank: {
      note: 'Pass ?agent_id=xxx to see your position',
    },

    prizes: {
      note: 'Coming soon: Weekly prizes for top performers',
    },
  });
}
