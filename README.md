# 💰 Wealth Reactor

5 Income Streams. One Payment. Unlimited Potential.

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/wealth-reactor)

## Features

- **$30 one-time access** - Unlocks all 5 income streams
- **Personal referral page** - `/u/username` shows user's links
- **L1/L2 commissions** - 20% L1, 10% L2 on all referrals
- **API for AI agents** - `POST /api/refer` to create referral links
- **Mobile-first design** - Works great on phones

## Income Streams

1. 🧾 **Crinkl** - Turn receipts into Bitcoin
2. 🚀 **GoHighLevel** - Earn BTC for referrals
3. 🎮 **mGames** - Play to own on BASE
4. 🎰 **ReBet** - Social sports casino
5. ♻️ **Amplivo** - Plastic into profit

## API for Agents

```bash
# Get referral link
curl -X POST https://your-site.vercel.app/api/refer \
  -H "Content-Type: application/json" \
  -d '{"referrer": "your_username"}'

# Response
{
  "referral_link": "https://your-site.vercel.app/start?ref=your_username",
  "commission_rate": { "l1": 0.20, "l2": 0.10 },
  "streams": [...]
}
```

## Local Development

```bash
npm install
npm run dev
```

## Deploy

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables (optional):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL`

4. Deploy!

## Production Setup (Supabase)

Run `supabase-schema.sql` in your Supabase SQL editor to enable persistent storage.

Without Supabase, the app uses in-memory storage (data resets on deploy).

## Tech Stack

- Next.js 16
- Tailwind CSS
- Supabase (optional)
- Vercel

## License

MIT
