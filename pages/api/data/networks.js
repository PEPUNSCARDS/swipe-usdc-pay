const PEYFLEX_API_KEY = 'f304ee6fec16077c05ea82ebca89d39b6d575ac8';
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
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/data/networks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PEYFLEX_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback data
      return res.status(200).json({
        networks: [
          { code: 'mtn-data', name: 'MTN Data', status: 'active' },
          { code: 'airtel-data', name: 'Airtel Data', status: 'active' },
          { code: 'glo-data', name: 'Glo Data', status: 'active' },
          { code: '9mobile-data', name: '9mobile Data', status: 'active' },
        ]
      });
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Data networks fetch error:', error);
    
    return res.status(200).json({
      networks: [
        { code: 'mtn-data', name: 'MTN Data', status: 'active' },
        { code: 'airtel-data', name: 'Airtel Data', status: 'active' },
        { code: 'glo-data', name: 'Glo Data', status: 'active' },
        { code: '9mobile-data', name: '9mobile Data', status: 'active' },
      ]
    });
  }
}