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

  const { network } = req.query;

  if (!network) {
    return res.status(400).json({ error: 'Network parameter is required' });
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

      return res.status(200).json({
        plans: fallbackPlans[network] || []
      });
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Data plans fetch error:', error);
    
    return res.status(200).json({
      plans: [
        { code: 'default-1gb', name: '1GB Plan', amount: '500' },
        { code: 'default-5gb', name: '5GB Plan', amount: '2500' },
      ]
    });
  }
}