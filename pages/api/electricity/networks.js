const PEYFLEX_BASE_URL = 'https://client.peyflex.com.ng';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      return res.status(200).json({
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
      });
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Electricity providers fetch error:', error);
    
    return res.status(200).json({
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
    });
  }
}