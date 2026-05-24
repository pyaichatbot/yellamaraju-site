import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.includes('@') && email.includes('.');
}

interface EnrollmentRecord {
  email: string;
  enrolledAt: string;
  pathId: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const email = body.email;
    const pathId = body.pathId || 'llm-mastery';

    if (!email || !isValidEmail(email)) {
      return json(400, { success: false, error: 'Valid email is required' });
    }

    const normalized = email.toLowerCase().trim();
    const enrolledAt = new Date().toISOString();
    const token = Buffer.from(`${normalized}:${pathId}:${Date.now()}`).toString('base64');

    // Persist to Netlify Blobs — key = normalized email, value = enrollment record
    try {
      const store = getStore({
        name: `enrollments-${pathId}`,
        consistency: 'strong',
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_BLOBS_TOKEN,
      });
      const record: EnrollmentRecord = { email: normalized, enrolledAt, pathId };
      await store.setJSON(normalized, record);
    } catch (blobErr) {
      // Log but don't fail the request — token still returned to client
      console.error(`[llm-mastery-enroll] blob write failed: ${blobErr}`);
    }

    console.log(`[llm-mastery-enroll] path=${pathId} email=${normalized} at=${enrolledAt}`);

    return json(200, { success: true, token, enrolledAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: message });
  }
};
