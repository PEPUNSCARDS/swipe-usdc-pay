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

  const { provider } = req.query;

  if (!provider) {
    return res.status(400).json({ error: 'Provider parameter is required' });
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

      return res.status(200).json({
        plans: fallbackPlans[provider] || []
      });
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Cable plans fetch error:', error);
    
    return res.status(200).json({
      plans: [
        { code: 'default-basic', name: 'Basic Plan', amount: '2000' },
        { code: 'default-premium', name: 'Premium Plan', amount: '5000' },
      ]
    });
  }
}