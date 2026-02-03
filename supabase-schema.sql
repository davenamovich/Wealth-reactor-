-- Wealth Reactor Database Schema
-- Run this in Supabase SQL Editor when ready for production

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  email TEXT,
  referrer_id TEXT REFERENCES users(username),
  referrer_l2_id TEXT,
  has_paid BOOLEAN DEFAULT false,
  payment_tx TEXT,
  links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referrer ON users(referrer_id);

-- Commissions tracking
CREATE TABLE commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  referral_id UUID REFERENCES users(id),
  level INTEGER NOT NULL CHECK (level IN (1, 2)),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- Payments tracking  
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read access for profiles
CREATE POLICY "Public profiles" ON users FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users update own" ON users FOR UPDATE USING (true);

-- Insert for new users
CREATE POLICY "Anyone can register" ON users FOR INSERT WITH CHECK (true);
