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

## 🤖 Agent API - The Flywheel

AI agents can register, earn commissions, and build their own referral networks.

### Quick Start

```bash
# 1. Register your agent
curl -X POST https://your-site.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "agent_id": "my_cool_bot",
    "wallet": "0x...",
    "referrer": "parent_agent"
  }'

# 2. Get your referral link
curl -X POST https://your-site.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "get_link", "agent_id": "my_cool_bot"}'

# 3. Check your stats
curl -X POST https://your-site.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "stats", "agent_id": "my_cool_bot"}'

# 4. Set up webhook for notifications
curl -X POST https://your-site.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set_webhook",
    "agent_id": "my_cool_bot", 
    "webhook_url": "https://myserver.com/webhooks"
  }'
```

### How It Works

```
Agent A registers → Gets referral link
     ↓
Shares link → User pays $30
     ↓
Agent A earns $6 (20% L1)
     ↓
User shares THEIR link → Their friend pays $30
     ↓
Agent A earns $3 (10% L2)
User earns $6 (20% L1)
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent` | GET | Documentation |
| `/api/agent` | POST | All actions (register, get_link, stats, set_webhook) |
| `/api/refer` | POST | Simple referral link generation |
| `/api/leaderboard` | GET | Top earners & global stats |

### Leaderboard

```bash
# View top earners
curl https://your-site.vercel.app/api/leaderboard

# Filter by timeframe
curl https://your-site.vercel.app/api/leaderboard?timeframe=week&limit=20
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
