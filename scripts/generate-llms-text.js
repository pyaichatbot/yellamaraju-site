import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const tutorialsDir = path.join(root, 'src/content/tutorials');
const blogDir = path.join(root, 'src/content/blog');
const publicDir = path.join(root, 'public');

async function listMdxFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMdxFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith('.mdx')) return [fullPath];
    return [];
  }));
  return files.flat();
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split('\n')) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, rawValue] = pair;
    const value = rawValue.trim();
    if (value.startsWith('[')) {
      data[key] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (/^\d+$/.test(value)) {
      data[key] = Number(value);
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return { data, body: source.slice(match[0].length) };
}

function stripMdxForLlms(body) {
  const lines = body.split('\n');
  const kept = [];
  let skippingSelfClosingComponent = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (skippingSelfClosingComponent) {
      if (trimmed.endsWith('/>')) skippingSelfClosingComponent = false;
      continue;
    }

    if (/^<[A-Z][A-Za-z0-9]*\b/.test(trimmed) && trimmed.endsWith('/>')) {
      continue;
    }

    if (/^<[A-Z][A-Za-z0-9]*\b/.test(trimmed) && !trimmed.includes('>')) {
      skippingSelfClosingComponent = true;
      continue;
    }

    kept.push(line);
  }

  return kept.join('\n')
    .replace(/^import\s+.*?;?\n/gm, '')
    .replace(/<\/?([A-Z][A-Za-z0-9]*)\b[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function readContentFile(filePath, baseDir) {
  const source = await fs.readFile(filePath, 'utf8');
  const { data, body } = parseFrontmatter(source);
  const relative = path.relative(baseDir, filePath).replaceAll(path.sep, '/');
  const slug = relative.replace(/\.mdx$/, '');
  return {
    filePath,
    relative,
    slug,
    data,
    body: stripMdxForLlms(body),
  };
}

function tutorialUrl(item) {
  return `/tutorials/${item.slug}`;
}

function blogUrl(item) {
  return `/blog/${item.slug}`;
}

function formatRoles(roles) {
  return Array.isArray(roles) && roles.length > 0 ? roles.map((role) => role.toUpperCase()).join(', ') : 'All';
}

function formatTags(tags) {
  return Array.isArray(tags) && tags.length > 0 ? tags.join(', ') : 'None';
}

function contentSection(item, url) {
  const title = item.data.title ?? item.slug;
  const description = item.data.description ? `\nDescription: ${item.data.description}` : '';
  const date = item.data.date ? `\nDate: ${item.data.date}` : '';
  const tags = `\nTags: ${formatTags(item.data.tags)}`;

  return [
    `# ${title}`,
    `URL: ${url}`,
    `Source: ${item.relative}${description}${date}${tags}`,
    '',
    item.body,
  ].join('\n');
}

async function buildTutorialsLlms() {
  const files = await listMdxFiles(tutorialsDir);
  const items = await Promise.all(files.map((file) => readContentFile(file, tutorialsDir)));
  const publicItems = items
    .filter((item) => item.data.draft !== true)
    .sort((a, b) => {
      const pathOrder = (a.data.pathOrder ?? 99) - (b.data.pathOrder ?? 99);
      if (pathOrder !== 0) return pathOrder;
      const pathCompare = String(a.data.path ?? '').localeCompare(String(b.data.path ?? ''));
      if (pathCompare !== 0) return pathCompare;
      const levelCompare = String(a.data.level ?? '').localeCompare(String(b.data.level ?? ''));
      if (levelCompare !== 0) return levelCompare;
      return (a.data.module ?? 99) - (b.data.module ?? 99);
    });

  const index = publicItems.map((item) => {
    const title = item.data.title ?? item.slug;
    const module = item.data.module ? `Module ${item.data.module}` : 'Tutorial';
    const roles = formatRoles(item.data.roles);
    return `- ${module}: ${title} (${item.data.path ?? 'tutorials'} / ${item.data.level ?? 'track'} / ${roles}) - ${tutorialUrl(item)}`;
  }).join('\n');

  const sections = publicItems.map((item) => contentSection(item, tutorialUrl(item))).join('\n\n---\n\n');
  return [
    '# yellamaraju.com Tutorials LLM Export',
    '',
    'Purpose: consolidated tutorial content for LLM-assisted reading, search, and offline reference.',
    '',
    '## Index',
    index,
    '',
    '---',
    '',
    sections,
    '',
  ].join('\n');
}

async function buildFieldGuideLlms() {
  const files = await listMdxFiles(blogDir);
  const items = await Promise.all(files.map((file) => readContentFile(file, blogDir)));
  const publicItems = items
    .filter((item) => item.data.draft !== true && item.data.hide !== true)
    .sort((a, b) => String(b.data.date ?? '').localeCompare(String(a.data.date ?? '')));

  const index = publicItems.map((item) => {
    const title = item.data.title ?? item.slug;
    return `- ${title} (${item.data.date ?? 'undated'}) - ${blogUrl(item)}`;
  }).join('\n');

  const sections = publicItems.map((item) => contentSection(item, blogUrl(item))).join('\n\n---\n\n');
  return [
    '# yellamaraju.com Production AI Systems Field Guide LLM Export',
    '',
    'Purpose: consolidated field guide articles for LLM-assisted reading, search, and offline reference.',
    '',
    '## Index',
    index,
    '',
    '---',
    '',
    sections,
    '',
  ].join('\n');
}

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, 'tutorials-llms.txt'), await buildTutorialsLlms());
await fs.writeFile(path.join(publicDir, 'field-guide-llms.txt'), await buildFieldGuideLlms());

console.log('Generated public/tutorials-llms.txt');
console.log('Generated public/field-guide-llms.txt');
