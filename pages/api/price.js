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
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ngn',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Strills-Web3-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    
    return res.status(200).json({ 
      usdcToNgn: data['usd-coin']?.ngn || 1600,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Price fetch error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to fetch USDC price',
      usdcToNgn: 1600, // Fallback rate
      timestamp: new Date().toISOString()
    });
  }
}