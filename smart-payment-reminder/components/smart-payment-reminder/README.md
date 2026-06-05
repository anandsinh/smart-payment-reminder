# Smart Payment Reminder

Track recurring monthly payments and receive reminders until payment is complete.

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | Next.js 14 on Vercel | Free |
| Database + Auth | Supabase (PostgreSQL) | Free |
| Notifications | Browser Push | Free |
| **Total** | | **$0/mo** |

## Local Development

1. Clone the repo
2. Copy `.env.local` and fill in your Supabase keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Install dependencies:
```bash
npm install
```

4. Run the dev server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Import on vercel.com
3. Add environment variables (Supabase URL + anon key + site URL)
4. Deploy — done!

## Features

- Google OAuth login
- Add / edit / delete billers (7 categories)
- Mark payments as paid/unpaid
- Automatic monthly reset on the 1st
- Overdue detection with 3-day repeat reminders
- Dashboard with live stats
- Payment history by month
- Browser push notifications
- Export data as JSON
