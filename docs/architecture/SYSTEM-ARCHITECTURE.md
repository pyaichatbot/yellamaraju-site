# System Architecture Document - yellamaraju.com

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | Architecture Team | Initial Architecture for Blog Platform |

## Table of Contents
1. [Introduction](#1-introduction)
2. [Architectural Principles](#2-architectural-principles)
3. [System Context](#3-system-context)
4. [Component Architecture](#4-component-architecture)
5. [Content Architecture](#5-content-architecture)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Performance Architecture](#7-performance-architecture)
8. [SEO Architecture](#8-seo-architecture)

---

## 1. Introduction

### 1.1 Purpose
This document describes the architecture of yellamaraju.com, a static blog and thought leadership platform built with Astro. The platform serves as a content hub for AI architecture, enterprise systems, and technical writing.

### 1.2 Architectural Goals
1. **Performance**: Fast page loads, excellent Lighthouse scores
2. **Simplicity**: Static site, no backend complexity
3. **Maintainability**: Easy content updates, component-based
4. **SEO**: Optimized for search engine discovery
5. **Scalability**: Infinite scale via CDN
6. **Cost-Effectiveness**: Minimal hosting costs

### 1.3 Architectural Constraints
- **Static Site Only**: No server-side rendering at runtime
- **No Database**: Content stored in Git repository
- **No Backend**: Third-party services for dynamic features (newsletter, forms)
- **Astro Framework**: Must use Astro 4.0+ for SSG
- **MDX Content**: Blog posts must use MDX format

---

## 2. Architectural Principles

### 2.1 Static-First Architecture

**Principle**: Generate all pages at build time, serve static HTML/CSS/JS.

**Rationale**:
- Maximum performance (pre-rendered pages)
- Zero server costs (static hosting)
- Infinite scalability (CDN distribution)
- Simple deployment (Git-based)

**Implementation**:
- Astro generates static HTML at build time
- All content processed during build
- No runtime server required

---

### 2.2 Content-as-Code

**Principle**: Store content in Git repository alongside code.

**Rationale**:
- Version control for content
- Easy content updates (edit MDX files)
- No CMS complexity
- Content review via pull requests

**Implementation**:
- Blog posts as MDX files in `src/content/blog/`
- Templates as Markdown files in `public/templates/`
- Frontmatter for metadata

---

### 2.3 Component-Based Design

**Principle**: Reusable components for UI elements.

**Rationale**:
- DRY (Don't Repeat Yourself)
- Consistent design
- Easy maintenance
- Type safety with TypeScript

**Implementation**:
- Astro components in `src/components/`
- Shared layouts in `src/layouts/`
- Utility functions in `src/utils/`

---

### 2.4 Progressive Enhancement

**Principle**: Core functionality works without JavaScript.

**Rationale**:
- Better SEO (crawlers see content)
- Faster initial load
- Works with JS disabled
- Accessible by default

**Implementation**:
- Static HTML for all content
- JavaScript for enhancements (search, interactions)
- Graceful degradation

---

## 3. System Context

### 3.1 System Context Diagram

```
                    ┌─────────────┐
                    │   Readers   │
                    └──────┬──────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Static Site (CDN)   │
                │   (Netlify/Vercel)    │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                 │
          ▼                ▼                 ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │  GitHub  │    │Analytics │    │Newsletter    │
    │  (Code)  │    │(Netlify/ │    │Service       │
    │          │    │Google)   │    │(Buttondown)  │
    └──────────┘    └──────────┘    └──────────────┘
```

### 3.2 External Dependencies

| Service | Purpose | Type | Status |
|---------|---------|------|--------|
| **Netlify/Vercel** | Hosting & CDN | Infrastructure | Required |
| **GitHub** | Code repository | Version Control | Required |
| **Buttondown/ConvertKit** | Newsletter | Third-party API | Optional (P1) |
| **Formspree/Netlify Forms** | Contact form | Third-party API | Optional (P1) |
| **Google Analytics** | Analytics | Third-party | Optional (P1) |

---

## 4. Component Architecture

### 4.1 High-Level Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro
│   ├── Footer.astro
│   ├── PostCard.astro
│   ├── TagBadge.astro
│   ├── ShareLinks.astro
│   ├── SearchInput.astro
│   ├── NewsletterSignup.astro (P1)
│   └── ...
├── layouts/             # Page layouts
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── pages/               # Routes (file-based)
│   ├── index.astro
│   ├── blog/
│   │   ├── index.astro
│   │   ├── [slug].astro
│   │   └── rss.xml.ts
│   └── templates/
├── content/             # Content collections
│   └── blog/            # MDX blog posts
├── styles/              # Global styles
│   └── global.css
└── utils/               # Utility functions
    └── helpers.ts
```

### 4.2 Core Components

#### 4.2.1 BaseLayout
**Purpose**: Base layout wrapper for all pages

**Responsibilities**:
- HTML structure (head, body)
- SEO meta tags
- Global navigation
- Footer
- Analytics scripts

**Key Features**:
- Dynamic title and description
- OpenGraph tags
- Twitter Card tags
- Structured data (JSON-LD)

---

#### 4.2.2 PostLayout
**Purpose**: Layout for individual blog posts

**Responsibilities**:
- Post content rendering
- Post metadata (date, tags, reading time)
- Social sharing buttons
- Related posts section
- Newsletter signup (P1)

**Key Features**:
- MDX content rendering
- Code syntax highlighting
- Image optimization
- Table of contents (optional)

---

#### 4.2.3 PostCard
**Purpose**: Display blog post preview in listings

**Responsibilities**:
- Post title and description
- Publication date
- Tags
- Reading time
- Series badge (if applicable)

---

#### 4.2.4 SearchInput
**Purpose**: Client-side search functionality

**Responsibilities**:
- Search input UI
- Search index loading
- Search execution
- Results display

**Technical Implementation**:
- Search index generated at build time
- Client-side search using Fuse.js or similar
- Debounced input
- Highlighted results

---

#### 4.2.5 NewsletterSignup (P1)
**Purpose**: Collect email subscribers

**Responsibilities**:
- Email input form
- Form validation
- API integration (Buttondown/ConvertKit)
- Success/error states

**Technical Implementation**:
- Static form (no backend)
- Third-party API call
- Privacy-compliant (GDPR-ready)

---

## 5. Content Architecture

### 5.1 Content Collections

**Blog Posts** (`src/content/blog/`):
- Format: MDX
- Frontmatter: title, description, date, tags, series, draft
- Content: Markdown + Astro components

**Templates** (`public/templates/`):
- Format: Markdown
- Structure: Category-based organization
- Metadata: Managed in `src/data/templates.ts`

### 5.2 Content Flow

```
MDX File Created
    │
    ▼
Frontmatter Validated
    │
    ▼
Content Processed (MDX → HTML)
    │
    ▼
Build Time Generation
    │
    ├──→ Static HTML Pages
    ├──→ RSS Feed
    ├──→ Sitemap
    └──→ Search Index
```

### 5.3 Content Organization

**By Series** (from content strategy):
- Series 0: Foundation (1 post)
- Series 1: Foundations (5 posts)
- Series 2: RAG Deep Dive (4 posts)
- Series 3: AI Agents (5 posts)
- Series 4-8: Additional topics (22 posts)
- **Total**: 37 posts

**By Tags**:
- AI/ML
- Agentic AI
- Prompt Engineering
- Architecture
- Security
- Career
- etc.

---

## 6. Deployment Architecture

### 6.1 Build Process

```
Git Push
    │
    ▼
CI/CD Trigger (Netlify/Vercel)
    │
    ▼
Install Dependencies (npm install)
    │
    ▼
Build Site (npm run build)
    │
    ├──→ Process MDX content
    ├──→ Generate static HTML
    ├──→ Optimize images
    ├──→ Generate RSS feed
    ├──→ Generate sitemap
    └──→ Generate search index
    │
    ▼
Deploy to CDN
    │
    ▼
Site Live
```

### 6.2 Deployment Targets

**Primary**: Netlify
- Git-based deployment
- Automatic builds on push
- CDN distribution
- Free tier sufficient

**Alternative**: Vercel
- Similar features to Netlify
- Excellent performance
- Free tier available

### 6.3 Environment Configuration

**Build-Time Variables**:
- `SITE_URL`: Site URL for absolute links
- `PUBLIC_BUTTONDOWN_USERNAME`: Newsletter service (P1)
- `PUBLIC_ANALYTICS_ID`: Analytics ID (optional)

**No Runtime Variables**: Static site, no server

---

## 7. Performance Architecture

### 7.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Score | >90 | Lighthouse audit |
| Page Load Time | <2s | Network tab |
| First Contentful Paint | <1.5s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |

### 7.2 Optimization Strategies

**Build-Time Optimizations**:
- Static HTML generation (no runtime)
- Image optimization (WebP, responsive)
- CSS minification
- JavaScript bundling and minification
- Code splitting (if needed)

**Runtime Optimizations**:
- CDN distribution (global edge locations)
- HTTP/2 and HTTP/3 support
- Gzip/Brotli compression
- Browser caching headers
- Lazy loading for images

**Content Optimizations**:
- Optimized images (WebP format)
- Lazy loading below fold
- Responsive image sizing
- Minimal JavaScript (progressive enhancement)

---

## 8. SEO Architecture

### 8.1 SEO Components

**Meta Tags**:
- Title tags (50-60 chars)
- Meta descriptions (150-160 chars)
- OpenGraph tags (social sharing)
- Twitter Card tags
- Canonical URLs

**Structured Data**:
- Article schema (JSON-LD)
- Person schema (author)
- Breadcrumb schema (navigation)

**Technical SEO**:
- XML sitemap (`/sitemap.xml`)
- RSS feed (`/blog/rss.xml`)
- robots.txt
- Semantic HTML
- Heading hierarchy (H1-H4)

### 8.2 SEO Strategy

**Target Keywords** (from content strategy):
- Primary: "AI use case evaluation", "production AI agents", "RAG system architecture"
- Secondary: "AI governance", "enterprise AI security"
- Long-tail: "how to evaluate AI use cases", "production-ready LLM API wrapper"

**Content Optimization**:
- Keyword integration (natural, not forced)
- Internal linking between related posts
- External links to authoritative sources
- Image alt text
- Long-form content (2,000-4,500 words)

---

## 9. Security Architecture

### 9.1 Security Considerations

**Static Site Benefits**:
- No server to attack
- No database to breach
- No user authentication
- Minimal attack surface

**Security Measures**:
- HTTPS only (enforced by hosting)
- Content Security Policy (CSP)
- Secure third-party integrations
- Regular dependency updates
- No secrets in code

### 9.2 Third-Party Security

**Newsletter Service** (P1):
- API key in environment variable (build-time)
- HTTPS API calls only
- GDPR-compliant service

**Contact Form** (P1):
- Spam protection (honeypot or service)
- HTTPS form submission
- No data storage on site

---

## 10. Monitoring & Analytics

### 10.1 Analytics Options

**Netlify Analytics**:
- Built-in with Netlify hosting
- Page views, referrers, popular pages
- No additional setup

**Google Analytics** (Optional):
- More detailed analytics
- Custom events
- User behavior tracking
- Requires setup

### 10.2 Monitoring

**Performance Monitoring**:
- Lighthouse CI (automated audits)
- Web Vitals tracking
- Performance budgets

**Uptime Monitoring**:
- Netlify status page
- Third-party uptime monitor (optional)

---

## 11. Architecture Decision Records (ADRs)

### ADR-001: Astro for Static Site Generation
**Status**: Accepted  
**Context**: Need performant static site for blog  
**Decision**: Use Astro 4.0+ as SSG framework  
**Consequences**:
- Pro: Excellent performance, zero JS by default
- Pro: MDX support built-in
- Pro: Component-based architecture
- Con: Learning curve if new to Astro

---

### ADR-002: Static Site (No Backend)
**Status**: Accepted  
**Context**: Blog doesn't need dynamic server features  
**Decision**: Fully static site, no backend  
**Consequences**:
- Pro: Zero server costs
- Pro: Infinite scalability
- Pro: Simple deployment
- Con: Dynamic features require third-party services

---

### ADR-003: MDX for Content
**Status**: Accepted  
**Context**: Need rich content with code examples  
**Decision**: Use MDX (Markdown + JSX) for blog posts  
**Consequences**:
- Pro: Rich formatting with components
- Pro: Code examples with syntax highlighting
- Pro: Diagrams and embeds
- Con: Slightly more complex than pure Markdown

---

### ADR-004: Netlify for Hosting
**Status**: Accepted  
**Context**: Need reliable static hosting with CDN  
**Decision**: Use Netlify for hosting and deployment  
**Consequences**:
- Pro: Git-based deployment
- Pro: Built-in CDN
- Pro: Free tier sufficient
- Con: Vendor lock-in (can migrate to Vercel)

---

## 12. Future Enhancements

### Phase 2 (Months 4-6)
- Newsletter implementation (if traffic >1K/month)
- Contact form
- Enhanced search (full-text, filters)
- Related posts algorithm improvement

### Phase 3 (Months 7-12)
- Video content integration
- Podcast feed
- Comment system (static comments or third-party)
- Advanced analytics

---

## 13. Appendix

### 13.1 Technology References

| Technology | Documentation URL |
|------------|------------------|
| Astro | https://docs.astro.build |
| MDX | https://mdxjs.com |
| Netlify | https://docs.netlify.com |
| Vercel | https://vercel.com/docs |

### 13.2 Glossary

| Term | Definition |
|------|------------|
| **SSG** | Static Site Generator |
| **MDX** | Markdown with JSX components |
| **CDN** | Content Delivery Network |
| **OpenGraph** | Protocol for rich social media previews |
| **JSON-LD** | JavaScript Object Notation for Linked Data (structured data) |

---

**Document Status**: APPROVED  
**Last Updated**: 2026-01-10  
**Next Review**: 2026-04-10  
**Classification**: Internal Use Only
