import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Sonic Network Configuration
export const sonic = defineChain({
  id: 146,
  name: 'Sonic',
  network: 'sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
    public: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { 
      name: 'SonicScan', 
      url: 'https://sonicscan.org'
    },
  },
  testnet: false,
});

// USDC Contract on Sonic
export const USDC_CONTRACT = {
  address: '0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6' as `0x${string}`,
  abi: [
    {
      "constant": false,
      "inputs": [
        { "name": "_to", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "name": "", "type": "bool" }],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "name": "", "type": "uint8" }],
      "type": "function"
    }
  ]
} as const;

// Treasury Wallet Address (replace with actual treasury wallet)
export const TREASURY_WALLET = '0x742d35cc6634c0532925a3b8d404502d7ff6cc9b' as `0x${string}`;

// Peyflex API Configuration
export const PEYFLEX_CONFIG = {
  baseUrl: 'https://client.peyflex.com.ng',
  apiKey: 'f304ee6fec16077c05ea82ebca89d39b6d575ac8',
} as const;

// RainbowKit Configuration
export const wagmiConfig = getDefaultConfig({
  appName: 'Strills - Web3 Payments',
  projectId: 'strills-web3-payments', // You should get this from walletconnect.com
  chains: [sonic],
  ssr: false,
});