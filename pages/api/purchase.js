const PEYFLEX_API_KEY = 'f304ee6fec16077c05ea82ebca89d39b6d575ac8';
const PEYFLEX_BASE_URL = 'https://client.peyflex.com.ng';
const SONIC_RPC = 'https://rpc.soniclabs.com';

// Verify transaction on Sonic blockchain
async function verifyTransaction(txHash) {
  try {
    const response = await fetch(SONIC_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('RPC Error:', result.error);
      return false;
    }

    const receipt = result.result;
    return receipt && receipt.status === '0x1'; // Success status
  } catch (error) {
    console.error('Transaction verification error:', error);
    return false;
  }
}

// Call Peyflex API
async function callPeyflexAPI(service, details) {
  const endpoints = {
    airtime: '/api/airtime/subscribe/',
    data: '/api/data/subscribe/',
    cable: '/api/cable/subscribe/',
    electricity: '/api/electricity/subscribe/',
  };

  const endpoint = endpoints[service];
  if (!endpoint) {
    throw new Error(`Invalid service: ${service}`);
  }

  const response = await fetch(`${PEYFLEX_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${PEYFLEX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Peyflex API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, details, txHash } = req.body;

    if (!service || !details || !txHash) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify the transaction first
    console.log('Verifying transaction:', txHash);
    const isValidTransaction = await verifyTransaction(txHash);
    
    if (!isValidTransaction) {
      return res.status(400).json({ 
        error: 'Transaction not confirmed or failed',
        txHash 
      });
    }

    // Transaction verified, now call Peyflex API
    console.log('Transaction verified, calling Peyflex API for:', service);
    const result = await callPeyflexAPI(service, details);

    return res.status(200).json({ 
      status: 'success',
      data: result,
      txHash,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Purchase processing error:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Service purchase failed',
      timestamp: new Date().toISOString()
    });
  }
}