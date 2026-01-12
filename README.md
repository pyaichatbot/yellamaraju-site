# yellamaraju.com - Professional Website

An editorial-style personal website built with Astro, featuring a publishing-first design for technical writing and thought leadership.

## 🎯 Overview

This is a static site built for **Praveen Srinag Yellamaraju**, an AI Architect and enterprise systems specialist. The site focuses on:

- **Long-form technical writing** with MDX support
- **Professional credibility** for engineering leaders and recruiters
- **Content discoverability** through tags and search
- **Social sharing** optimized for X (Twitter) and LinkedIn

## 🏗️ Architecture

### Tech Stack
- **Framework**: Astro 4.0 (Static Site Generator)
- **Content**: MDX for blog posts with rich components
- **Styling**: Custom CSS with editorial typography
- **Fonts**: Charter (serif body), Source Sans Pro (sans-serif headings), JetBrains Mono (code)
- **Deployment**: Netlify (recommended) or Vercel

### Key Features
- ✅ Static-only (no backend, no database)
- ✅ MDX blog posts with code blocks, Mermaid diagrams, YouTube embeds
- ✅ SEO optimized (OpenGraph, Twitter Cards, RSS feed, sitemap)
- ✅ Tag-based filtering and organization
- ✅ Social sharing on X and LinkedIn
- ✅ Responsive design (mobile-first)
- ✅ Performance optimized images

## 📁 Project Structure

```
yellamaraju-site/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── TagBadge.astro
│   │   ├── ShareLinks.astro
│   │   ├── YouTubeEmbed.astro
│   │   ├── Callout.astro
│   │   └── Mermaid.astro
│   ├── content/           # Blog content (MDX files)
│   │   ├── blog/
│   │   │   ├── building-production-ai-agents.mdx
│   │   │   ├── prompt-engineering-beyond-basics.mdx
│   │   │   └── why-i-chose-ai-architecture.mdx
│   │   └── config.ts      # Content collection schema
│   ├── layouts/           # Page layouts
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/             # Routes
│   │   ├── index.astro           # Homepage
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── resume.astro
│   │   ├── blog/
│   │   │   ├── index.astro       # Blog listing
│   │   │   ├── [slug].astro      # Individual posts
│   │   │   └── rss.xml.ts        # RSS feed
│   │   └── tags/
│   │       └── [tag].astro       # Tag pages
│   ├── styles/
│   │   └── global.css     # Global styles
│   ├── utils/
│   │   └── helpers.ts     # Utility functions
│   └── config.ts          # Site configuration
├── public/                # Static assets
│   ├── images/
│   │   └── praveen.jpg    # Profile photo
│   ├── resume/
│   │   └── PraveenSrinagYellamaraju_CV.pdf
│   └── favicon.svg
├── astro.config.mjs       # Astro configuration
├── package.json
├── tsconfig.json
├── netlify.toml          # Netlify configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd yellamaraju-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Site will be available at `http://localhost:4321`

4. **Build for production:**
   ```bash
   npm run build
   ```
   
   Output goes to `dist/` directory

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## ✍️ Adding Blog Posts

### Create a New Post

1. **Create MDX file** in `src/content/blog/`:
   ```bash
   touch src/content/blog/my-new-post.mdx
   ```

2. **Add frontmatter** (required fields):
   ```mdx
   ---
   title: "Your Post Title"
   description: "A compelling description for SEO and social sharing"
   date: 2025-01-06
   tags: ["AI/ML", "Architecture", "Leadership"]
   ---
   ```

3. **Write content** with MDX features:
   ```mdx
   import YouTubeEmbed from '../../components/YouTubeEmbed.astro';
   import Callout from '../../components/Callout.astro';
   import Mermaid from '../../components/Mermaid.astro';
   
   Your content here...
   
   <Callout type="info" title="Pro Tip">
   This creates a highlighted callout box.
   </Callout>
   
   <YouTubeEmbed id="VIDEO_ID" title="Video Title" />
   
   <Mermaid chart={`
   graph TD
       A[Start] --> B[Process]
       B --> C[End]
   `} />
   ```

### Post Frontmatter Options

```typescript
{
  title: string;         // Required: Post title
  description: string;   // Required: SEO description
  date: Date;           // Required: Publication date
  tags: string[];       // Required: Array of tags
  image?: string;       // Optional: Social sharing image
  draft?: boolean;      // Optional: Hide from production (default: false)
}
```

### Available Components

1. **Callout** - Highlighted information boxes
   ```mdx
   <Callout type="info|warning|success|error" title="Optional Title">
   Your content here
   </Callout>
   ```

2. **YouTubeEmbed** - Responsive video embeds
   ```mdx
   <YouTubeEmbed id="VIDEO_ID" title="Video Description" />
   ```

3. **Mermaid** - Diagrams and flowcharts
   ```mdx
   <Mermaid chart={`
   graph LR
       A --> B
       B --> C
   `} />
   ```

## 🎨 Customization

### Site Configuration

Edit `src/config.ts`:
```typescript
export const SITE = {
  title: 'Your Name',
  description: 'Your professional tagline',
  author: 'Your Name',
  url: 'https://yourdomain.com',
  // ... more settings
};
```

### Styling

- **Colors**: Edit CSS variables in `src/styles/global.css`
- **Typography**: Change font families in `src/styles/global.css`
- **Layout**: Adjust spacing/sizing via CSS custom properties

### Adding Pages

Create `.astro` files in `src/pages/`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="New Page">
  <div class="container">
    <h1>New Page Content</h1>
  </div>
</BaseLayout>
```

## 🌐 Deployment

### Netlify (Recommended)

1. **Connect repository to Netlify:**
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Build settings** (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add your resume PDF:**
   - Upload `PraveenSrinagYellamaraju_CV_Updated.docx` converted to PDF
   - Place at `public/resume/PraveenSrinagYellamaraju_CV.pdf`

4. **Set up custom domain:**
   - In Netlify dashboard: Site settings → Domain management
   - Add custom domain: `yellamaraju.com`
   - Configure DNS (use Netlify DNS or update your registrar)

### Vercel Alternative

```bash
npm install -g vercel
vercel --prod
```

### Manual Deployment

```bash
npm run build
# Upload contents of dist/ to your hosting provider
```

## 📝 Content Guidelines

### Writing Style
- **Editorial tone**: Professional but approachable
- **Long-form**: Posts should be 1000-3000 words
- **Technical depth**: Balance theory with practical examples
- **Code examples**: Always include syntax highlighting

### SEO Best Practices
- Compelling titles (50-60 characters)
- Descriptions (150-160 characters)
- Use relevant tags
- Include images where appropriate
- Internal linking between related posts

### Social Sharing
- Posts auto-generate OpenGraph and Twitter Card meta tags
- Use the ShareLinks component at the end of posts
- Test sharing on [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 🔧 Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Adding New Tags
Tags are automatically generated from post frontmatter. Just use them in your posts.

### Monitoring
- Use Netlify Analytics (built-in)
- Or add Google Analytics in `BaseLayout.astro`

## 📄 License

This website design and code structure can be used as a template. Content and personal branding are © Praveen Srinag Yellamaraju.

## 🤝 Support

For questions about the site structure or customization:
- Open an issue in the repository
- Contact via [website contact form](https://yellamaraju.com/contact)

## 📚 Additional Resources

- [Astro Documentation](https://docs.astro.build)
- [MDX Documentation](https://mdxjs.com)
- [Netlify Documentation](https://docs.netlify.com)
- [Mermaid Chart Documentation](https://mermaid.js.org)

---

Built with ❤️ using Astro. Deployed on Netlify.
