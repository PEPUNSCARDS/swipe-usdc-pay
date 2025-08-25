import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PEYFLEX_BASE_URL = 'https://client.peyflex.com.ng';

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/cable/providers/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback providers
      return new Response(
        JSON.stringify({
          providers: [
            { code: 'dstv', name: 'DSTV', status: 'active' },
            { code: 'gotv', name: 'GOTV', status: 'active' },
            { code: 'startimes', name: 'StarTimes', status: 'active' },
            { code: 'showmax', name: 'Showmax', status: 'active' },
          ]
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );

  } catch (error) {
    console.error('Cable providers fetch error:', error);
    
    return new Response(
      JSON.stringify({
        providers: [
          { code: 'dstv', name: 'DSTV', status: 'active' },
          { code: 'gotv', name: 'GOTV', status: 'active' },
          { code: 'startimes', name: 'StarTimes', status: 'active' },
          { code: 'showmax', name: 'Showmax', status: 'active' },
        ]
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );
  }
}