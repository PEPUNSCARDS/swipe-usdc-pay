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
    const response = await fetch(`${PEYFLEX_BASE_URL}/api/cable/providers/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback providers
      return res.status(200).json({
        providers: [
          { code: 'dstv', name: 'DSTV', status: 'active' },
          { code: 'gotv', name: 'GOTV', status: 'active' },
          { code: 'startimes', name: 'StarTimes', status: 'active' },
          { code: 'showmax', name: 'Showmax', status: 'active' },
        ]
      });
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Cable providers fetch error:', error);
    
    return res.status(200).json({
      providers: [
        { code: 'dstv', name: 'DSTV', status: 'active' },
        { code: 'gotv', name: 'GOTV', status: 'active' },
        { code: 'startimes', name: 'StarTimes', status: 'active' },
        { code: 'showmax', name: 'Showmax', status: 'active' },
      ]
    });
  }
}