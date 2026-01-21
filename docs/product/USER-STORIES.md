# User Stories - yellamaraju.com Blog Platform

## Document Control
| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | 2026-01-10 | Product Team | Ready for Implementation |
| 1.1 | 2026-01-13 | Product Team | Added Epic 10: Ask Praveen.AI Chatbot Feature |

---

## Story Organization

Stories are organized into **Epics** (high-level features) and broken down into **atomic stories** (implementable in 1-3 days).

**Priority Levels**:
- **P0**: Must Have (MVP blocker)
- **P1**: Should Have (important but not blocker)
- **P2**: Nice to Have (future enhancement)

**Story Points** (Fibonacci): 1, 2, 3, 5, 8, 13

---

## Epic 1: Content Publishing & Management

### Story 1.1: Blog Post Creation Workflow
**Epic**: Content Publishing  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 1

**User Story**:
> As a content creator, I want to create blog posts using MDX, so I can write rich technical content with code examples and diagrams.

**Acceptance Criteria**:
- [ ] MDX files can be created in `src/content/blog/`
- [ ] Frontmatter schema validated (title, description, date, tags required)
- [ ] Posts render correctly with syntax highlighting
- [ ] Code blocks support multiple languages (Python, TypeScript, Bash)
- [ ] Images can be embedded and optimized
- [ ] Draft posts hidden from production (`draft: true`)

**Technical Tasks**:
1. Verify Astro content collections configured
2. Test MDX frontmatter validation
3. Test code syntax highlighting
4. Test image optimization
5. Test draft post filtering

**Dependencies**: None (Astro setup complete)

**Testing**:
```bash
# Create test post
# Verify frontmatter validation
# Check rendering in dev server
# Verify draft posts don't appear in production
```

---

### Story 1.2: Content Series Support
**Epic**: Content Publishing  
**Priority**: P1  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a content creator, I want to organize posts into series, so readers can follow learning paths.

**Acceptance Criteria**:
- [ ] Frontmatter supports `series` and `seriesPart` fields
- [ ] Series navigation (previous/next) appears on post pages
- [ ] Series index page shows all posts in series
- [ ] PostCard component displays series badge

**Technical Tasks**:
1. Add series fields to content schema
2. Create series navigation component
3. Add series index page
4. Update PostCard to show series

**Dependencies**: Story 1.1

---

### Story 1.3: Reading Time Calculation
**Epic**: Content Publishing  
**Priority**: P0  
**Story Points**: 1  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to see estimated reading time, so I can plan my reading.

**Acceptance Criteria**:
- [ ] Reading time calculated from post body
- [ ] Displayed on post cards and post pages
- [ ] Formula: ~200 words per minute
- [ ] Rounded to nearest minute

**Technical Tasks**:
1. Create `calculateReadingTime` utility function
2. Add to PostCard component
3. Add to PostLayout component

**Dependencies**: Story 1.1

---

## Epic 2: Content Discovery & Navigation

### Story 2.1: Tag-Based Filtering
**Epic**: Content Discovery  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to filter posts by tags, so I can find content on specific topics.

**Acceptance Criteria**:
- [ ] Tag filter buttons on blog index page
- [ ] Clicking tag shows only posts with that tag
- [ ] Active tag highlighted
- [ ] "All" option shows all posts
- [ ] URL updates with tag parameter (`/blog?tag=AI/ML`)

**Technical Tasks**:
1. Extract unique tags from all posts
2. Create tag filter component
3. Implement tag filtering logic
4. Update URL with query params

**Dependencies**: Story 1.1

**Testing**:
```typescript
// Test tag filtering
// Test URL updates
// Test "All" option
// Test multiple tags (if supported)
```

---

### Story 2.2: Full-Text Search
**Epic**: Content Discovery  
**Priority**: P1  
**Story Points**: 5  
**Sprint**: Sprint 2

**User Story**:
> As a reader, I want to search blog posts by keywords, so I can find specific content quickly.

**Acceptance Criteria**:
- [ ] Search input on blog and templates pages
- [ ] Client-side search (no backend)
- [ ] Search index generated at build time
- [ ] Search matches title, description, and content
- [ ] Results highlighted
- [ ] Search works on mobile

**Technical Tasks**:
1. Create search index generator (`generate-search-index.ts`)
2. Generate index at build time
3. Create SearchInput component
4. Implement client-side search logic
5. Add search results highlighting
6. Test performance with large content

**Dependencies**: Story 1.1

**Technical Implementation**:
```typescript
// Generate search index from all posts
// Store in public/search-index.json
// Client-side search using Fuse.js or similar
// Debounce search input
```

---

### Story 2.3: Related Posts Suggestions
**Epic**: Content Discovery  
**Priority**: P1  
**Story Points**: 3  
**Sprint**: Sprint 2

**User Story**:
> As a reader, I want to see related posts, so I can continue reading on similar topics.

**Acceptance Criteria**:
- [ ] "Read Next" section at end of posts
- [ ] Suggestions based on shared tags
- [ ] Limit to 3-5 related posts
- [ ] Exclude current post
- [ ] Fallback to recent posts if no tag matches

**Technical Tasks**:
1. Create `getRelatedPosts` utility function
2. Add RelatedPosts component
3. Integrate into PostLayout
4. Test with posts that have no shared tags

**Dependencies**: Story 1.1, Story 2.1

---

## Epic 3: Templates & Resources

### Story 3.1: Template Listing Page
**Epic**: Templates  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to browse available templates, so I can find downloadable resources.

**Acceptance Criteria**:
- [ ] Templates page at `/templates`
- [ ] Templates organized by category
- [ ] Featured templates section
- [ ] Template cards with title, description, category
- [ ] Search functionality (reuse from Story 2.2)

**Technical Tasks**:
1. Create templates data structure (`src/data/templates.ts`)
2. Create template categories
3. Create TemplateCard component
4. Create templates index page
5. Add featured template logic

**Dependencies**: None

---

### Story 3.2: Individual Template Pages
**Epic**: Templates  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to view template details and download, so I can use the resources.

**Acceptance Criteria**:
- [ ] Template detail pages at `/templates/[category]/[slug]`
- [ ] Template content rendered (Markdown)
- [ ] Download button/link
- [ ] Template metadata (category, date, description)
- [ ] Related templates section

**Technical Tasks**:
1. Create template detail page route
2. Create TemplateLayout component
3. Add download functionality
4. Add related templates logic

**Dependencies**: Story 3.1

---

## Epic 4: SEO & Social Sharing

### Story 4.1: SEO Meta Tags
**Epic**: SEO  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a content creator, I want SEO meta tags automatically generated, so posts rank well in search.

**Acceptance Criteria**:
- [ ] Title tags (50-60 chars)
- [ ] Meta descriptions (150-160 chars)
- [ ] OpenGraph tags for social sharing
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] Structured data (JSON-LD) for articles

**Technical Tasks**:
1. Add SEO component to BaseLayout
2. Generate meta tags from frontmatter
3. Add OpenGraph tags
4. Add Twitter Card tags
5. Add JSON-LD structured data

**Dependencies**: Story 1.1

---

### Story 4.2: Social Sharing Buttons
**Epic**: Social Sharing  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to share posts on social media, so I can discuss with my network.

**Acceptance Criteria**:
- [ ] Share buttons (Twitter/X, LinkedIn)
- [ ] Pre-filled share text with post title
- [ ] Share URL includes post link
- [ ] Buttons accessible (keyboard navigation)
- [ ] Mobile-friendly

**Technical Tasks**:
1. Create ShareLinks component
2. Add Twitter share link
3. Add LinkedIn share link
4. Integrate into PostLayout
5. Test on mobile

**Dependencies**: Story 1.1

---

### Story 4.3: RSS Feed Generation
**Epic**: SEO  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want to subscribe via RSS, so I can read in my preferred reader.

**Acceptance Criteria**:
- [ ] RSS feed at `/blog/rss.xml`
- [ ] Includes all published posts
- [ ] Proper RSS 2.0 format
- [ ] Includes title, description, date, author
- [ ] Auto-updates on new posts

**Technical Tasks**:
1. Create RSS feed endpoint (`src/pages/blog/rss.xml.ts`)
2. Generate RSS from blog collection
3. Format according to RSS 2.0 spec
4. Test in RSS reader

**Dependencies**: Story 1.1

---

### Story 4.4: XML Sitemap
**Epic**: SEO  
**Priority**: P0  
**Story Points**: 1  
**Sprint**: Sprint 1

**User Story**:
> As a search engine, I want a sitemap, so I can discover all pages efficiently.

**Acceptance Criteria**:
- [ ] Sitemap at `/sitemap.xml`
- [ ] Includes all blog posts
- [ ] Includes all static pages
- [ ] Proper XML format
- [ ] Last modified dates

**Technical Tasks**:
1. Configure Astro sitemap integration
2. Verify all pages included
3. Test sitemap validation

**Dependencies**: None

---

## Epic 5: Newsletter Integration

### Story 5.1: Newsletter Signup Component
**Epic**: Newsletter  
**Priority**: P1  
**Story Points**: 3  
**Sprint**: Sprint 2

**User Story**:
> As a reader, I want to subscribe to updates, so I'm notified of new content.

**Acceptance Criteria**:
- [ ] NewsletterSignup component created
- [ ] Email validation
- [ ] Success/error states
- [ ] Privacy note (GDPR-compliant)
- [ ] Accessible (ARIA labels)
- [ ] Responsive design

**Technical Tasks**:
1. Create NewsletterSignup.astro component
2. Integrate with Buttondown API (or chosen service)
3. Add form validation
4. Add success/error handling
5. Style to match site theme

**Dependencies**: None (can be implemented when traffic warrants)

**Implementation Notes**: See `NEWSLETTER_IMPLEMENTATION.md` for detailed plan.

---

### Story 5.2: Newsletter Signup Placement
**Epic**: Newsletter  
**Priority**: P1  
**Story Points**: 1  
**Sprint**: Sprint 2

**User Story**:
> As a content creator, I want newsletter signup at strategic locations, so I maximize subscriptions.

**Acceptance Criteria**:
- [ ] Newsletter signup at end of blog posts
- [ ] Optional: Footer signup
- [ ] Optional: Homepage signup
- [ ] Consistent styling across placements

**Technical Tasks**:
1. Add NewsletterSignup to PostLayout (end of post)
2. Optionally add to Footer
3. Optionally add to homepage
4. Test all placements

**Dependencies**: Story 5.1

---

## Epic 6: Professional Pages

### Story 6.1: About Page Enhancement
**Epic**: Professional Credibility  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a visitor, I want to learn about the author's background, so I can assess credibility.

**Acceptance Criteria**:
- [ ] Professional bio
- [ ] Expertise areas listed
- [ ] Key achievements highlighted
- [ ] Professional photo
- [ ] Contact information
- [ ] Links to social profiles

**Technical Tasks**:
1. Review existing About page
2. Enhance content based on content strategy
3. Add professional achievements
4. Ensure photo is optimized
5. Add social links

**Dependencies**: None

---

### Story 6.2: Resume/CV Page
**Epic**: Professional Credibility  
**Priority**: P0  
**Story Points**: 1  
**Sprint**: Sprint 1

**User Story**:
> As a recruiter, I want to download the resume, so I can evaluate the candidate.

**Acceptance Criteria**:
- [ ] Resume page at `/resume`
- [ ] PDF download available
- [ ] Link in navigation
- [ ] Resume preview (optional)

**Technical Tasks**:
1. Verify resume PDF in `public/resume/`
2. Create resume page
3. Add download link
4. Test download functionality

**Dependencies**: None

---

### Story 6.3: Contact Form
**Epic**: Professional Credibility  
**Priority**: P1  
**Story Points**: 3  
**Sprint**: Sprint 2

**User Story**:
> As a visitor, I want to contact the author, so I can ask questions or discuss opportunities.

**Acceptance Criteria**:
- [ ] Contact form on contact page
- [ ] Fields: name, email, message
- [ ] Spam protection (honeypot or service)
- [ ] Success/error states
- [ ] No backend required (static site compatible)

**Technical Tasks**:
1. Create contact form component
2. Integrate with Formspree or Netlify Forms
3. Add form validation
4. Add success/error handling
5. Test form submission

**Dependencies**: None

---

## Epic 7: Performance & Optimization

### Story 7.1: Image Optimization
**Epic**: Performance  
**Priority**: P0  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a reader, I want fast page loads, so I don't wait for images to load.

**Acceptance Criteria**:
- [ ] Images optimized (WebP format)
- [ ] Lazy loading for below-fold images
- [ ] Responsive image sizing
- [ ] Alt text for accessibility
- [ ] Image optimization in build process

**Technical Tasks**:
1. Configure Astro image optimization
2. Use `<Image>` component for all images
3. Add lazy loading
4. Verify WebP generation
5. Test on slow connections

**Dependencies**: None

---

### Story 7.2: Performance Monitoring
**Epic**: Performance  
**Priority**: P1  
**Story Points**: 2  
**Sprint**: Sprint 2

**User Story**:
> As a content creator, I want to monitor site performance, so I can ensure fast load times.

**Acceptance Criteria**:
- [ ] Lighthouse score >90
- [ ] Page load time <2s
- [ ] First Contentful Paint <1.5s
- [ ] Analytics configured (Netlify or Google Analytics)
- [ ] Performance alerts (optional)

**Technical Tasks**:
1. Run Lighthouse audit
2. Fix performance issues
3. Configure analytics
4. Set up performance monitoring
5. Document performance targets

**Dependencies**: None

---

## Epic 10: Ask Praveen.AI Chatbot Feature

### Story 10.1: Build-Time RAG Content Preparation
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want blog content automatically chunked and indexed at build time, so the chatbot can retrieve relevant content efficiently.

**Acceptance Criteria**:
- [ ] Build script parses all MDX blog posts from `src/content/blog/*.mdx`
- [ ] Extracts frontmatter (title, slug, date, tags, URL)
- [ ] Chunks body text (300-600 tokens, 100-token overlap)
- [ ] Builds Lunr search index (JSON) with chunk metadata
- [ ] Stores chunks + metadata in Netlify Blobs
- [ ] Index generated on every deployment
- [ ] Chunks include: text, postUrl, postTitle, chunkId, metadata

**Technical Tasks**:
1. Create `scripts/generate-rag-index.ts` build script
2. Install dependencies: `lunr`, `@langchain/text-splitter` (or custom chunker)
3. Parse blog collection using Astro content API
4. Implement text chunking (300-600 tokens, 100-token overlap)
5. Build Lunr index with fields: title, description, body, tags
6. Store chunks in Netlify Blobs (or static JSON if <10MB)
7. Add build step to `package.json` scripts
8. Test with all existing blog posts

**Dependencies**: Story 1.1 (Blog Post Creation)

**Technical Implementation**:
```typescript
// scripts/generate-rag-index.ts
// - Read all blog posts from Astro collection
// - Chunk each post body (300-600 tokens, 100 overlap)
// - Build Lunr index with chunk metadata
// - Export to public/rag-index.json (or Netlify Blobs)
```

**Testing**:
- [ ] Verify all published posts are chunked
- [ ] Verify chunk sizes (300-600 tokens)
- [ ] Verify overlap (100 tokens)
- [ ] Verify Lunr index is searchable
- [ ] Test with posts of various lengths
- [ ] Verify metadata (postUrl, postTitle, chunkId) included

---

### Story 10.2: Chat Widget UI Component
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 3

**User Story**:
> As a reader, I want a chat widget on blog posts, so I can ask questions about the content.

**Acceptance Criteria**:
- [ ] Chat widget appears on blog post pages
- [ ] Floating button or fixed position (bottom-right)
- [ ] Opens/closes chat interface
- [ ] Input field for user queries
- [ ] Message history display
- [ ] Loading state during LLM calls
- [ ] Error handling with user-friendly messages
- [ ] Responsive design (mobile/desktop)
- [ ] Accessible (keyboard navigation, ARIA labels)

**Technical Tasks**:
1. Create `AskAIChatbot.astro` component
2. Create chat widget styles (matches site theme)
3. Implement open/close state management
4. Add message input and send button
5. Add message history display
6. Add loading spinner
7. Add error state UI
8. Test keyboard shortcuts (Enter to send, Esc to close)
9. Test on mobile devices

**Dependencies**: Story 10.1

**Technical Implementation**:
```astro
<!-- src/components/AskAIChatbot.astro -->
<!-- Floating chat widget with message history -->
```

**Testing**:
- [ ] Widget appears on blog post pages
- [ ] Opens/closes correctly
- [ ] Input accepts text
- [ ] Enter key sends message
- [ ] Esc key closes widget
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

---

### Story 10.3: Client-Side Lexical Search (Lunr)
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 3

**User Story**:
> As a reader, I want relevant blog chunks retrieved client-side, so the chatbot has context before calling the LLM.

**Acceptance Criteria**:
- [ ] Lunr index loaded from `public/rag-index.json`
- [ ] Search function retrieves top 5 chunks by lexical match
- [ ] Search works on current post URL context
- [ ] Search can find chunks from other posts (for related queries)
- [ ] Results include chunk text, postUrl, postTitle, chunkId
- [ ] Search performance <100ms for typical queries

**Technical Tasks**:
1. Install `lunr` package
2. Load Lunr index in chat widget
3. Implement `searchChunks(query, currentUrl, limit=5)` function
4. Filter by current post URL (for post-specific queries)
5. Allow cross-post search (for related queries)
6. Return chunk metadata with results
7. Test search accuracy with various queries

**Dependencies**: Story 10.1, Story 10.2

**Technical Implementation**:
```typescript
// Client-side search function
function searchChunks(query: string, currentUrl?: string, limit = 5): ChunkResult[]
```

**Testing**:
- [ ] Search finds relevant chunks
- [ ] Top 5 results are most relevant
- [ ] Current post filtering works
- [ ] Cross-post search works
- [ ] Performance <100ms
- [ ] Handles empty queries gracefully
- [ ] Handles no results gracefully

---

### Story 10.4: Netlify Function Chat API Endpoint
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want a serverless API endpoint for chat, so API keys are never exposed to the browser.

**Acceptance Criteria**:
- [ ] Netlify Function at `/api/chat`
- [ ] Accepts POST requests with: `{query, currentUrl, chunkIds}`
- [ ] Validates request (origin, IP rate limit, query length)
- [ ] Fetches chunk text from Netlify Blobs (or static JSON)
- [ ] Returns JSON response with answer and citations
- [ ] Handles errors gracefully
- [ ] CORS configured for site domain only
- [ ] Function timeout set to 30s (Groq max ~5s)

**Technical Tasks**:
1. Create `netlify/functions/chat.ts` (or `.js`)
2. Install Netlify Functions dependencies
3. Implement request validation (origin check)
4. Implement chunk retrieval from Blobs/JSON
5. Add error handling
6. Configure CORS
7. Set function timeout
8. Test with various inputs

**Dependencies**: Story 10.1, Story 10.3

**Technical Implementation**:
```typescript
// netlify/functions/chat.ts
export async function handler(event: HandlerEvent): Promise<Response>
```

**Testing**:
- [ ] Endpoint accepts POST requests
- [ ] Validates origin
- [ ] Validates query length
- [ ] Fetches chunks correctly
- [ ] Returns proper JSON response
- [ ] Handles errors (404, 500, etc.)
- [ ] CORS headers correct
- [ ] Timeout configured

---

### Story 10.5: Groq LLM Integration with Prompt Engineering
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want Groq Llama 3.1 8B integrated with strict prompting, so responses are grounded and cited.

**Acceptance Criteria**:
- [ ] Groq API client configured (API key from env var)
- [ ] Core system prompt enforces "answer only from context"
- [ ] Query type detection (Summarize, Q&A, Generate Questions, Related)
- [ ] Prompt variants for each query type
- [ ] Context injection (top 5 chunks + metadata)
- [ ] Response includes citations with [1], [2] format
- [ ] Temperature set to 0.7 (reduces hallucination)
- [ ] Max tokens set to 500
- [ ] Anti-hallucination prompts enforced

**Technical Tasks**:
1. Install Groq SDK (`groq-sdk`)
2. Configure Groq client with API key
3. Implement core system prompt
4. Implement query type detection (regex patterns)
5. Implement prompt variants (Summarize, Q&A, Generate Questions, Related)
6. Build final prompt (system + context + query)
7. Call Groq API with proper parameters
8. Parse response and extract citations
9. Test all query types

**Dependencies**: Story 10.4

**Technical Implementation**:
```typescript
// Query type detection
const queryType = detectQueryType(query); // 'summarize' | 'qa' | 'generate_questions' | 'related'

// Prompt building
const prompt = buildPrompt(queryType, chunks, query, currentPost);

// Groq API call
const response = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  temperature: 0.7,
  max_tokens: 500,
  messages: [{ role: 'user', content: prompt }]
});
```

**Testing**:
- [ ] Groq API key from env var (not in code)
- [ ] All query types detected correctly
- [ ] Prompts include anti-hallucination instructions
- [ ] Responses include citations
- [ ] Temperature and max_tokens configured
- [ ] Handles API errors gracefully
- [ ] Response time <5s (Groq requirement)

---

### Story 10.6: Query Type Detection and Routing
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want query types automatically detected, so the correct prompt variant is used.

**Acceptance Criteria**:
- [ ] Summarize queries detected: `/summar|tldr|overview/i`
- [ ] Generate Questions detected: `/suggest|question|what.*ask|quiz/i`
- [ ] Related queries detected: chunks from different posts
- [ ] Default Q&A for all other queries
- [ ] Detection happens before prompt building
- [ ] Appropriate chunks fetched for each type

**Technical Tasks**:
1. Implement `detectQueryType(query, searchResults)` function
2. Add regex patterns for summarize and generate questions
3. Detect related queries (chunks from different posts)
4. Route to appropriate prompt builder
5. Fetch appropriate chunks (all for summarize, top 5 for Q&A, etc.)
6. Test all detection patterns

**Dependencies**: Story 10.3, Story 10.5

**Technical Implementation**:
```typescript
function detectQueryType(query: string, searchResults: ChunkResult[]): QueryType {
  if (/summar|tldr|overview/i.test(query)) return 'summarize';
  if (/suggest|question|what.*ask|quiz/i.test(query)) return 'generate_questions';
  if (searchResults.some(r => r.postUrl !== currentUrl)) return 'related';
  return 'qa';
}
```

**Testing**:
- [ ] Summarize queries detected
- [ ] Generate questions queries detected
- [ ] Related queries detected (cross-post chunks)
- [ ] Default Q&A for normal queries
- [ ] Edge cases handled (empty query, etc.)

---

### Story 10.7: Rate Limiting and Abuse Prevention
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want rate limiting and abuse prevention, so the API is protected from abuse and costs are controlled.

**Acceptance Criteria**:
- [ ] Rate limiting: 10 requests per IP per 60 seconds
- [ ] hCaptcha token verification on backend
- [ ] Query length validation (max 500 characters)
- [ ] IP-based rate limit store (in-memory or Redis)
- [ ] Rate limit headers in response
- [ ] 429 status code when rate limited
- [ ] User-friendly error messages
- [ ] Rate limit reset information

**Technical Tasks**:
1. Implement IP-based rate limiting (in-memory store or Netlify KV)
2. Add hCaptcha token verification
3. Add query length validation
4. Add rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
5. Return 429 with helpful message
6. Test rate limiting with multiple requests
7. Test hCaptcha verification

**Dependencies**: Story 10.4

**Technical Implementation**:
```typescript
// Rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

// hCaptcha verification
const hcaptcha = require('@hcaptcha/verify');
const isValid = await hcaptcha.verify(secretKey, token);
```

**Testing**:
- [ ] Rate limit enforced (10 req/60s)
- [ ] 429 status returned when exceeded
- [ ] Rate limit headers present
- [ ] hCaptcha token verified
- [ ] Invalid hCaptcha rejected
- [ ] Query length validated
- [ ] IP extraction works correctly

---

### Story 10.8: Security Controls (API Key Isolation, CSP)
**Epic**: Ask AI Chatbot  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 3

**User Story**:
> As a developer, I want API keys isolated and CSP headers configured, so the system is secure.

**Acceptance Criteria**:
- [ ] Groq API key stored in Netlify env vars (never in code)
- [ ] API key never exposed to browser
- [ ] CSP headers configured for chat widget
- [ ] Origin validation on API endpoint
- [ ] Input sanitization (prevent XSS)
- [ ] No secrets in client-side code
- [ ] Security headers in Netlify config

**Technical Tasks**:
1. Store Groq API key in Netlify environment variables
2. Verify API key only accessed in Netlify Function
3. Configure CSP headers in `netlify.toml`
4. Add origin validation in chat endpoint
5. Sanitize user input (prevent XSS)
6. Review client-side code for secrets
7. Add security headers (X-Content-Type-Options, etc.)

**Dependencies**: Story 10.4, Story 10.5

**Technical Implementation**:
```toml
# netlify.toml
[build.environment]
GROQ_API_KEY = "from-netlify-dashboard"

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.hcaptcha.com; ..."
```

**Testing**:
- [ ] API key not in code repository
- [ ] API key not exposed in browser network tab
- [ ] CSP headers present
- [ ] Origin validation works
- [ ] XSS attempts blocked
- [ ] Security headers configured

---

### Story 10.9: Monitoring and Logging (Axiom)
**Epic**: Ask AI Chatbot  
**Priority**: P1  
**Story Points**: 3  
**Sprint**: Sprint 4

**User Story**:
> As a developer, I want monitoring and logging configured, so I can track usage, errors, and costs.

**Acceptance Criteria**:
- [ ] Axiom logging configured (or Netlify Functions logs)
- [ ] Log all chat requests (query, response time, cost estimate)
- [ ] Log errors with stack traces
- [ ] Log rate limit hits
- [ ] Cost tracking (token usage, estimated cost)
- [ ] Alerts configured for errors (>5% error rate)
- [ ] Alerts configured for cost (>$5/day)

**Technical Tasks**:
1. Set up Axiom integration (or use Netlify Functions logs)
2. Add logging to chat endpoint (requests, responses, errors)
3. Calculate token usage and cost estimates
4. Set up alerts in Axiom (or Netlify dashboard)
5. Create cost monitoring dashboard
6. Test logging with various scenarios

**Dependencies**: Story 10.4, Story 10.5

**Technical Implementation**:
```typescript
// Logging
logger.info('chat_request', {
  query,
  queryType,
  responseTime,
  tokenUsage,
  estimatedCost,
  ip: event.headers['x-forwarded-for']
});
```

**Testing**:
- [ ] All requests logged
- [ ] Errors logged with stack traces
- [ ] Token usage calculated
- [ ] Cost estimates accurate
- [ ] Alerts trigger correctly
- [ ] Logs queryable in Axiom

---

### Story 10.10: User Feedback and Quality Monitoring
**Epic**: Ask AI Chatbot  
**Priority**: P1  
**Story Points**: 2  
**Sprint**: Sprint 4

**User Story**:
> As a developer, I want user feedback collection, so I can monitor answer quality and improve the system.

**Acceptance Criteria**:
- [ ] "Was this helpful?" button after each response
- [ ] 5-star rating system
- [ ] Optional comment field
- [ ] Feedback stored (Netlify Forms or Axiom)
- [ ] Negative feedback triggers review
- [ ] Feedback visible in monitoring dashboard
- [ ] Privacy-compliant (no PII required)

**Technical Tasks**:
1. Add feedback UI to chat widget
2. Create feedback form component
3. Integrate with Netlify Forms (or Axiom)
4. Store feedback with query/response context
5. Create feedback review dashboard
6. Set up alerts for negative feedback

**Dependencies**: Story 10.2

**Technical Implementation**:
```astro
<!-- Feedback component -->
<FeedbackForm responseId={responseId} />
```

**Testing**:
- [ ] Feedback button appears
- [ ] Rating submission works
- [ ] Comments saved
- [ ] Feedback stored correctly
- [ ] Alerts trigger for negative feedback

---

### Story 10.11: Response Streaming (Optional Enhancement)
**Epic**: Ask AI Chatbot  
**Priority**: P2  
**Story Points**: 5  
**Sprint**: Sprint 5

**User Story**:
> As a reader, I want responses to stream in real-time, so I see answers faster.

**Acceptance Criteria**:
- [ ] Groq streaming API integrated
- [ ] Server-Sent Events (SSE) or chunked response
- [ ] Client-side streaming display
- [ ] Graceful fallback to non-streaming
- [ ] Streaming works with Netlify Functions
- [ ] Performance improvement (perceived latency)

**Technical Tasks**:
1. Enable streaming in Groq API call
2. Implement SSE or chunked response in Netlify Function
3. Update client to handle streaming
4. Display tokens as they arrive
5. Test streaming performance
6. Add fallback for non-streaming

**Dependencies**: Story 10.5

**Testing**:
- [ ] Streaming works end-to-end
- [ ] Tokens display as they arrive
- [ ] Fallback works if streaming fails
- [ ] Performance improved

---

## Epic 8: Content Strategy Implementation

### Story 8.1: Content Calendar Setup
**Epic**: Content Strategy  
**Priority**: P1  
**Story Points**: 2  
**Sprint**: Sprint 1

**User Story**:
> As a content creator, I want a content calendar, so I can plan and track blog post publishing.

**Acceptance Criteria**:
- [ ] Content calendar document created
- [ ] All 37 posts from content strategy listed
- [ ] Publishing schedule defined
- [ ] Status tracking (draft, in-progress, published)
- [ ] Dependencies identified

**Technical Tasks**:
1. Review `blog-content-strategy.md`
2. Create content calendar spreadsheet/document
3. List all posts with priorities
4. Define publishing schedule
5. Set up tracking system

**Dependencies**: None

---

### Story 8.2: First 3 Posts Published
**Epic**: Content Strategy  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 1-2

**User Story**:
> As a content creator, I want to publish the first 3 strategic posts, so I establish the blog foundation.

**Acceptance Criteria**:
- [ ] Post 0.1: "Before You Build: AI Use Case Evaluation" published
- [ ] Post 1.1: "The Anatomy of a Production LLM Call" published
- [ ] Post 5.1: "Red Teaming AI Systems" published
- [ ] All posts follow content strategy guidelines
- [ ] SEO optimized
- [ ] Social sharing configured

**Technical Tasks**:
1. Write Post 0.1 (4,500 words)
2. Write Post 1.1 (2,500 words)
3. Write Post 5.1 (3,800 words)
4. Add code examples and diagrams
5. Optimize for SEO
6. Publish and promote

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

**Content Requirements** (from blog-content-strategy.md):
- Production-grade code examples
- Real-world case studies
- Downloadable templates where applicable
- Internal links to related content
- SEO keywords integrated naturally

---

## Epic 9: Content Creation - Blog Posts

### Content Creation Overview

**Total Posts Planned**: 37 (from `blog-content-strategy.md`)  
**Posts Published**: 3 (8%)  
**Posts Remaining**: 34 (92%)

**Status Legend**:
- 🟢 **DONE**: Post published and live
- 🔵 **OPEN**: Post not yet written
- 🟡 **IN PROGRESS**: Post being written

**Quick Reference Table**:

| Story | Post ID | Title | Series | Status | Points | Priority |
|-------|---------|-------|--------|--------|--------|----------|
| 9.1 | 0.1 | Before You Build: AI Use Case Evaluation | Series 0 | 🟢 DONE | 8 | P0 |
| 9.2 | 1.1 | The Anatomy of a Production LLM Call | Series 1 | 🟢 DONE | 5 | P0 |
| 9.3 | 1.2 | Prompt Engineering: Demos vs Production | Series 1 | 🟢 DONE | 5 | P0 |
| 9.4 | 1.3 | Context Engineering | Series 1 | 🔵 OPEN | 5 | P0 |
| 9.5 | 1.4 | Advanced Prompting Techniques | Series 1 | 🔵 OPEN | 5 | P1 |
| 9.6 | 1.5 | RAG Fundamentals | Series 1 | 🔵 OPEN | 5 | P0 |
| 9.7 | 2.1 | Vector Databases | Series 2 | 🔵 OPEN | 5 | P0 |
| 9.8 | 2.2 | Embeddings Demystified | Series 2 | 🔵 OPEN | 5 | P0 |
| 9.9 | 2.3 | Advanced RAG Patterns | Series 2 | 🔵 OPEN | 5 | P0 |
| 9.10 | 2.4 | KAG: When RAG Needs Structure | Series 2 | 🔵 OPEN | 5 | P1 |
| 9.11 | 3.1 | What AI Agents Actually Are | Series 3 | 🔵 OPEN | 5 | P0 |
| 9.12 | 3.2 | Building Your First AI Agent | Series 3 | 🔵 OPEN | 8 | P0 |
| 9.13 | 3.3 | Agentic AI: Multi-Agent Orchestration | Series 3 | 🔵 OPEN | 5 | P0 |
| 9.14 | 3.4 | Agent Frameworks Compared | Series 3 | 🔵 OPEN | 8 | P1 |
| 9.15 | 3.5 | Agent Protocols: A2A, AP2, MCP, AGUI | Series 3 | 🔵 OPEN | 5 | P1 |
| 9.16 | 4.1 | Vibe Coding with Claude and Cursor | Series 4 | 🔵 OPEN | 5 | P1 |
| 9.17 | 4.2 | Building with Claude Projects | Series 4 | 🔵 OPEN | 5 | P1 |
| 9.18 | 4.3 | The AI-Augmented Architect | Series 4 | 🔵 OPEN | 5 | P1 |
| 9.19 | 5.1 | Red Teaming AI Systems | Series 5 | 🟢 DONE | 8 | P0 |
| 9.20 | 5.2 | AI Governance in Enterprise | Series 5 | 🔵 OPEN | 5 | P0 |
| 9.21 | 5.3 | Securing RAG Systems | Series 5 | 🔵 OPEN | 5 | P0 |
| 9.22 | 5.4 | OWASP Top 10 for LLMs | Series 5 | 🔵 OPEN | 8 | P0 |
| 9.23 | 5.5 | AI Risk Management | Series 5 | 🔵 OPEN | 5 | P0 |
| 9.24 | 5.6 | Vulnerability Management for AI | Series 5 | 🔵 OPEN | 5 | P1 |
| 9.25 | 6.1 | Building AI on Legacy Infrastructure | Series 6 | 🔵 OPEN | 5 | P0 |
| 9.26 | 6.2 | The Economics of AI Projects | Series 6 | 🔵 OPEN | 5 | P0 |
| 9.27 | 6.3 | AI for Data Scientists | Series 6 | 🔵 OPEN | 5 | P1 |
| 9.28 | 6.4 | Multi-Cultural AI | Series 6 | 🔵 OPEN | 5 | P1 |
| 9.29 | 6.5 | Building AI Safety Guardrails | Series 6 | 🔵 OPEN | 5 | P1 |
| 9.30 | 6.6 | The AI Architect's Toolkit | Series 6 | 🔵 OPEN | 5 | P1 |
| 9.31 | 6.7 | AI Workshops That Don't Suck | Series 6 | 🔵 OPEN | 5 | P1 |
| 9.32 | 7.1 | Observability for AI Systems | Series 7 | 🔵 OPEN | 5 | P0 |
| 9.33 | 7.2 | Testing AI Applications | Series 7 | 🔵 OPEN | 5 | P0 |
| 9.34 | 7.3 | Cost Optimization for Production AI | Series 7 | 🔵 OPEN | 5 | P0 |
| 9.35 | 7.4 | Debugging AI Systems | Series 7 | 🔵 OPEN | 5 | P0 |
| 9.36 | 8.1 | From Enterprise Architect to AI Engineer | Series 8 | 🔵 OPEN | 5 | P0 |
| 9.37 | 8.2 | 17 Lessons from Delivering 17 AI Workshops | Series 8 | 🔵 OPEN | 5 | P1 |
| 9.38 | 8.3 | The AI Engineer's Reading List | Series 8 | 🔵 OPEN | 3 | P1 |
| 9.39 | - | AI and Data Quality: When Training Data Becomes Time Bomb | Custom | 🟢 DONE | 8 | P0 |
| 9.40 | - | Sloperators: Why AI Outputs Need Owners, Not Better Models | Custom | 🟢 DONE | 5 | P0 |

**Total Story Points**: ~213 points (content creation: 200 strategy + 13 custom)

---

### Story 9.1: Post 0.1 - "Before You Build: A Realistic Framework for Evaluating AI Use Cases"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 8  
**Status**: 🟢 DONE  
**Reference**: `blog-content-strategy.md` Post 0.1

**User Story**:
> As a content creator, I want to publish Post 0.1 on AI use case evaluation, so I establish the strategic foundation for the blog.

**Acceptance Criteria**:
- [x] Post published at `/blog/before-you-build-ai-use-case-evaluation`
- [x] 4,500 words (per content strategy)
- [x] Includes downloadable templates (decision tree, ROI calculator, PoC checklist)
- [x] SEO optimized (keywords: "AI use case evaluation", "AI project assessment")
- [x] Internal links to related posts
- [x] Social sharing configured

**Content Requirements** (from `blog-content-strategy.md`):
- 3-Dimensional Assessment framework
- 5 Levels of AI overview
- Decision tree and case studies
- Downloadable templates

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.2: Post 1.1 - "The Anatomy of a Production LLM Call"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🟢 DONE  
**Reference**: `blog-content-strategy.md` Post 1.1

**User Story**:
> As a content creator, I want to publish Post 1.1 on production LLM API calls, so readers learn the fundamentals before advanced topics.

**Acceptance Criteria**:
- [x] Post published at `/blog/anatomy-of-a-production-llm-call`
- [x] 2,500 words (per content strategy)
- [x] Production-grade code examples (40% code-to-prose ratio)
- [x] SEO optimized (keywords: "LLM API Python", "OpenAI API production")
- [x] Internal links to 1.2, 1.3, 7.3
- [x] Social sharing configured

**Content Requirements**:
- API client setup (OpenAI, Anthropic, Google)
- Authentication, error handling, retry logic
- Token counting and cost tracking
- Production-ready wrapper class

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.3: Post 1.2 - "Prompt Engineering: The Difference Between Demos and Production"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🟢 DONE  
**Reference**: `blog-content-strategy.md` Post 1.2

**User Story**:
> As a content creator, I want to publish Post 1.2 on production prompt engineering, so readers understand real-world prompt reliability.

**Acceptance Criteria**:
- [x] Post published at `/blog/prompt-engineering-demos-vs-production`
- [x] 3,000 words (per content strategy)
- [x] Code examples (30% code-to-prose ratio)
- [x] SEO optimized (keywords: "prompt engineering production", "LLM prompt reliability")
- [x] Internal links to 1.1, 1.4, 5.4
- [x] Social sharing configured

**Content Requirements**:
- Structured prompt templates
- Prompt versioning and testing
- Edge case handling
- Prompt template library

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.4: Post 1.3 - "Context Engineering: Making LLMs Remember What Matters"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 1.3

**User Story**:
> As a content creator, I want to publish Post 1.3 on context window management, so readers learn to optimize context usage.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "context window management", "LLM context optimization")
- [ ] Internal links to 1.1, 1.2, 1.5, 2.3
- [ ] Social sharing configured

**Content Requirements**:
- Context window economics
- Information prioritization strategies
- Context compression techniques
- Token budget calculator

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.5: Post 1.4 - "Advanced Prompting Techniques: ToT, LEAP, and Beyond"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 1.4

**User Story**:
> As a content creator, I want to publish Post 1.4 on advanced prompting techniques, so readers learn structured reasoning patterns.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,500 words (per content strategy)
- [ ] Code examples (40% code-to-prose ratio)
- [ ] SEO optimized (keywords: "tree of thoughts prompting", "ReAct prompting")
- [ ] Internal links to 1.2, 3.2, 3.3
- [ ] Social sharing configured

**Content Requirements**:
- Tree of Thoughts (ToT)
- LEAP, ReAct, Chain-of-Thought variations
- Comparison matrix
- Decision flowchart

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.6: Post 1.5 - "RAG Fundamentals: Making LLMs Trustworthy with External Knowledge"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 1.5

**User Story**:
> As a content creator, I want to publish Post 1.5 on RAG fundamentals, so readers understand retrieval augmented generation basics.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,600 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "RAG retrieval augmented generation", "RAG system architecture")
- [ ] Internal links to 1.3, 2.1, 2.2, 2.3, 5.3
- [ ] Social sharing configured

**Content Requirements**:
- RAG architecture patterns
- Basic chunking strategies
- Vector similarity search
- Minimal working RAG system (200 lines)

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.7: Post 2.1 - "Vector Databases: Choosing the Right Tool for Your RAG System"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 2.1

**User Story**:
> As a content creator, I want to publish Post 2.1 on vector database comparison, so readers can choose the right tool for RAG.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,200 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "vector database comparison", "Qdrant vs Pinecone")
- [ ] Internal links to 1.5, 2.2, 2.3, 5.3
- [ ] Social sharing configured

**Content Requirements**:
- Comparison matrix: Qdrant, Pinecone, Weaviate, Chroma, pgvector
- Performance benchmarks
- Cost analysis at different scales
- Migration strategies

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.8: Post 2.2 - "Embeddings Demystified: From Text to Vectors"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 2.2

**User Story**:
> As a content creator, I want to publish Post 2.2 on embeddings, so readers understand semantic search fundamentals.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,000 words (per content strategy)
- [ ] Code examples (40% code-to-prose ratio)
- [ ] SEO optimized (keywords: "text embeddings explained", "OpenAI embeddings")
- [ ] Internal links to 1.5, 2.1, 2.3, 7.3
- [ ] Social sharing configured

**Content Requirements**:
- Embedding model comparison
- Embedding dimensions and trade-offs
- Fine-tuning embeddings for domain
- Visualization of embedding space

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.9: Post 2.3 - "Advanced RAG Patterns: Hybrid Search, Reranking, and Query Transformation"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 2.3

**User Story**:
> As a content creator, I want to publish Post 2.3 on advanced RAG patterns, so readers achieve 90%+ retrieval accuracy.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,800 words (per content strategy)
- [ ] Code examples (45% code-to-prose ratio)
- [ ] SEO optimized (keywords: "advanced RAG techniques", "hybrid search RAG")
- [ ] Internal links to 1.5, 2.1, 2.2, 2.4
- [ ] Social sharing configured

**Content Requirements**:
- Hybrid search (vector + keyword)
- Reranking strategies
- Query transformation
- Accuracy comparison on real dataset

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.10: Post 2.4 - "KAG: When RAG Needs Structure"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 2.4

**User Story**:
> As a content creator, I want to publish Post 2.4 on Knowledge Augmented Generation, so readers understand when to use knowledge graphs.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,400 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "knowledge augmented generation", "KAG vs RAG")
- [ ] Internal links to 1.5, 2.3, 6.1
- [ ] Social sharing configured

**Content Requirements**:
- Limitations of pure vector RAG
- Knowledge graphs fundamentals
- Graph + vector hybrid retrieval
- RAG vs KAG comparison

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.11: Post 3.1 - "What AI Agents Actually Are (And Aren't)"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 3.1

**User Story**:
> As a content creator, I want to publish Post 3.1 defining AI agents, so readers understand what agents actually are.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI agents explained", "what are AI agents")
- [ ] Internal links to 1.2, 1.4, 3.2, 3.3
- [ ] Social sharing configured

**Content Requirements**:
- Agent vs chatbot vs automation
- Core components: perception, reasoning, action
- Agent architectures (ReAct, Plan-and-Execute)
- Decision tree: Do you need an agent?

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.12: Post 3.2 - "Building Your First AI Agent: A Production-Ready Template"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 8  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 3.2

**User Story**:
> As a content creator, I want to publish Post 3.2 on building production agents, so readers have a complete template.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,500 words (per content strategy)
- [ ] Code examples (50% code-to-prose ratio)
- [ ] SEO optimized (keywords: "build AI agent", "AI agent tutorial")
- [ ] Internal links to 3.1, 1.2, 3.3, 7.1
- [ ] Social sharing configured

**Content Requirements**:
- Complete agent implementation (500 lines)
- Tool interface template
- Observability setup
- Unit testing examples

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.13: Post 3.3 - "Agentic AI: Multi-Agent Orchestration Patterns"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 3.3

**User Story**:
> As a content creator, I want to publish Post 3.3 on multi-agent systems, so readers understand agent coordination.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,600 words (per content strategy)
- [ ] Code examples (40% code-to-prose ratio)
- [ ] SEO optimized (keywords: "multi-agent systems", "agent orchestration")
- [ ] Internal links to 3.1, 3.2, 3.4, 7.3
- [ ] Social sharing configured

**Content Requirements**:
- Agent communication patterns
- Task decomposition and delegation
- Conflict resolution strategies
- Supervisor vs peer-to-peer architectures

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.14: Post 3.4 - "Agent Frameworks Compared: Semantic Kernel, LangGraph, CrewAI, and Google ADK"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 8  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 3.4

**User Story**:
> As a content creator, I want to publish Post 3.4 comparing agent frameworks, so readers can choose the right foundation.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 4,000 words (per content strategy)
- [ ] Code examples (45% code-to-prose ratio)
- [ ] SEO optimized (keywords: "agent frameworks comparison", "LangGraph vs Semantic Kernel")
- [ ] Internal links to 3.1, 3.2, 3.3, 3.5
- [ ] Social sharing configured

**Content Requirements**:
- Same agent built in each framework
- Feature comparison matrix
- Code complexity comparison
- Migration paths

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.15: Post 3.5 - "Agent Protocols: A2A, AP2, MCP, and AGUI"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 3.5

**User Story**:
> As a content creator, I want to publish Post 3.5 on agent protocols, so readers understand emerging standards.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,800 words (per content strategy)
- [ ] Code examples (40% code-to-prose ratio)
- [ ] SEO optimized (keywords: "MCP protocol", "agent protocols")
- [ ] Internal links to 3.1, 3.2, 3.4, 6.6
- [ ] Social sharing configured

**Content Requirements**:
- A2A, AP2, MCP, AGUI protocols
- Interoperability challenges
- Building MCP servers
- Protocol comparison table

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.16: Post 4.1 - "Vibe Coding with Claude and Cursor: The New Development Paradigm"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 4.1

**User Story**:
> As a content creator, I want to publish Post 4.1 on AI-assisted coding, so readers understand modern development workflows.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,000 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI coding tools", "Cursor IDE", "vibe coding")
- [ ] Internal links to 4.2, 4.3, 7.2
- [ ] Social sharing configured

**Content Requirements**:
- Claude Code walkthrough
- Cursor IDE setup and workflows
- GitHub Copilot vs Claude vs Cursor
- When to trust AI-generated code

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.17: Post 4.2 - "Building with Claude Projects: Context Management at Scale"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 4.2

**User Story**:
> As a content creator, I want to publish Post 4.2 on Claude Projects, so readers learn context management at scale.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,600 words (per content strategy)
- [ ] Code examples (25% code-to-prose ratio)
- [ ] SEO optimized (keywords: "Claude Projects", "context management AI")
- [ ] Internal links to 4.1, 1.3, 4.3
- [ ] Social sharing configured

**Content Requirements**:
- Organizing project knowledge
- Effective context documents
- Iterative development patterns
- Project structure templates

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.18: Post 4.3 - "The AI-Augmented Architect: Using LLMs in Solution Design"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 4.3

**User Story**:
> As a content creator, I want to publish Post 4.3 on AI-augmented architecture, so readers learn to use AI in design.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (20% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI architecture design", "LLM solution design")
- [ ] Internal links to 4.1, 4.2, 6.1, 6.2
- [ ] Social sharing configured

**Content Requirements**:
- Architecture diagramming with AI
- Requirements analysis with LLMs
- Design pattern recommendations
- Trade-off analysis

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.19: Post 5.1 - "Red Teaming AI Systems: A Practitioner's Guide to Breaking Your Own Agents"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 8  
**Status**: 🟢 DONE  
**Reference**: `blog-content-strategy.md` Post 5.1

**User Story**:
> As a content creator, I want to publish Post 5.1 on red teaming AI systems, so readers learn adversarial testing.

**Acceptance Criteria**:
- [x] Post published at `/blog/red-teaming-ai-systems-practitioners-guide`
- [x] ~4,000 words (content from teaming_ai.md)
- [x] SEO optimized (keywords: "red teaming AI", "AI security testing", "teaming in AI")
- [x] Images integrated (teaming framework diagram, lifecycle stages, activity timeline, impact comparison)
- [x] Sources and citations included
- [x] Blog disclaimer included
- [x] Social sharing configured (via PostLayout)

**Content Requirements**:
- Comprehensive teaming framework (Red, Blue, Purple, Orange, Yellow, Green, White, Gray teams)
- Lifecycle integration timeline
- Real-world examples and impact metrics
- Regulatory frameworks (NIST, EU AI Act, Executive Order)
- Integration strategy

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

**Notes**:
- Content strictly sourced from `docs/product/teaming_ai.md`
- Images referenced: `teaming-ai-framework.png`, `ai-lifecycle-stages.png`, `team-activities-lifecycle.png`, `teaming-impact-comparison.png`
- Post focuses on strategic/operational teaming rather than code examples

---

### Story 9.20: Post 5.2 - "AI Governance in Enterprise: Beyond Compliance Theater"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 5.2

**User Story**:
> As a content creator, I want to publish Post 5.2 on AI governance, so readers learn practical governance frameworks.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,600 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI governance", "enterprise AI governance")
- [ ] Internal links to 5.1, 5.3, 5.5, 5.6
- [ ] Social sharing configured

**Content Requirements**:
- Model approval workflows
- Data lineage and provenance tracking
- Audit trails for LLM decisions
- Governance framework template

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.21: Post 5.3 - "Securing RAG Systems: When Your Knowledge Base Becomes a Liability"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 5.3

**User Story**:
> As a content creator, I want to publish Post 5.3 on RAG security, so readers understand RAG-specific vulnerabilities.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,500 words (per content strategy)
- [ ] Code examples (45% code-to-prose ratio)
- [ ] SEO optimized (keywords: "RAG security", "securing RAG systems")
- [ ] Internal links to 1.5, 2.1, 2.3, 5.1, 5.4
- [ ] Social sharing configured

**Content Requirements**:
- Document poisoning attacks
- Access control for document retrieval
- PII leakage through semantic search
- Secure RAG implementation

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.22: Post 5.4 - "The OWASP Top 10 for LLMs: Real-World Mitigations"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 8  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 5.4

**User Story**:
> As a content creator, I want to publish Post 5.4 on OWASP LLM Top 10, so readers learn production security implementations.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 4,200 words (per content strategy)
- [ ] Code examples (50% code-to-prose ratio)
- [ ] SEO optimized (keywords: "OWASP LLM Top 10", "LLM security")
- [ ] Internal links to 5.1, 5.2, 5.3, 5.5, 1.2
- [ ] Social sharing configured

**Content Requirements**:
- Each OWASP LLM vulnerability with examples
- Prompt injection defenses
- Security middleware implementation
- Security testing automation

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.23: Post 5.5 - "AI Risk Management: Quantifying and Mitigating Model Failures"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 5.5

**User Story**:
> As a content creator, I want to publish Post 5.5 on AI risk management, so readers learn to assess and mitigate AI risks.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,400 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI risk management", "model failure mitigation")
- [ ] Internal links to 5.1, 5.2, 5.4, 7.1, 7.4
- [ ] Social sharing configured

**Content Requirements**:
- Risk taxonomy for AI systems
- Failure mode analysis (FMEA for AI)
- Circuit breakers and fallback strategies
- Risk assessment framework

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.24: Post 5.6 - "Vulnerability Management for AI: Patching Models and Prompts"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 5.6

**User Story**:
> As a content creator, I want to publish Post 5.6 on AI vulnerability management, so readers learn DevSecOps for AI.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,200 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI vulnerability management", "prompt versioning")
- [ ] Internal links to 5.1, 5.2, 5.4, 5.5, 7.4
- [ ] Social sharing configured

**Content Requirements**:
- Vulnerability scanning for AI dependencies
- Model versioning and rollback
- Prompt versioning and emergency patches
- Incident response playbooks

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.25: Post 6.1 - "Building AI Systems on Legacy Infrastructure: COBOL Meets GPT-4"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.1

**User Story**:
> As a content creator, I want to publish Post 6.1 on legacy system AI integration, so readers learn enterprise integration patterns.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,600 words (per content strategy)
- [ ] Code examples (40% code-to-prose ratio)
- [ ] SEO optimized (keywords: "legacy system AI integration", "AI mainframe integration")
- [ ] Internal links to 1.1, 2.4, 4.3, 6.2
- [ ] Social sharing configured

**Content Requirements**:
- Wrapper patterns for legacy systems
- API translation layers
- Data format conversion
- Migration roadmap template

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.26: Post 6.2 - "The Economics of AI Projects: ROI Beyond the Hype"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.2

**User Story**:
> As a content creator, I want to publish Post 6.2 on AI project economics, so readers learn ROI calculation and financial modeling.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,000 words (per content strategy)
- [ ] Code examples (20% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI ROI calculation", "AI project economics")
- [ ] Internal links to 1.1, 6.1, 7.3, 4.3
- [ ] Social sharing configured

**Content Requirements**:
- TCO calculation for AI systems
- Token cost vs developer time trade-offs
- ROI calculator spreadsheet
- Build vs buy decisions

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.27: Post 6.3 - "AI for Data Scientists by an Application Developer"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.3

**User Story**:
> As a content creator, I want to publish Post 6.3 bridging dev and data science, so readers understand production ML systems.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,200 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "MLOps", "model deployment", "production ML systems")
- [ ] Internal links to 1.1, 7.1, 7.2, 7.4
- [ ] Social sharing configured

**Content Requirements**:
- Model deployment challenges
- API vs batch inference
- Versioning ML models
- MLOps pipeline

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.28: Post 6.4 - "Multi-Cultural AI: Building for Global Teams and Users"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.4

**User Story**:
> As a content creator, I want to publish Post 6.4 on multi-cultural AI, so readers learn international deployment.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,400 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "multi-lingual AI", "international AI deployment")
- [ ] Internal links to 1.2, 2.2, 3.3, 6.1
- [ ] Social sharing configured

**Content Requirements**:
- Multi-lingual prompt engineering
- Cultural context in AI responses
- Data residency and sovereignty
- Localization beyond translation

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.29: Post 6.5 - "Building AI Safety Guardrails: Lessons from a Children's Learning App"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.5

**User Story**:
> As a content creator, I want to publish Post 6.5 on AI safety guardrails, so readers learn responsible AI patterns.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,000 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI safety guardrails", "AI content filtering")
- [ ] Internal links to 5.1, 5.2, 5.5, 3.2
- [ ] Social sharing configured

**Content Requirements**:
- Safety architecture patterns
- Content filtering and moderation
- Privacy and COPPA compliance
- Safety framework (reusable patterns)

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.30: Post 6.6 - "The AI Architect's Toolkit: Tools I Actually Use Daily"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.6

**User Story**:
> As a content creator, I want to publish Post 6.6 on AI architect tools, so readers learn the real production stack.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI development tools", "AI architect toolkit")
- [ ] Internal links to 3.5, 4.1, 7.1, 7.3
- [ ] Social sharing configured

**Content Requirements**:
- Actual daily tools
- VS Code setup for AI development
- GitLab CI/CD for AI projects
- Tool comparison: what works vs what doesn't

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.31: Post 6.7 - "AI Workshops That Don't Suck: Teaching AI to Engineers"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 6.7

**User Story**:
> As a content creator, I want to publish Post 6.7 on AI workshops, so readers learn effective AI education.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,200 words (per content strategy)
- [ ] Code examples (25% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI training workshops", "teaching AI to engineers")
- [ ] Internal links to 1.1, 1.2, 3.1, 8.1
- [ ] Social sharing configured

**Content Requirements**:
- Workshop structure that works
- Hands-on exercises that engage
- Common misconceptions to address
- Workshop template (complete structure)

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.32: Post 7.1 - "Observability for AI Systems: What to Monitor When Models Make Decisions"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 7.1

**User Story**:
> As a content creator, I want to publish Post 7.1 on AI observability, so readers learn what to monitor in production.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI observability", "LLM monitoring")
- [ ] Internal links to 1.1, 3.2, 5.5, 7.3
- [ ] Social sharing configured

**Content Requirements**:
- Token usage tracking and alerting
- Latency monitoring for LLM calls
- Quality metrics (accuracy, relevance)
- Complete observability setup

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.33: Post 7.2 - "Testing AI Applications: Beyond Unit Tests"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 7.2

**User Story**:
> As a content creator, I want to publish Post 7.2 on AI testing, so readers learn to test probabilistic systems.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,000 words (per content strategy)
- [ ] Code examples (45% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI testing", "LLM testing")
- [ ] Internal links to 1.2, 3.2, 1.5, 7.4
- [ ] Social sharing configured

**Content Requirements**:
- Prompt regression testing
- Agent behavior testing
- RAG accuracy measurement
- Complete testing framework

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.34: Post 7.3 - "Cost Optimization for Production AI: Reducing Your LLM Bill by 70%"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 7.3

**User Story**:
> As a content creator, I want to publish Post 7.3 on AI cost optimization, so readers learn to reduce LLM costs.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,600 words (per content strategy)
- [ ] Code examples (30% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI cost optimization", "LLM cost reduction")
- [ ] Internal links to 1.1, 1.3, 2.2, 6.2, 7.1
- [ ] Social sharing configured

**Content Requirements**:
- Token optimization strategies
- Model selection by task
- Caching patterns
- Cost calculator tool

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.35: Post 7.4 - "Debugging AI Systems: When Logs Don't Tell the Whole Story"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 7.4

**User Story**:
> As a content creator, I want to publish Post 7.4 on AI debugging, so readers learn to debug probabilistic systems.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,800 words (per content strategy)
- [ ] Code examples (35% code-to-prose ratio)
- [ ] SEO optimized (keywords: "debugging AI systems", "LLM debugging")
- [ ] Internal links to 3.2, 7.1, 7.2, 5.5
- [ ] Social sharing configured

**Content Requirements**:
- Debugging probabilistic systems
- Prompt archaeology (tracing prompt evolution)
- Agent decision replay
- Debugging toolkit

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.36: Post 8.1 - "From Enterprise Architect to AI Engineer: A Practical Transition Guide"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 8.1

**User Story**:
> As a content creator, I want to publish Post 8.1 on career transition, so readers learn the practical transition path.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 3,200 words (per content strategy)
- [ ] Code examples (15% code-to-prose ratio)
- [ ] SEO optimized (keywords: "career transition to AI", "enterprise architect to AI engineer")
- [ ] Internal links to 1.1, 3.1, 6.7, 8.3
- [ ] Social sharing configured

**Content Requirements**:
- Learning roadmap
- Skill transferability matrix
- Project ideas for transition
- Resource recommendations

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.37: Post 8.2 - "17 Lessons from Delivering 17 AI Workshops"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 5  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 8.2

**User Story**:
> As a content creator, I want to publish Post 8.2 on workshop lessons, so readers learn effective AI education.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,400 words (per content strategy)
- [ ] Code examples (20% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI workshops", "teaching AI")
- [ ] Internal links to 6.7, 1.1, 3.1, 8.1
- [ ] Social sharing configured

**Content Requirements**:
- Teaching AI to non-technical audiences
- Common misconceptions to address
- Effective demonstration techniques
- Workshop template (proven structure)

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.38: Post 8.3 - "The AI Engineer's Reading List: Papers, Posts, and Podcasts"
**Epic**: Content Creation  
**Priority**: P1  
**Story Points**: 3  
**Status**: 🔵 OPEN  
**Reference**: `blog-content-strategy.md` Post 8.3

**User Story**:
> As a content creator, I want to publish Post 8.3 on reading list, so readers have curated learning resources.

**Acceptance Criteria**:
- [ ] Post published
- [ ] 2,200 words (per content strategy)
- [ ] Code examples (5% code-to-prose ratio)
- [ ] SEO optimized (keywords: "AI reading list", "AI engineer resources")
- [ ] Internal links to 1.1, 3.1, 8.1, 8.2
- [ ] Social sharing configured

**Content Requirements**:
- Curated resources that matter
- How to stay current without drowning
- Essential papers (with explanations)
- Learning system framework

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

### Story 9.39: Post - "AI and Data Quality: When Your Training Data Becomes Your Ticking Time Bomb"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 8  
**Status**: 🟢 DONE  
**Reference**: Custom post (not in content strategy)

**User Story**:
> As a content creator, I want to publish a post on AI data quality, so readers understand how bad data poisons AI at every stage.

**Acceptance Criteria**:
- [x] Post published at `/blog/ai-data-quality-when-training-data-becomes-time-bomb`
- [x] ~4,000 words
- [x] Code examples (Python data quality patterns)
- [x] SEO optimized (keywords: "AI data quality", "training data quality", "RAG data quality")
- [x] Mermaid diagrams for data pipeline visualization
- [x] Internal links to related posts (1.2, 1.3, 1.5, 2.3, 5.3, 7.1)
- [x] Social sharing configured

**Content Requirements**:
- Four stages where data goes rogue (Training, Prompting, RAG, Context Engineering)
- Real-world disaster examples
- Production-grade code examples for each stage
- Governance layer guidance
- 30-day action plan
- Key takeaways

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

**Notes**:
- This post complements Series 7 (Production Operations) but is standalone
- Covers data quality across the entire AI pipeline
- Includes practical code examples for data quality management
- References real-world failures (IBM Watson, United Healthcare, etc.)

---

### Story 9.40: Post - "Sloperators: Why AI Outputs Need Owners, Not Better Models"
**Epic**: Content Creation  
**Priority**: P0  
**Story Points**: 5  
**Status**: 🟢 DONE  
**Reference**: Custom post (not in content strategy)

**User Story**:
> As a content creator, I want to publish a post on sloperators, so readers understand why AI outputs need owners and a judgment layer.

**Acceptance Criteria**:
- [x] Post published at `/blog/sloperators-why-ai-outputs-need-owners-not-better-models`
- [x] Slop Scale framework included
- [x] Judgment layer diagram included
- [x] Images included (`sloperator-illustration.png`, `sloperator-funnel-diagram.png`, `collage-enterprise-failures.png`, `ai_signal_review_dashboard.png`)
- [x] Sources list included

**Dependencies**: Story 1.1, Story 4.1, Story 4.2

---

## Sprint Planning Summary

### Sprint 1 (Weeks 1-2): Foundation
**Goal**: Core publishing and discovery features  
**Stories**: 1.1, 1.3, 2.1, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 7.1, 8.1  
**Total Points**: 25  
**Deliverable**: Functional blog with SEO, search, and templates

### Sprint 2 (Weeks 3-4): Enhancement
**Goal**: Advanced features and content  
**Stories**: 1.2, 2.2, 2.3, 5.1, 5.2, 6.3, 7.2, 8.2  
**Total Points**: 20  
**Deliverable**: Enhanced blog with newsletter, related posts, and first content

---

## Testing Strategy Per Story

### Content Testing
- [ ] Verify MDX renders correctly
- [ ] Check code syntax highlighting
- [ ] Test image loading and optimization
- [ ] Verify frontmatter validation

### Functionality Testing
- [ ] Test tag filtering
- [ ] Test search functionality
- [ ] Test social sharing
- [ ] Test newsletter signup (when implemented)

### SEO Testing
- [ ] Verify meta tags
- [ ] Check OpenGraph previews
- [ ] Test RSS feed
- [ ] Validate sitemap

### Performance Testing
- [ ] Run Lighthouse audit
- [ ] Test on slow connections
- [ ] Verify image optimization
- [ ] Check mobile performance

---

---

## Content Creation Status Summary

### Published Posts (🟢 DONE)
- **Post 0.1**: "Before You Build: A Realistic Framework for Evaluating AI Use Cases" ✅ (Story 9.1)
- **Post 1.1**: "The Anatomy of a Production LLM Call" ✅ (Story 9.2)
- **Post 1.2**: "Prompt Engineering: The Difference Between Demos and Production" ✅ (Story 9.3)
- **Post 5.1**: "Red Teaming AI Systems: A Practitioner's Guide to Breaking Your Own Agents" ✅ (Story 9.19)
- **Post**: "AI and Data Quality: When Your Training Data Becomes Your Ticking Time Bomb" ✅ (Story 9.39)
- **Post**: "Sloperators: Why AI Outputs Need Owners, Not Better Models" ✅ (Story 9.40)

**Custom Posts** (not in content strategy, but published):
- `decentralized-ai-compute-depin-networks.mdx` - "Decentralized AI Compute: Building DePIN Networks"
- `how-ralph-wiggum-became-biggest-name-in-ai.mdx` - "How a Cartoon Character Who Eats Paste Became the Biggest Name in AI"
- `why-ai-architecture-became-unavoidable.mdx` - "Why AI Architecture Became Unavoidable"

**Note**: These custom posts are valuable content but not part of the 37-post strategic plan. Story 9.39 (Data Quality) has been added as a tracked user story.

### Remaining Posts (🔵 OPEN)
- **34 posts** from content strategy remain to be written
- See Epic 9 (Stories 9.4-9.38) for detailed requirements
- Reference `blog-content-strategy.md` for full content specifications

### Content Creation Progress
- **Published (Strategy)**: 4 of 37 planned posts (11%)
- **Published (Tracked Custom)**: 2 posts (Data Quality - Story 9.39, Sloperators - Story 9.40)
- **Published (Other Custom)**: 3 additional posts (not tracked)
- **Total Published**: 9 posts
- **Remaining (Strategy)**: 33 posts
- **Target**: 1-2 posts per week to complete strategy in 6-12 months

### Next Priority Posts (from content strategy)
Based on strategic importance and dependencies:
1. **Post 1.3**: "Context Engineering" (P0) - Completes Series 1 Foundations
2. **Post 1.5**: "RAG Fundamentals" (P0) - Foundation for Series 2
3. **Post 5.2**: "AI Governance in Enterprise" (P0) - Follows Post 5.1
4. **Post 3.1**: "What AI Agents Actually Are" (P0) - Foundation for Series 3
5. **Post 2.1**: "Vector Databases" (P0) - Foundation for Series 2

---

**Document Status**: IN PROGRESS  
**Next**: Begin Sprint 3 implementation (Ask Praveen.AI Chatbot)  
**Total Stories Defined**: 74+ (35 platform features + 38 content creation + 11 chatbot)  
**Estimated Total**: ~70 story points (platform) + ~200 story points (content) + ~45 story points (chatbot) = ~315 total

**New Feature Added**: Epic 10 - Ask Praveen.AI Chatbot (11 stories, 45 story points)
