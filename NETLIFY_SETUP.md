# Netlify Deployment - Quick Setup

Your code is now on GitHub! 🎉

## 🚀 Deploy to Netlify (5 minutes)

### Step 1: Sign up/Login to Netlify

1. Go to: **https://app.netlify.com/signup**
2. Click **"Sign up with GitHub"** (recommended - easiest option)
3. Authorize Netlify to access your GitHub account

### Step 2: Import Your Site

1. In Netlify dashboard, click **"Add new site"**
2. Select **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. If prompted, authorize Netlify again
5. Find and select: **`pyaichatbot/yellamaraju-site`**
6. Click **"Connect"**

### Step 3: Configure Build Settings

Netlify should auto-detect these from `netlify.toml`:

✅ **Build command**: `npm run build`  
✅ **Publish directory**: `dist`  
✅ **Node version**: Select **Node 18** or **Node 20** from dropdown

### Step 4: Deploy!

1. Click **"Deploy site"** button
2. Watch the build logs (takes 1-3 minutes)
3. Once complete, you'll see: **"Site is live"**
4. Your site URL will be: `https://random-name-123456.netlify.app`

## 🎨 Custom Domain Setup (Optional)

### Add Your Domain

1. Go to: **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `yellamaraju.com` (or `www.yellamaraju.com`)
4. Follow DNS configuration instructions

### DNS Configuration

**Option A: Use Netlify DNS (Easiest)**
- In Netlify: Domain settings → **"Use Netlify DNS"**
- Copy nameservers shown
- Update nameservers at your domain registrar

**Option B: Configure DNS Records**
- Add DNS records as shown in Netlify dashboard
- Usually requires:
  - A record: `@` → Netlify IP (shown in dashboard)
  - CNAME: `www` → your-site-name.netlify.app

### SSL Certificate

- ✅ Netlify automatically provisions SSL (Let's Encrypt)
- Takes 5-10 minutes to activate
- Your site will be available at `https://yellamaraju.com`

## 🔄 Automatic Deployments

**Every time you push to GitHub, Netlify automatically rebuilds!**

```bash
# Make changes locally
git add .
git commit -m "Update content"
git push

# Netlify automatically deploys (watch in dashboard)
```

## 📊 What You Get (Free Tier)

- ✅ **100GB bandwidth/month**
- ✅ **300 build minutes/month**
- ✅ **Unlimited sites**
- ✅ **SSL certificates**
- ✅ **Custom domains**
- ✅ **Deploy previews** (for pull requests)
- ✅ **Form handling** (if you add forms)
- ✅ **Analytics** (limited on free tier)

## 🎉 You're Done!

Your site is now live and will automatically deploy on every push!

**Next Steps:**
- Share your site URL
- Update social media profiles
- Submit to Google Search Console
- Monitor analytics in Netlify dashboard

## 🔗 Useful Links

- **Your GitHub Repo**: https://github.com/pyaichatbot/yellamaraju-site
- **Netlify Dashboard**: https://app.netlify.com
- **Netlify Docs**: https://docs.netlify.com

---

**Need Help?**
- Check build logs in Netlify dashboard if deployment fails
- See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting

