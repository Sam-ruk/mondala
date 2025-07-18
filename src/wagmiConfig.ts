import { http, createConfig } from 'wagmi';
import { metaMask, injected } from 'wagmi/connectors';
import { defineChain, createPublicClient } from 'viem';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const RPC_URL = ALCHEMY_KEY
  ? `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : 'https://testnet-rpc.monad.xyz';

if (!ALCHEMY_KEY) {
  console.warn('NEXT_PUBLIC_ALCHEMY_KEY not set, using public Monad Testnet RPC:', RPC_URL);
}

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

console.log('Wagmi Config Chains:', JSON.stringify([monadTestnet], null, 2));

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [
    metaMask(),
    injected({ target: 'rabby' }),
    injected({ target: 'phantom' }),
    injected(), 
  ],
  transports: {
    [monadTestnet.id]: http(RPC_URL),
  },
});

console.log('Wagmi Config Connectors:', wagmiConfig.connectors.map(c => c.id));
console.log('Wagmi Config Chains:', wagmiConfig.chains.map(c => ({ id: c.id, name: c.name })));

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC_URL),
});

async function testRpc() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    console.log('RPC Connectivity Test: Block number:', blockNumber);
  } catch (error) {
    console.error('RPC Connectivity Test Failed:', error);
  }
}

if (typeof window !== 'undefined') {
  testRpc();
  console.log('window.ethereum available:', !!window.ethereum);
}

console.log('Public Client Chain ID:', publicClient.chain.id);