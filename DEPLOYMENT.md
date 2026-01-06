# Deployment Checklist for yellamaraju.com

## Pre-Deployment Tasks

### 1. Content Preparation
- [ ] Add your resume PDF to `public/resume/PraveenSrinagYellamaraju_CV.pdf`
- [ ] Verify profile image at `public/images/praveen.jpg` looks good
- [ ] Write at least 3-5 blog posts before launch
- [ ] Review all pages for typos and broken links
- [ ] Update contact email in `src/pages/contact.astro` if needed

### 2. Configuration
- [ ] Update `src/config.ts` with your actual Twitter handle (if available)
- [ ] Verify LinkedIn URL in `src/config.ts`
- [ ] Check site URL in `astro.config.mjs` matches your domain
- [ ] Review all page titles and descriptions for SEO

### 3. Testing Locally
```bash
npm run build
npm run preview
```
- [ ] Test all navigation links
- [ ] Verify blog posts render correctly
- [ ] Test tag pages work
- [ ] Check mobile responsiveness
- [ ] Test social share buttons
- [ ] Verify RSS feed at `/blog/rss.xml`

## Netlify Deployment

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit: yellamaraju.com website"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub/GitLab account
4. Select your repository
5. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Step 3: Configure Custom Domain
1. In Netlify dashboard, go to: Site settings → Domain management
2. Click "Add custom domain"
3. Enter: `yellamaraju.com`
4. Choose one of these DNS options:

   **Option A: Use Netlify DNS (Recommended)**
   - Add domain in Netlify
   - Update nameservers at your domain registrar to Netlify's nameservers
   - Netlify will automatically configure DNS and SSL

   **Option B: Use External DNS**
   - Add A record: `@ → 75.2.60.5` (Netlify's load balancer)
   - Add CNAME record: `www → <your-site>.netlify.app`
   - Enable SSL in Netlify dashboard

### Step 4: Enable HTTPS
- [ ] Verify SSL certificate is provisioned (automatic with Netlify DNS)
- [ ] Test HTTPS access: `https://yellamaraju.com`
- [ ] Enable "Force HTTPS" in domain settings

### Step 5: Configure Redirects
The `netlify.toml` file already includes:
- Resume PDF redirect
- Security headers
- Cache headers for assets

## Post-Deployment Verification

### Technical Checks
- [ ] Site loads at `https://yellamaraju.com`
- [ ] All pages accessible (/, /blog, /about, /resume, /contact)
- [ ] Blog posts display correctly
- [ ] Tag pages work
- [ ] RSS feed accessible at `/blog/rss.xml`
- [ ] Favicon displays correctly
- [ ] Mobile responsive on various devices

### SEO Verification
- [ ] Test OpenGraph tags with [OpenGraph Preview](https://www.opengraph.xyz/)
- [ ] Test Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Submit sitemap to Google Search Console: `https://yellamaraju.com/sitemap-index.xml`
- [ ] Verify robots.txt is accessible: `https://yellamaraju.com/robots.txt`

### Performance Checks
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Check [GTmetrix](https://gtmetrix.com/)
- [ ] Verify images are optimized
- [ ] Test load times on 3G network

### Social Media Setup
- [ ] Share first blog post on LinkedIn
- [ ] Share first blog post on X (Twitter)
- [ ] Update LinkedIn profile with website URL
- [ ] Pin website link on X profile (if applicable)

## Optional Enhancements

### Analytics (Optional)
Add Google Analytics or Plausible to `src/layouts/BaseLayout.astro`:

```astro
{/* Google Analytics */}
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Newsletter Integration (Optional)
Update the subscribe CTA in `src/layouts/PostLayout.astro` to include:
- Mailchimp form
- ConvertKit form
- Substack embed
- Or any other email service provider

### Comments System (Optional)
While the site is static-only by design, you could add:
- Giscus (GitHub Discussions)
- Utterances (GitHub Issues)
- Disqus
- Just add the embed code to `PostLayout.astro`

## Maintenance Schedule

### Weekly
- [ ] Check for broken links
- [ ] Review analytics (if enabled)
- [ ] Respond to any contact form submissions

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and update old blog posts
- [ ] Check for security updates: `npm audit`

### Quarterly
- [ ] Review SEO performance
- [ ] Update resume if needed
- [ ] Refresh profile photo if desired
- [ ] Major dependency upgrades

## Troubleshooting Common Issues

### Build Fails on Netlify
1. Check build logs for errors
2. Verify Node.js version (should be 18+)
3. Try building locally: `npm run build`
4. Check for missing dependencies

### Images Not Loading
- Verify images are in `public/` directory
- Check file paths are correct (case-sensitive)
- Ensure images are committed to git

### RSS Feed Not Updating
- Rebuild and redeploy the site
- RSS feeds are generated at build time
- Clear CDN cache if using one

### Custom Domain Not Working
- Verify DNS records are correct
- DNS changes can take 24-48 hours to propagate
- Use [DNS Checker](https://dnschecker.org/) to verify

## Contact & Support

For technical issues:
- Check Astro documentation: https://docs.astro.build
- Netlify support: https://docs.netlify.com

For content questions:
- Review the README.md
- Check example blog posts for formatting

---

**Deployment Complete!** 🎉

Your site should now be live at https://yellamaraju.com

Next steps:
1. Share your first blog post
2. Update LinkedIn with new website
3. Start planning your content calendar
4. Consider setting up analytics
