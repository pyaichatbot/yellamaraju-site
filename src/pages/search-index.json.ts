import { generateSearchIndex } from '../utils/generate-search-index';

export async function GET() {
  const index = await generateSearchIndex();
  
  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

