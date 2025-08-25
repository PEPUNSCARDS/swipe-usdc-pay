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
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/airtime/networks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PEYFLEX_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to default networks if API fails
      return new Response(
        JSON.stringify({
          networks: [
            { code: 'mtn', name: 'MTN', status: 'active' },
            { code: 'airtel', name: 'Airtel', status: 'active' },
            { code: 'glo', name: 'Globacom', status: 'active' },
            { code: '9mobile', name: '9mobile', status: 'active' },
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
    console.error('Airtime networks fetch error:', error);
    
    // Return fallback networks
    return new Response(
      JSON.stringify({
        networks: [
          { code: 'mtn', name: 'MTN', status: 'active' },
          { code: 'airtel', name: 'Airtel', status: 'active' },
          { code: 'glo', name: 'Globacom', status: 'active' },
          { code: '9mobile', name: '9mobile', status: 'active' },
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