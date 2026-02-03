# MAKFitness Deployment Guide

## Prerequisites

- [Supabase account](https://supabase.com) with a project set up (see [SETUP.md](SETUP.md))
- [Vercel account](https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MAKFitness app"
   ```

2. **Push to GitHub** (or your preferred Git provider):
   ```bash
   git remote add origin https://github.com/yourusername/makfitness.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Configure Supabase for Production

### 1. Update Authentication URLs

In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Update:
   - **Site URL**: `https://your-domain.vercel.app` (or custom domain)
   - **Redirect URLs**: Add `https://your-domain.vercel.app/auth/callback`

### 2. Verify Storage Bucket

1. Go to **Storage**
2. Ensure `checkin-photos` bucket exists and is public
3. Verify RLS policies are in place

### 3. Test Database Migration

1. Go to **SQL Editor**
2. Verify all tables exist:
   - profiles, groups, group_members
   - metric_definitions (should have 30+ rows)
   - daily_checkins, user_streaks
   - checkin_reactions, weekly_challenges

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? makfitness
# - Which directory is your code located? ./
# - Auto-detect settings? Yes
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

## Step 4: Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `makfitness.app`)
4. Follow DNS configuration instructions
5. Update Supabase Auth URLs to use custom domain

### Update Environment Variables

After adding custom domain:
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-custom-domain.com
```

## Step 5: Post-Deployment Verification

### 1. Test Authentication
- Visit your deployed URL
- Try signing in with magic link
- Verify email arrives
- Check redirect after clicking magic link

### 2. Test Core Functionality
- Create a group
- Complete a check-in with photo upload
- Verify data appears in Supabase dashboard
- Check that streaks update correctly

### 3. Test PWA Installation
**iOS Safari:**
- Open site in Safari
- Tap Share → "Add to Home Screen"
- Verify icon and app name
- Open installed app, verify it works

**Android Chrome:**
- Open site in Chrome
- Look for "Install" prompt
- Install and verify functionality

### 4. Check Performance
- Run [PageSpeed Insights](https://pagespeed.web.dev/)
- Target: 90+ on Performance, Accessibility, Best Practices, SEO
- Verify PWA installable

## Step 6: Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics** (built-in)
   - Go to project → **Analytics**
   - Monitor page views, visitors, performance

2. **Supabase Logs**
   - Go to **Logs** in Supabase dashboard
   - Monitor database queries, errors

3. **Error Tracking** (Optional)
   - Set up [Sentry](https://sentry.io) for error tracking
   - Add to `next.config.ts`

### Database Backups

Supabase automatically backs up your database. To manually backup:

1. Go to **Database** → **Backups**
2. Create manual backup before major changes
3. Download backups periodically

## Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found`
- **Fix**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: `Type error: ...`
- **Fix**: Run `npm run build` locally to catch TypeScript errors
- Fix errors and push

### Authentication Not Working

**Issue**: Magic link redirects to wrong URL
- **Fix**: Update Supabase Auth redirect URLs
- Ensure `NEXT_PUBLIC_APP_URL` matches deployed URL

**Issue**: Users can't sign in
- **Fix**: Check Supabase email templates
- Verify SMTP settings if using custom email

### Photos Not Uploading

**Issue**: Storage bucket errors
- **Fix**: Verify bucket is public
- Check RLS policies on `storage.objects`
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Streaks Not Updating

**Issue**: Database trigger not firing
- **Fix**: Check `update_user_streak()` function exists in Supabase
- Run migration again if needed
- Verify trigger is attached to `daily_checkins` table

## Continuous Deployment

Vercel automatically deploys on git push:

1. **Production**: Pushes to `main` branch → Production deploy
2. **Preview**: Pushes to other branches → Preview deploy
3. **Pull Requests**: Automatic preview deployments

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Add new feature"

# Push to preview branch
git push origin feature-branch
# → Vercel creates preview deployment

# Merge to main for production
git checkout main
git merge feature-branch
git push origin main
# → Vercel deploys to production
```

## Environment Variables Management

### Local Development
- Use `.env.local` (never commit this)

### Production (Vercel)
- Add via Vercel dashboard or CLI
- Environment variables are encrypted
- Can set different values for Production/Preview/Development

### Update Environment Variables

```bash
# Via CLI
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Then redeploy
vercel --prod
```

## Success Checklist

- [ ] App deployed to Vercel
- [ ] Custom domain configured (if applicable)
- [ ] Supabase Auth URLs updated
- [ ] All environment variables set
- [ ] Authentication works (magic link)
- [ ] Photo uploads work
- [ ] Streaks update correctly
- [ ] PWA installable on iOS/Android
- [ ] Performance score > 90
- [ ] Error monitoring set up

## Next Steps

1. **Invite Beta Testers**: Share your app with friends
2. **Monitor Usage**: Check Vercel/Supabase dashboards
3. **Gather Feedback**: Use feedback to improve
4. **Iterate**: Add features based on user needs

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
