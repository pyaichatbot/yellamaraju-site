export interface NewsletterPost {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
}

export interface NewsletterTool {
  name: string;
  description: string;
  url?: string;
}

export interface NewsletterTemplateInput {
  post: NewsletterPost;
  summary?: string;
  tools?: NewsletterTool[];
  additionalInfo?: string[];
  intro?: string;
  highlights?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

function formatDate(input?: string): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function buildNewsletterSubject(postTitle: string): string {
  return `New article: ${postTitle}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderNewsletterBody(input: NewsletterTemplateInput): string {
  const {
    post,
    summary = post.description,
    tools = [],
    additionalInfo = [],
    intro = 'Short practical notes from this week on building production AI systems.',
    highlights = [
      'What problem this pattern solves',
      'Key architecture decisions and tradeoffs',
      'Production-ready implementation guidance',
    ],
    ctaText = 'Read the full article',
    ctaUrl = post.url,
  } = input;

  const published = formatDate(post.publishedAt);
  const highlightsHtml = highlights
    .map(item => `<li style="margin: 0 0 8px 0;">${escapeHtml(item)}</li>`)
    .join('');

  const toolsHtml = tools.length > 0
    ? tools
        .map(tool => {
          const name = escapeHtml(tool.name);
          const description = escapeHtml(tool.description);
          const link = tool.url
            ? `<p style="margin: 10px 0 0 0;"><a href="${escapeHtml(tool.url)}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Open tool</a></p>`
            : '';
          return `
            <tr>
              <td style="padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f8fafc;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${name}</p>
                <p style="margin: 8px 0 0 0; color: #334155; line-height: 1.55;">${description}</p>
                ${link}
              </td>
            </tr>
          `;
        })
        .join('<tr><td style="height: 10px; line-height: 10px; font-size: 0;">&nbsp;</td></tr>')
    : '<tr><td style="color: #64748b;">No tools highlighted in this issue.</td></tr>';

  const additionalHtml = additionalInfo.length > 0
    ? `<ul style="margin: 10px 0 0 20px; padding: 0; color: #334155; line-height: 1.55;">
${additionalInfo.map(item => `<li style="margin: 0 0 8px 0;">${escapeHtml(item)}</li>`).join('')}
</ul>`
    : '<p style="margin: 10px 0 0 0; color: #64748b;">No additional notes for this issue.</p>';

  return `<!-- buttondown-editor-mode: fancy -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f1f5f9; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width: 680px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <tr>
          <td style="padding: 26px 28px; background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #ffffff;">
            <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; opacity: 0.85;">Praveen AI Newsletter</p>
            <h1 style="margin: 10px 0 0 0; font-size: 26px; line-height: 1.25;">${escapeHtml(post.title)}</h1>
            ${published ? `<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Published: ${escapeHtml(published)}</p>` : ''}
          </td>
        </tr>

        <tr>
          <td style="padding: 24px 28px;">
            <p style="margin: 0; color: #334155; line-height: 1.65;">${escapeHtml(intro)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 28px 10px 28px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Blog Summary</h2>
            <p style="margin: 12px 0 0 0; color: #334155; line-height: 1.7;">${escapeHtml(summary)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 8px 28px 10px 28px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Key Takeaways</h2>
            <ul style="margin: 12px 0 0 20px; padding: 0; color: #334155; line-height: 1.6;">
              ${highlightsHtml}
            </ul>
          </td>
        </tr>

        <tr>
          <td style="padding: 8px 28px 10px 28px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Tools to Explore</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 12px;">
              ${toolsHtml}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 8px 28px 24px 28px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Additional Notes</h2>
            ${additionalHtml}
          </td>
        </tr>

        <tr>
          <td align="center" style="padding: 0 28px 30px 28px;">
            <a href="${escapeHtml(ctaUrl)}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 18px; border-radius: 10px;">${escapeHtml(ctaText)}</a>
          </td>
        </tr>

        <tr>
          <td style="padding: 18px 28px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
            <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
              You are receiving this because you subscribed on yellamaraju.com.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
