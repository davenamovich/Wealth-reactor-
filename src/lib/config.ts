// Income Streams Configuration
export const STREAMS = [
  {
    id: 'crinkl',
    name: 'Crinkl',
    tagline: 'Turn Receipts into Bitcoin',
    description: 'Scan receipts, earn BTC instantly. Alchemy — turning paper into crypto.',
    defaultUrl: 'https://crinkl.it.com/welcome?ref=PMA6J5A',
    icon: '🧾',
    linkPattern: /crinkl\.it/i,
  },
  {
    id: 'goe1ulife', 
    name: 'Goe1ulife',
    tagline: 'Instant BTC for Referrals',
    description: 'Get paid in Bitcoin for referring businesses. Powered by GoHighLevel.',
    defaultUrl: 'https://go.e1ulife.com/?affid=magicdave',
    icon: '🚀',
    linkPattern: /e1ulife\.com/i,
  },
  {
    id: 'mgames',
    name: 'mGames', 
    tagline: 'Play to Own',
    description: 'Gaming on BASE. Own your assets, earn $50/day in referrals.',
    defaultUrl: 'https://magicdave.memegames.ai/',
    icon: '🎮',
    linkPattern: /memegames\.ai/i,
  },
  {
    id: 'rebet',
    name: 'ReBet',
    tagline: 'Social Sports Casino',
    description: 'Free bets when friends play. Promo code required.',
    defaultUrl: 'https://apps.apple.com/us/app/rebet-social-sports-casino/id6468762763',
    icon: '🎰',
    linkPattern: /rebet|U-[A-Z]{3}-[A-Z]{3}-[A-Z]{2}/i,
    promoCode: 'U-DAV-NAM-KV',
  },
  {
    id: 'amplivo',
    name: 'Amplivo',
    tagline: 'Plastic into Profit',
    description: 'Turn plastic waste into oil. Earn USDT from the green economy.',
    defaultUrl: 'https://amplivo.com/sponsor/Magicdave',
    icon: '♻️',
    linkPattern: /amplivo\.com/i,
  },
];

export const PRICING = {
  accessFee: 30, // $30 USDC
  l1Commission: 0.20, // 20%
  l2Commission: 0.10, // 10%
};

export const SITE = {
  name: 'The Wealth Reactor',
  tagline: '5 Income Streams. One Payment. Unlimited Potential.',
  description: 'Get paid to learn crypto. Set up 5 passive income streams in 10 minutes.',
};
