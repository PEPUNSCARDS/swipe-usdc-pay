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

  const url = new URL(req.url);
  const network = url.searchParams.get('network');

  if (!network) {
    return new Response(
      JSON.stringify({ error: 'Network parameter is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/data/plans/?network=${network}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PEYFLEX_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback plans based on network
      const fallbackPlans = {
        'mtn-data': [
          { code: 'mtn-1gb-daily', name: '1GB Daily', amount: '500' },
          { code: 'mtn-2gb-weekly', name: '2GB Weekly', amount: '1000' },
          { code: 'mtn-5gb-monthly', name: '5GB Monthly', amount: '2500' },
          { code: 'mtn-10gb-monthly', name: '10GB Monthly', amount: '4000' },
        ],
        'airtel-data': [
          { code: 'airtel-1gb-daily', name: '1GB Daily', amount: '500' },
          { code: 'airtel-2gb-weekly', name: '2GB Weekly', amount: '1000' },
          { code: 'airtel-5gb-monthly', name: '5GB Monthly', amount: '2500' },
          { code: 'airtel-10gb-monthly', name: '10GB Monthly', amount: '4000' },
        ],
        'glo-data': [
          { code: 'glo-1gb-daily', name: '1GB Daily', amount: '500' },
          { code: 'glo-2gb-weekly', name: '2GB Weekly', amount: '1000' },
          { code: 'glo-5gb-monthly', name: '5GB Monthly', amount: '2500' },
          { code: 'glo-10gb-monthly', name: '10GB Monthly', amount: '4000' },
        ],
        '9mobile-data': [
          { code: '9mobile-1gb-daily', name: '1GB Daily', amount: '500' },
          { code: '9mobile-2gb-weekly', name: '2GB Weekly', amount: '1000' },
          { code: '9mobile-5gb-monthly', name: '5GB Monthly', amount: '2500' },
          { code: '9mobile-10gb-monthly', name: '10GB Monthly', amount: '4000' },
        ],
      };

      return new Response(
        JSON.stringify({
          plans: fallbackPlans[network as keyof typeof fallbackPlans] || []
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
    console.error('Data plans fetch error:', error);
    
    return new Response(
      JSON.stringify({
        plans: [
          { code: 'default-1gb', name: '1GB Plan', amount: '500' },
          { code: 'default-5gb', name: '5GB Plan', amount: '2500' },
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