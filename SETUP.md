# Quick Setup Guide for yellamaraju.com

## What You Have

A complete, production-ready Astro website with:
- ✅ Professional editorial design
- ✅ 3 example blog posts (MDX format)
- ✅ All pages: Home, Blog, About, Resume, Contact
- ✅ SEO optimized (OpenGraph, Twitter Cards, RSS, Sitemap)
- ✅ Responsive design
- ✅ Social sharing for X and LinkedIn
- ✅ Your profile photo included
- ✅ Your resume (DOCX) included (needs PDF conversion)

## Before You Start

**IMPORTANT**: Convert your resume to PDF:
1. Open `public/resume/PraveenSrinagYellamaraju_CV_Updated.docx`
2. Export/Save As PDF
3. Name it: `PraveenSrinagYellamaraju_CV.pdf`
4. Place it in the same `public/resume/` directory
5. Delete the DOCX file (optional)

## Step-by-Step Setup

### 1. Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/ (get LTS version 18+)
- Verify installation: `node --version` (should show v18 or higher)

### 2. Navigate to Project
```bash
cd yellamaraju-site
```

### 3. Install Dependencies
```bash
npm install
```
This will take 1-2 minutes.

### 4. Start Development Server
```bash
npm run dev
```

The site will open at: `http://localhost:4321`

### 5. Customize Content

#### Update Site Configuration
Edit `src/config.ts`:
```typescript
export const SITE = {
  title: 'Praveen Srinag Yellamaraju',
  description: 'Your professional tagline...',
  author: 'Praveen Srinag Yellamaraju',
  url: 'https://yellamaraju.com',
  twitter: '@your_twitter_handle', // Update if you have one
  linkedin: 'www.linkedin.com/in/praveensrinagy'
};
```

#### Update Contact Email
Edit `src/pages/contact.astro` line ~46:
```astro
<a href="mailto:your-email@example.com" class="contact-link">
  your-email@example.com
</a>
```

### 6. Write Your First Blog Post

Create a new file: `src/content/blog/my-first-post.mdx`

```mdx
---
title: "My First Blog Post"
description: "A brief description for SEO and social sharing"
date: 2025-01-06
tags: ["AI/ML", "Career"]
---

import Callout from '../../components/Callout.astro';

Your content goes here...

<Callout type="info" title="Pro Tip">
Use callouts to highlight important information.
</Callout>

## Heading 2

More content with **bold** and *italic* text.

```python
# Code blocks with syntax highlighting
def hello_world():
    print("Hello, World!")
```
```

The blog post will automatically appear on your homepage and blog page!

### 7. Build for Production

When you're ready to deploy:
```bash
npm run build
```

This creates optimized files in the `dist/` directory.

Test the production build:
```bash
npm run preview
```

## Next Steps

1. **Write More Content**
   - Add 3-5 blog posts before launch
   - Use the examples as templates
   - Focus on topics you're passionate about

2. **Deploy to Netlify**
   - Follow the detailed instructions in `DEPLOYMENT.md`
   - It's free for personal sites
   - Automatic HTTPS and global CDN

3. **Share Your Work**
   - Share first post on LinkedIn
   - Update LinkedIn profile with website URL
   - Consider writing regularly (weekly/monthly)

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Maintenance
npm update              # Update dependencies
npm audit fix          # Fix security issues
```

## File Structure Overview

```
yellamaraju-site/
├── src/
│   ├── content/blog/          # Your blog posts (MDX)
│   ├── pages/                 # Website pages
│   ├── components/            # Reusable UI components
│   ├── layouts/               # Page templates
│   └── config.ts              # Site configuration
├── public/                    # Static files
│   ├── images/                # Images (your photo, etc.)
│   └── resume/                # Your resume PDF
└── README.md                  # Full documentation
```

## Need Help?

1. **Full Documentation**: See `README.md`
2. **Deployment Guide**: See `DEPLOYMENT.md`
3. **Example Posts**: Check `src/content/blog/` for formatting examples
4. **Astro Docs**: https://docs.astro.build

## Design Philosophy

This website is built with:
- **Editorial aesthetic**: Typography-focused, timeless design
- **Publishing-first**: Optimized for long-form technical writing
- **Professional**: Appeals to engineering leaders and CTOs
- **No AI clichés**: No neon gradients, robot imagery, or trendy effects
- **Performance**: Fast loading, optimized images, clean code

## Tips for Success

1. **Write Consistently**: Aim for 1-2 posts per month
2. **Quality Over Quantity**: Well-researched 2000-word posts > rushed 500-word posts
3. **Share Strategically**: LinkedIn for professional audience, X for tech community
4. **Build Credibility**: Share practical insights from real projects
5. **Engage**: Respond to comments and messages

## What Makes This Different

Unlike typical personal sites or AI-themed landing pages, this is:
- A **publishing platform** first, not a resume site
- **Editorial in style**, like a technical magazine
- **Focused on content**, not flashy features
- **Professional and timeless**, avoiding trends

---

**You're all set!** 🚀

Start by customizing the config, writing your first post, and then deploy to Netlify.

Questions? Check the README.md or reach out for support.

Good luck with your new website!
