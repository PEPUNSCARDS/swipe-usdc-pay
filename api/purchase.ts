import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PEYFLEX_API_KEY = 'f304ee6fec16077c05ea82ebca89d39b6d575ac8';
const PEYFLEX_BASE_URL = 'https://client.peyflex.com.ng';
const SONIC_RPC = 'https://rpc.soniclabs.com';

// Verify transaction on Sonic blockchain
async function verifyTransaction(txHash: string): Promise<boolean> {
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
async function callPeyflexAPI(service: string, details: any) {
  const endpoints = {
    airtime: '/api/airtime/subscribe/',
    data: '/api/data/subscribe/',
    cable: '/api/cable/subscribe/',
    electricity: '/api/electricity/subscribe/',
  };

  const endpoint = endpoints[service as keyof typeof endpoints];
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

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { service, details, txHash } = await req.json();

    if (!service || !details || !txHash) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the transaction first
    console.log('Verifying transaction:', txHash);
    const isValidTransaction = await verifyTransaction(txHash);
    
    if (!isValidTransaction) {
      return new Response(
        JSON.stringify({ 
          error: 'Transaction not confirmed or failed',
          txHash 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Transaction verified, now call Peyflex API
    console.log('Transaction verified, calling Peyflex API for:', service);
    const result = await callPeyflexAPI(service, details);

    return new Response(
      JSON.stringify({ 
        status: 'success',
        data: result,
        txHash,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Purchase processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Service purchase failed',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}