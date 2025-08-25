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
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/electricity/plans/?identifier=electricity`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback electricity providers
      return new Response(
        JSON.stringify({
          plans: [
            { code: 'eko-electric', name: 'Eko Electricity (EKEDC)', status: 'active' },
            { code: 'ikeja-electric', name: 'Ikeja Electric (IKEDC)', status: 'active' },
            { code: 'abuja-electric', name: 'Abuja Electricity (AEDC)', status: 'active' },
            { code: 'kano-electric', name: 'Kano Electricity (KEDCO)', status: 'active' },
            { code: 'port-harcourt-electric', name: 'Port Harcourt Electric (PHEDC)', status: 'active' },
            { code: 'jos-electric', name: 'Jos Electricity (JEDC)', status: 'active' },
            { code: 'kaduna-electric', name: 'Kaduna Electric (KAEDCO)', status: 'active' },
            { code: 'benin-electric', name: 'Benin Electricity (BEDC)', status: 'active' },
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
    console.error('Electricity providers fetch error:', error);
    
    return new Response(
      JSON.stringify({
        plans: [
          { code: 'eko-electric', name: 'Eko Electricity (EKEDC)', status: 'active' },
          { code: 'ikeja-electric', name: 'Ikeja Electric (IKEDC)', status: 'active' },
          { code: 'abuja-electric', name: 'Abuja Electricity (AEDC)', status: 'active' },
          { code: 'kano-electric', name: 'Kano Electricity (KEDCO)', status: 'active' },
          { code: 'port-harcourt-electric', name: 'Port Harcourt Electric (PHEDC)', status: 'active' },
          { code: 'jos-electric', name: 'Jos Electricity (JEDC)', status: 'active' },
          { code: 'kaduna-electric', name: 'Kaduna Electric (KAEDCO)', status: 'active' },
          { code: 'benin-electric', name: 'Benin Electricity (BEDC)', status: 'active' },
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