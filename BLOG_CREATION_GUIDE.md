# Quick Blog Creation Guide

A quick reference for creating new blog posts for yellamaraju.com

## 📝 Creating a New Post

### Step 1: Create the MDX File

Create a new `.mdx` file in `src/content/blog/` with a descriptive filename:

```bash
touch src/content/blog/your-post-title.mdx
```

**Naming convention:** Use kebab-case (lowercase with hyphens), e.g., `building-production-ai-agents.mdx`

### Step 2: Add Frontmatter

Every post requires frontmatter at the top:

```mdx
---
title: "Your Post Title"
description: "A compelling 150-160 character description for SEO and social sharing"
date: 2025-01-15
tags: ["AI/ML", "Architecture", "Leadership"]
---
```

**Required Fields:**
- `title` (string): Post title
- `description` (string): SEO description (150-160 chars recommended)
- `date` (Date): Publication date in `YYYY-MM-DD` format
- `tags` (string[]): Array of tags (use existing tags from `src/config.ts` when possible)

**Optional Fields:**
- `image` (string): Path to social sharing image (e.g., `/images/post-image.jpg`)
- `draft` (boolean): Set to `true` to hide from production (default: `false`)

### Step 3: Write Your Content

Write your content using Markdown syntax. You can also use MDX components:

```mdx
---
title: "My New Post"
description: "A great description"
date: 2025-01-15
tags: ["AI/ML"]
---

import Callout from '../../components/Callout.astro';
import YouTubeEmbed from '../../components/YouTubeEmbed.astro';
import TweetEmbed from '../../components/TweetEmbed.astro';
import AudioEmbed from '../../components/AudioEmbed.astro';
import Mermaid from '../../components/Mermaid.astro';

Your introduction paragraph here.

## Section Heading

Your content here with **bold**, *italic*, and `code` formatting.

### Subsection

- Bullet points
- Work great
- For lists

<Callout type="info" title="Pro Tip">
Use callouts to highlight important information.
</Callout>

## Code Examples

Use triple backticks with language tags:

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

## Available Components

### Callout

Highlight important information:

```mdx
<Callout type="info" title="Optional Title">
Your content here
</Callout>
```

**Types:** `info`, `warning`, `success`, `error`

### YouTube Embed

Embed YouTube videos:

```mdx
<YouTubeEmbed id="VIDEO_ID" title="Video Title" />
```

**Example:**
```mdx
<YouTubeEmbed id="dQw4w9WgXcQ" title="Introduction to AI Agents" />
```

The `id` is the YouTube video ID from the URL: `https://www.youtube.com/watch?v=VIDEO_ID`

### X (Twitter) Tweet Embed

Embed X/Twitter tweets:

```mdx
<TweetEmbed id="TWEET_ID" username="optional_username" />
```

**Examples:**

Using tweet ID:
```mdx
<TweetEmbed id="1234567890123456789" />
```

Using full tweet URL (component will extract ID):
```mdx
<TweetEmbed id="https://twitter.com/username/status/1234567890123456789" />
```

With username (optional, for better attribution):
```mdx
<TweetEmbed id="1234567890123456789" username="praveensrinagy" />
```

**How to get the tweet ID:**
1. Open the tweet on X/Twitter
2. Copy the URL: `https://twitter.com/username/status/1234567890123456789`
3. The number at the end is the tweet ID, or use the full URL

**Note:** The component uses X's official embed script, which loads asynchronously. Tweets will appear after the page loads.

### Audio Embed

Embed audio files (podcasts, interviews, sound clips):

```mdx
<AudioEmbed 
  src="/audio/podcast-episode.mp3" 
  title="Episode Title"
  caption="Optional caption text"
/>
```

**Supported audio formats:**
- `.mp3` (recommended for best compatibility)
- `.ogg`
- `.wav`

**Place audio files in `/public/audio/` directory:**

```bash
mkdir -p public/audio
# Copy your audio file to public/audio/
```

**Example:**
```mdx
<AudioEmbed 
  src="/audio/interview-with-expert.mp3" 
  title="Interview: Building Production AI Systems"
  caption="A 30-minute conversation about production AI architecture"
/>
```

**Note:** For large audio files, consider hosting on a CDN or external service and linking directly.

### Video Files (Direct Embed)

For video files hosted locally or externally:

```mdx
<video controls width="100%">
  <source src="/videos/demo.mp4" type="video/mp4" />
  <source src="/videos/demo.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
```

**Place video files in `/public/videos/` directory:**

```bash
mkdir -p public/videos
# Copy your video file to public/videos/
```

**Supported video formats:**
- `.mp4` (recommended)
- `.webm`
- `.ogg`

**Example with poster image:**
```mdx
<video controls width="100%" poster="/images/video-thumbnail.jpg">
  <source src="/videos/tutorial.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

**Note:** For large video files, consider using YouTube, Vimeo, or a CDN instead of hosting directly.

### Mermaid Diagrams

Create flowcharts and diagrams:

```mdx
<Mermaid chart={`
graph TD
    A[Start] --> B[Process]
    B --> C[End]
`} />
```

## 📋 Content Guidelines

### Writing Style
- **Editorial tone**: Professional but approachable
- **Long-form**: Aim for 1000-3000 words
- **Technical depth**: Balance theory with practical examples
- **Code examples**: Always include syntax highlighting

### SEO Best Practices
- **Titles**: 50-60 characters
- **Descriptions**: 150-160 characters
- **Use relevant tags**: Check `src/config.ts` for available topics
- **Include images**: Where appropriate for social sharing
- **Internal linking**: Link to related posts

### Tag Guidelines

Use tags from the predefined list in `src/config.ts`:
- `AI/ML`
- `Agentic AI`
- `Prompt Engineering`
- `Architecture`
- `Cloud`
- `Leadership`
- `Career`

**Note:** Tags with slashes (like "AI/ML") are automatically converted to URL-friendly slugs ("ai-ml").

## 🎨 Formatting Examples

### Headings

```mdx
# H1 (usually not needed, title is H1)
## H2 Section
### H3 Subsection
#### H4 Sub-subsection
```

### Lists

```mdx
- Unordered list item
- Another item

1. Ordered list item
2. Another item
```

### Links

```mdx
[Link text](https://example.com)
[Internal link](/blog/another-post)
```

### Images

You can add images using standard Markdown syntax. Place images in `/public/images/`:

```mdx
![Alt text describing the image](/images/image.jpg)
```

**Best Practices:**
- Use descriptive alt text for accessibility
- Optimize images before uploading (compress, resize)
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
- For social sharing images, add `image` field to frontmatter

**Example with caption:**
```mdx
![Architecture diagram showing system components](/images/architecture-diagram.png)

*Figure 1: System architecture overview*
```

**Using images in frontmatter for social sharing:**
```mdx
---
title: "My Post"
description: "Description"
date: 2025-01-15
tags: ["AI/ML"]
image: "/images/post-hero-image.jpg"  # Used for OpenGraph/Twitter cards
---
```

### Code Blocks

```mdx
\`\`\`language
code here
\`\`\`
```

### Inline Code

```mdx
Use `code` inline with backticks
```

### Blockquotes

```mdx
> This is a blockquote
> Can span multiple lines
```

### Tables

```mdx
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## ✅ Pre-Publish Checklist

- [ ] Frontmatter is complete and correct
- [ ] Description is 150-160 characters
- [ ] Tags are from the predefined list (or appropriate new ones)
- [ ] Date is set correctly
- [ ] Content is proofread
- [ ] Code examples are tested
- [ ] Links are working
- [ ] Images are optimized and in `/public/images/`
- [ ] Audio/video files are properly placed and referenced
- [ ] All media has appropriate alt text or captions
- [ ] Post previews correctly in dev server (`npm run dev`)

## 🚀 Publishing

1. **Test locally:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321/blog/your-post-slug`

2. **Build to verify:**
   ```bash
   npm run build
   ```

3. **Commit and push:**
   ```bash
   git add src/content/blog/your-post-title.mdx
   git commit -m "Add new post: Your Post Title"
   git push
   ```

4. **Deploy:** If using Netlify, deployment happens automatically on push.

## 📚 Example Post Template

```mdx
---
title: "Your Compelling Title Here"
description: "A 150-160 character description that summarizes your post and entices readers"
date: 2025-01-15
tags: ["AI/ML", "Architecture"]
---

import Callout from '../../components/Callout.astro';
import YouTubeEmbed from '../../components/YouTubeEmbed.astro';
import TweetEmbed from '../../components/TweetEmbed.astro';
import AudioEmbed from '../../components/AudioEmbed.astro';
import Mermaid from '../../components/Mermaid.astro';

Start with a compelling introduction that hooks the reader and sets up what they'll learn.

## Main Section

Your main content here. Use clear headings to structure your thoughts.

### Subsection

Break down complex topics into digestible sections.

<Callout type="info" title="Key Insight">
Highlight important takeaways or warnings.
</Callout>

## Practical Examples

Include code examples, diagrams, or media:

\`\`\`python
# Your code example
def example():
    pass
\`\`\`

### Adding Media

Include images, videos, or audio:

![Description of image](/images/example.jpg)

<YouTubeEmbed id="VIDEO_ID" title="Video Title" />

<TweetEmbed id="TWEET_ID" username="optional_username" />

<AudioEmbed 
  src="/audio/example.mp3" 
  title="Audio Title"
  caption="Optional caption"
/>

## Conclusion

Wrap up with key takeaways and next steps for the reader.

---

**Want more insights?** [Get in touch](/contact) or [read more posts](/blog).
```

## 📁 Media File Organization

Organize your media files in the `/public/` directory:

```
public/
├── images/          # Blog post images, diagrams, screenshots
│   ├── post-hero.jpg
│   └── architecture-diagram.png
├── audio/           # Podcast episodes, interviews, sound clips
│   └── episode-1.mp3
└── videos/          # Video files (if hosting directly)
    └── tutorial.mp4
```

**File Size Recommendations:**
- **Images**: Optimize to < 500KB when possible
- **Audio**: Consider compression; MP3 at 128kbps is usually sufficient
- **Video**: For large files, use YouTube/Vimeo instead of direct hosting

## 🔗 Quick Links

- Blog index: `/blog`
- Tag pages: `/tags/[tag-name]`
- RSS feed: `/blog/rss.xml`
- Site config: `src/config.ts`
- Content schema: `src/content/config.ts`
- Media directory: `/public/`

---

**Happy writing!** 🎉

