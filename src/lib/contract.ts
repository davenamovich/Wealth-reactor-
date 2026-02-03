// WealthReactor Contract on Base
export const CONTRACT_ADDRESS = '0xa6Ca8A21eDEe7f59833d189A357fA8032811b6c6';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "pay",
    "inputs": [
      { "name": "_username", "type": "string" },
      { "name": "_referrer", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "checkPayment",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "paid", "type": "bool" },
      { "name": "username", "type": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasPaid",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEarnings",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "referrer",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  }
] as const;

export const USDC_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function", 
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;

export const ACCESS_FEE = 30_000_000; // $30 USDC (6 decimals)
