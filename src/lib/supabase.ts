import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface User {
  id: string;
  wallet_address?: string;
  username: string;
  email?: string;
  referrer_id?: string;
  referrer_l2_id?: string;
  has_paid: boolean;
  payment_tx?: string;
  links: Record<string, string>;
  created_at: string;
}

// Create or get user
export async function getOrCreateUser(identifier: string, referrerId?: string): Promise<User | null> {
  if (!supabase) return null;

  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${identifier},wallet_address.eq.${identifier.toLowerCase()}`)
    .single();

  if (existing) return existing;

  // Get L2 referrer
  let l2Id = undefined;
  if (referrerId) {
    const { data: referrer } = await supabase
      .from('users')
      .select('referrer_id')
      .eq('username', referrerId)
      .single();
    l2Id = referrer?.referrer_id;
  }

  // Create new user
  const username = identifier.startsWith('0x') 
    ? identifier.slice(2, 10).toLowerCase()
    : identifier;

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username,
      wallet_address: identifier.startsWith('0x') ? identifier.toLowerCase() : null,
      referrer_id: referrerId,
      referrer_l2_id: l2Id,
      has_paid: false,
      links: {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser;
}

// Get user by username (for public profile)
export async function getUserByUsername(username: string): Promise<User | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  return data;
}

// Update user links
export async function updateUserLinks(userId: string, links: Record<string, string>): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('users')
    .update({ links, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

// Mark user as paid
export async function markUserPaid(userId: string, txHash?: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('users')
    .update({ 
      has_paid: true, 
      payment_tx: txHash,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId);

  return !error;
}

// Track referral commission
export async function trackCommission(
  userId: string, 
  referralId: string, 
  level: 1 | 2, 
  amount: number
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('commissions')
    .insert({
      user_id: userId,
      referral_id: referralId,
      level,
      amount,
      status: 'pending',
    });

  return !error;
}

// Get user stats
export async function getUserStats(userId: string) {
  if (!supabase) return null;

  const { data: referrals } = await supabase
    .from('users')
    .select('id')
    .eq('referrer_id', userId);

  const { data: commissions } = await supabase
    .from('commissions')
    .select('amount, status')
    .eq('user_id', userId);

  const totalEarned = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const pendingEarned = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0;

  return {
    referralCount: referrals?.length || 0,
    totalEarned,
    pendingEarned,
  };
}
