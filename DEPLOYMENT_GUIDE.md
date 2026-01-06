# Deployment Guide - GitHub & Netlify

This guide will walk you through setting up GitHub repository and deploying to Netlify (free tier).

## 📋 Prerequisites

- GitHub account (free)
- Netlify account (free)
- Git installed on your machine
- All changes committed to git

## 🚀 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub:**
   - Visit https://github.com/new
   - Sign in if needed

2. **Create New Repository:**
   - **Repository name**: `yellamaraju-site` (or your preferred name)
   - **Description**: "Personal website built with Astro"
   - **Visibility**: Choose **Public** (free) or **Private** (if you have GitHub Pro)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

3. **Copy the repository URL:**
   - You'll see a page with setup instructions
   - Copy the repository URL (e.g., `https://github.com/yourusername/yellamaraju-site.git`)

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create yellamaraju-site --public --source=. --remote=origin --push
```

## 🔗 Step 2: Connect Local Repository to GitHub

Run these commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd /Users/spy/Documents/PY/self/yellamaraju-site

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/yellamaraju-site.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** If you haven't committed all changes yet:
```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Personal website with Astro"

# Then push
git push -u origin main
```

## 🌐 Step 3: Deploy to Netlify

### 3.1 Create Netlify Account

1. **Sign up for Netlify:**
   - Visit https://app.netlify.com/signup
   - Sign up with GitHub (recommended) or email
   - Complete verification if needed

### 3.2 Connect Repository

1. **Add New Site:**
   - In Netlify dashboard, click **"Add new site"**
   - Select **"Import an existing project"**
   - Choose **"Deploy with GitHub"** (or GitLab/Bitbucket)

2. **Authorize Netlify:**
   - Click **"Authorize Netlify"** to connect your GitHub account
   - Grant necessary permissions

3. **Select Repository:**
   - Find and select `yellamaraju-site` from your repositories
   - Click **"Connect"**

### 3.3 Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: Select **Node 18** or **Node 20** (from dropdown)

Click **"Deploy site"**

### 3.4 Wait for Deployment

- Netlify will install dependencies and build your site
- This takes 1-3 minutes
- You'll see build logs in real-time
- Once complete, you'll get a URL like: `https://random-name-123456.netlify.app`

## 🎨 Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Netlify

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `yellamaraju.com` (or `www.yellamaraju.com`)
4. Follow DNS configuration instructions

### 4.2 Configure DNS

**Option A: Use Netlify DNS (Easiest)**
- In Netlify: Domain settings → **"Use Netlify DNS"**
- Update nameservers at your domain registrar

**Option B: Configure at Your Registrar**
- Add DNS records as shown in Netlify dashboard
- Usually requires:
  - A record pointing to Netlify IP
  - CNAME for www subdomain

### 4.3 SSL Certificate

- Netlify automatically provisions SSL certificates (Let's Encrypt)
- Takes a few minutes to activate
- Your site will be available at `https://yellamaraju.com`

## 🔄 Step 5: Continuous Deployment

### Automatic Deployments

Netlify automatically deploys when you push to GitHub:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. **Netlify automatically rebuilds** (watch in Netlify dashboard)

### Deploy Preview

- Every pull request gets a preview URL
- Test changes before merging
- Share preview links with others

## 📊 Step 6: Monitor Your Site

### Netlify Dashboard Features

- **Deploys**: See all deployments and their status
- **Analytics**: View site traffic (free tier has limits)
- **Forms**: Handle form submissions (if you add forms)
- **Functions**: Serverless functions (if needed)

### Useful Netlify Features

1. **Environment Variables:**
   - Site settings → Environment variables
   - Add variables like API keys (if needed)

2. **Build Hooks:**
   - Trigger rebuilds manually or via webhook

3. **Split Testing:**
   - Test different versions of your site

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Netlify dashboard
2. **Common issues:**
   - Node version mismatch → Set Node version in Netlify settings
   - Missing dependencies → Ensure `package.json` is correct
   - Build errors → Test locally with `npm run build`

### Site Not Updating

1. **Clear Netlify cache:**
   - Deploys → Trigger deploy → Clear cache and deploy site

2. **Check build logs:**
   - Ensure build completes successfully

### Domain Issues

1. **DNS propagation:**
   - Can take up to 48 hours
   - Check with: https://dnschecker.org

2. **SSL certificate:**
   - Usually auto-provisions within minutes
   - Check SSL status in Netlify dashboard

## ✅ Verification Checklist

- [ ] GitHub repository created and connected
- [ ] Code pushed to GitHub
- [ ] Netlify account created
- [ ] Site deployed successfully
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Site accessible at your domain
- [ ] Test automatic deployment (make a small change and push)

## 🎉 You're Done!

Your site is now live and will automatically deploy whenever you push changes to GitHub!

**Next Steps:**
- Share your site URL
- Update social media profiles
- Submit to search engines (Google Search Console)
- Monitor analytics in Netlify dashboard

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Documentation](https://docs.github.com)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/netlify/)

---

**Need Help?**
- Check Netlify status: https://www.netlifystatus.com
- Netlify Community: https://answers.netlify.com
- GitHub Issues: Create an issue in your repository

