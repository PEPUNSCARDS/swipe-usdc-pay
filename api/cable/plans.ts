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

  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');

  if (!provider) {
    return new Response(
      JSON.stringify({ error: 'Provider parameter is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/cable/plans/?provider=${provider}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback plans based on provider
      const fallbackPlans = {
        'dstv': [
          { code: 'dstv-compact', name: 'DStv Compact', amount: '10500' },
          { code: 'dstv-compact-plus', name: 'DStv Compact Plus', amount: '16600' },
          { code: 'dstv-premium', name: 'DStv Premium', amount: '24500' },
          { code: 'dstv-family', name: 'DStv Family', amount: '4400' },
        ],
        'gotv': [
          { code: 'gotv-smallie', name: 'GOtv Smallie', amount: '1575' },
          { code: 'gotv-jinja', name: 'GOtv Jinja', amount: '3200' },
          { code: 'gotv-jolli', name: 'GOtv Jolli', amount: '4850' },
          { code: 'gotv-max', name: 'GOtv Max', amount: '7200' },
        ],
        'startimes': [
          { code: 'startimes-nova', name: 'StarTimes Nova', amount: '1100' },
          { code: 'startimes-basic', name: 'StarTimes Basic', amount: '2200' },
          { code: 'startimes-smart', name: 'StarTimes Smart', amount: '3200' },
          { code: 'startimes-super', name: 'StarTimes Super', amount: '4900' },
        ],
        'showmax': [
          { code: 'showmax-mobile', name: 'Showmax Mobile', amount: '1450' },
          { code: 'showmax-standard', name: 'Showmax Standard', amount: '2900' },
          { code: 'showmax-pro', name: 'Showmax Pro', amount: '3200' },
        ],
      };

      return new Response(
        JSON.stringify({
          plans: fallbackPlans[provider as keyof typeof fallbackPlans] || []
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
    console.error('Cable plans fetch error:', error);
    
    return new Response(
      JSON.stringify({
        plans: [
          { code: 'default-basic', name: 'Basic Plan', amount: '2000' },
          { code: 'default-premium', name: 'Premium Plan', amount: '5000' },
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