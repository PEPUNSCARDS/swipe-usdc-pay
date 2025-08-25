import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PEYFLEX_API_KEY = 'f304ee6fec16077c05ea82ebca89d39b6d575ac8';
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
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/data/networks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PEYFLEX_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback data
      return new Response(
        JSON.stringify({
          networks: [
            { code: 'mtn-data', name: 'MTN Data', status: 'active' },
            { code: 'airtel-data', name: 'Airtel Data', status: 'active' },
            { code: 'glo-data', name: 'Glo Data', status: 'active' },
            { code: '9mobile-data', name: '9mobile Data', status: 'active' },
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
    console.error('Data networks fetch error:', error);
    
    return new Response(
      JSON.stringify({
        networks: [
          { code: 'mtn-data', name: 'MTN Data', status: 'active' },
          { code: 'airtel-data', name: 'Airtel Data', status: 'active' },
          { code: 'glo-data', name: 'Glo Data', status: 'active' },
          { code: '9mobile-data', name: '9mobile Data', status: 'active' },
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