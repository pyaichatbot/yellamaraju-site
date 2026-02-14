import type { Handler } from '@netlify/functions';
import { buildNewsletterSubject, renderNewsletterBody } from '../../src/utils/newsletter-template';

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const NEWSLETTER_AUTOMATION_SECRET = process.env.NEWSLETTER_AUTOMATION_SECRET;
const BUTTONDOWN_API_BASE = 'https://api.buttondown.email/v1';
const PRODUCTION_URL = 'https://yellamaraju.com';

type Action = 'draft' | 'send' | 'draft_and_send';

interface RequestBody {
  action: Action;
  emailId?: string;
  postUrl?: string;
  postSlug?: string;
  subject?: string;
  summary?: string;
  tools?: Array<{
    name: string;
    description: string;
    url?: string;
  }>;
  additionalInfo?: string[];
  intro?: string;
  highlights?: string[];
  ctaText?: string;
  ctaUrl?: string;
  scheduleAt?: string; // ISO date string
}

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate?: string;
}

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function validateAuth(secret: string | undefined): boolean {
  return Boolean(NEWSLETTER_AUTOMATION_SECRET && secret && secret === NEWSLETTER_AUTOMATION_SECRET);
}

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractRSSItems(xml: string): RSSItem[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/i;
  const descriptionRegex = /<description>([\s\S]*?)<\/description>/i;
  const linkRegex = /<link>([\s\S]*?)<\/link>/i;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;
  const items: RSSItem[] = [];

  let match: RegExpExecArray | null = null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = titleRegex.exec(itemXml)?.[1]?.trim();
    const description = descriptionRegex.exec(itemXml)?.[1]?.trim();
    const link = linkRegex.exec(itemXml)?.[1]?.trim();
    const pubDate = pubDateRegex.exec(itemXml)?.[1]?.trim();

    if (!title || !description || !link) continue;

    items.push({
      title: decodeEntities(title),
      description: decodeEntities(description),
      link: decodeEntities(link),
      pubDate,
    });
  }

  return items;
}

async function fetchLatestPost(postUrl?: string, postSlug?: string): Promise<RSSItem | null> {
  const siteUrl = process.env.URL || PRODUCTION_URL;
  const rssUrl = `${siteUrl.replace(/\/+$/, '')}/blog/rss.xml`;
  const response = await fetch(rssUrl, { headers: { Accept: 'application/rss+xml, application/xml' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed (${response.status})`);
  }

  const xml = await response.text();
  const items = extractRSSItems(xml);
  if (items.length === 0) return null;

  if (postUrl) {
    const foundByUrl = items.find(item => item.link.replace(/\/+$/, '') === postUrl.replace(/\/+$/, ''));
    if (foundByUrl) return foundByUrl;
  }

  if (postSlug) {
    const foundBySlug = items.find(item => item.link.includes(`/blog/${postSlug}`));
    if (foundBySlug) return foundBySlug;
  }

  return items[0];
}

async function buttondownRequest(path: string, init: RequestInit): Promise<any> {
  if (!BUTTONDOWN_API_KEY) {
    throw new Error('BUTTONDOWN_API_KEY is not configured');
  }

  const response = await fetch(`${BUTTONDOWN_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Token ${BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Buttondown API ${response.status}: ${payload?.detail || payload?.message || text}`);
  }

  return payload;
}

async function createDraftEmail(body: RequestBody) {
  const post = await fetchLatestPost(body.postUrl, body.postSlug);
  if (!post) {
    throw new Error('No posts found in RSS feed');
  }

  const subject = body.subject || buildNewsletterSubject(post.title);
  const markdownBody = renderNewsletterBody({
    post: {
      title: post.title,
      description: post.description,
      url: post.link,
      publishedAt: post.pubDate,
    },
    summary: body.summary,
    tools: body.tools,
    additionalInfo: body.additionalInfo,
    intro: body.intro,
    highlights: body.highlights,
    ctaText: body.ctaText,
    ctaUrl: body.ctaUrl,
  });

  const payload: Record<string, unknown> = {
    subject,
    body: markdownBody,
  };

  if (body.scheduleAt) {
    payload.status = 'scheduled';
    payload.publish_date = body.scheduleAt;
  }

  const created = await buttondownRequest('/emails', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    emailId: created?.id,
    subject,
    postLink: post.link,
    postTitle: post.title,
    status: created?.status || 'draft',
    raw: created,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' });
  }

  const providedSecret = event.headers['x-newsletter-secret'] || event.headers['X-Newsletter-Secret'];
  if (!validateAuth(providedSecret)) {
    return json(401, { success: false, error: 'Unauthorized' });
  }

  if (!BUTTONDOWN_API_KEY) {
    return json(500, { success: false, error: 'Missing BUTTONDOWN_API_KEY' });
  }

  try {
    const body = JSON.parse(event.body || '{}') as RequestBody;
    if (!body.action) {
      return json(400, { success: false, error: 'Missing action. Use draft.' });
    }

    // Hard lock: draft-only mode to prevent accidental sends from API.
    if (body.action !== 'draft') {
      return json(403, {
        success: false,
        error: 'Draft-only mode is enabled. Review and send manually in Buttondown dashboard.',
      });
    }

    const draft = await createDraftEmail(body);
    return json(200, {
      success: true,
      action: 'draft',
      ...draft,
      nextStep: 'Open Buttondown dashboard, review the draft, then send manually.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: message });
  }
};
