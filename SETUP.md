# MAKFitness Setup Guide

This guide will help you set up and run MAKFitness locally.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))

## 1. Supabase Setup

### Create a New Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: MAKFitness
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for project creation (takes ~2 minutes)

### Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/migrations/20260202223428_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

This will create:
- All database tables (profiles, groups, check-ins, etc.)
- Row Level Security policies
- Storage buckets for photos
- Default metric definitions
- Triggers for streak tracking

### Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Under **Email** settings:
   - Enable "Confirm email"
   - Enable "Secure email change"
4. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## 2. Environment Variables

1. In the project root, create `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 5. First Run Checklist

- [ ] Can access the app at localhost:3000
- [ ] Sign-in page loads without errors
- [ ] Can request magic link (check email)
- [ ] Can complete sign-in flow
- [ ] Profile is created in database

## Project Structure

```
makfitness/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages
│   │   ├── (app)/             # Main app pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── check-in/          # Check-in specific
│   │   ├── feed/              # Feed components
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── hooks/             # React hooks
│   │   └── utils/             # Utility functions
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Common Issues

### "Invalid API key" error
- Double-check `.env.local` has correct keys
- Restart dev server after changing env vars

### Database migration fails
- Make sure you copied the entire SQL file
- Check for syntax errors in SQL editor
- Try running migration in chunks if needed

### Authentication redirect fails
- Verify redirect URL in Supabase dashboard matches `http://localhost:3000/auth/callback`
- Check Site URL is set to `http://localhost:3000`

## Next Steps

1. **Create a group**: After signing in, create your first fitness group
2. **Invite friends**: Share the invite code
3. **Complete first check-in**: Try out the modular tracking system
4. **Customize metrics**: Go to settings to enable/disable metrics

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint
```

## Need Help?

- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Review the implementation plan: `.claude/plans/replicated-meandering-lagoon.md`
