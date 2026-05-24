import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Owner-only endpoint — protected by LLM_MASTERY_ENROLLMENT_SECRET
// GET /api/enrollments?secret=YOUR_SECRET&path=llm-mastery
// Returns: { count, enrollments: [{email, enrolledAt, pathId}] }

const SUPPORTED_PATHS = ['llm-mastery', 'langgraph', 'llm-systems', 'system-design'];

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { success: false, error: 'Method not allowed' });
  }

  const secret = event.queryStringParameters?.secret;
  const expectedSecret = process.env.LLM_MASTERY_ENROLLMENT_SECRET;

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return json(401, { success: false, error: 'Unauthorized' });
  }

  const pathId = event.queryStringParameters?.path || 'llm-mastery';

  if (!SUPPORTED_PATHS.includes(pathId)) {
    return json(400, { success: false, error: `Unknown path. Supported: ${SUPPORTED_PATHS.join(', ')}` });
  }

  try {
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;

    if (!siteID || !token) {
      return json(500, {
        success: false,
        error: 'Missing blob credentials',
        debug: { siteIDSet: !!siteID, tokenSet: !!token },
      });
    }

    const store = getStore({
      name: `enrollments-${pathId}`,
      consistency: 'strong',
      siteID,
      token,
    });
    const { blobs } = await store.list();

    const enrollments = await Promise.all(
      blobs.map(async ({ key }) => {
        try {
          return await store.get(key, { type: 'json' });
        } catch {
          return null;
        }
      })
    );

    const valid = enrollments.filter(Boolean);

    // Sort by enrolledAt descending (most recent first)
    valid.sort((a: any, b: any) => {
      return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
    });

    return json(200, {
      success: true,
      path: pathId,
      count: valid.length,
      enrollments: valid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: message });
  }
};
