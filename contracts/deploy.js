const { createWalletClient, createPublicClient, http, parseAbi } = require('viem');
const { base } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

const DEPLOYER_KEY = '0xca12f66863ba9960090e51575178950db6866c1f981edde90442b4827f8c55c4';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Simplified contract bytecode (compiled WealthReactor)
const CONTRACT_BYTECODE = '0x...'; // We need to compile first

async function deploy() {
  const account = privateKeyToAccount(DEPLOYER_KEY);
  console.log('Deployer:', account.address);
  
  const client = createPublicClient({ chain: base, transport: http() });
  const balance = await client.getBalance({ address: account.address });
  console.log('Balance:', balance, 'wei');
}

deploy().catch(console.error);
