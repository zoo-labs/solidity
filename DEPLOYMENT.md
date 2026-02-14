# Zoo Contracts Deployment Guide

## Overview

This guide covers deploying Zoo smart contracts to the Lux network (local devnet, testnet, or mainnet).

## Available Contracts

| Contract | Type | Description |
|----------|------|-------------|
| MockERC20 | ERC20 | Standard ERC20 token with mint support |
| BoringFactory | Factory | Clone factory for deploying master contracts |
| MockBoringSingleNFT | ERC721 | Single NFT contract |
| MockBoringMultipleNFT | ERC721 | Multiple NFT collection |

## Prerequisites

1. Node.js v18+ installed
2. Lux network running locally (or access to testnet/mainnet)
3. Funded deployer account

## Network Configuration

### Local Networks

| Network | Chain ID | RPC Endpoint | Port |
|---------|----------|--------------|------|
| Lux Mainnet | 96369 | http://127.0.0.1:9630/ext/bc/C/rpc | 9630 |
| Lux Testnet | 96368 | http://127.0.0.1:9640/ext/bc/C/rpc | 9640 |
| Lux Devnet | 96370 | http://127.0.0.1:9650/ext/bc/C/rpc | 9650 |
| Hardhat Local | 31337 | http://127.0.0.1:8545 | 8545 |

### Treasury Address

All local Lux networks have the following treasury pre-funded:

```
Address: 0x9011E888251AB053B7bD1cdB598Db4f9DEd94714
Balance: ~2T LUX
```

This is the production treasury - you need the production mnemonic to use it.

## Deployment Steps

### 1. Install Dependencies

```bash
cd /Users/z/work/zoo/solidity
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Fund Deployer Account

The deployer account is derived from the mnemonic in `hardhat.config.js`:
- Mnemonic: `test test test test test test test test test test test junk`
- Deployer Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

#### Option A: Using Treasury Key (if you have it)

```bash
TREASURY_KEY=<private_key> node scripts/fund-deployer.js
```

#### Option B: Fund via Lux CLI (P-chain to C-chain)

```bash
# This requires the Lux CLI and a funded P-chain account
lux key create deploy-key --mnemonic
# Follow prompts to use test mnemonic

# Transfer from P-chain to C-chain
lux chain send --from-chain P --to-chain C --key deploy-key --amount 100 --testnet
```

#### Option C: Use Hardhat Local Network

For testing without funding, use the Hardhat local network:

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat deploy --network localhost
```

### 4. Deploy Contracts

#### Using Hardhat Deploy

```bash
# Deploy to Lux Testnet (requires funded account)
npx hardhat deploy --network luxdevnet

# Deploy to local Hardhat
npx hardhat deploy --network localhost
```

#### Using Custom Script

```bash
# Deploy to Lux Testnet
node scripts/deploy-lux.js

# With custom RPC
RPC_URL=http://127.0.0.1:9630/ext/bc/C/rpc node scripts/deploy-lux.js

# With custom private key
PRIVATE_KEY=0x... node scripts/deploy-lux.js
```

### 5. Verify Deployment

Deployment info is saved to `deployments/lux-testnet.json`:

```json
{
  "network": "lux-testnet",
  "chainId": 96368,
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "MockERC20": "0x...",
    "BoringFactory": "0x...",
    "MockBoringSingleNFT": "0x...",
    "MockBoringMultipleNFT": "0x..."
  }
}
```

## Contract Verification

### Check Contract on RPC

```bash
# Get contract code
curl -s -X POST \
  --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["<CONTRACT_ADDRESS>", "latest"],"id":1}' \
  -H 'content-type:application/json' \
  http://127.0.0.1:9640/ext/bc/C/rpc
```

### Interact with Contracts

Use Hardhat console:

```bash
npx hardhat console --network luxdevnet

# In console:
const ERC20 = await ethers.getContractAt("MockERC20", "<ADDRESS>");
const balance = await ERC20.balanceOf("<HOLDER_ADDRESS>");
console.log("Balance:", ethers.utils.formatEther(balance));
```

## Troubleshooting

### "Deployer account has no funds"

The test mnemonic accounts are not pre-funded on the Lux network. Options:
1. Use the treasury private key to fund the deployer
2. Transfer from P-chain to C-chain via Lux CLI
3. Use Hardhat local network for testing

### "Connection refused"

Make sure the Lux network is running:
```bash
lux network status
```

### "Chain ID mismatch"

Verify you're connecting to the correct network endpoint for your target chain ID.

## Networks in hardhat.config.js

```javascript
networks: {
  hardhat: { chainId: 31337 },
  localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
  luxdevnet: { url: "http://127.0.0.1:9640/ext/bc/C/rpc", chainId: 96368 },
}
```

## File Structure

```
/Users/z/work/zoo/solidity/
├── contracts/           # Solidity contracts
│   ├── ERC20.sol
│   ├── ERC1155.sol
│   ├── BoringFactory.sol
│   └── mocks/           # Mock contracts for testing
├── deploy/              # Hardhat deploy scripts
│   └── 00_deploy_all.js
├── scripts/             # Custom deployment scripts
│   ├── deploy-lux.js
│   └── fund-deployer.js
├── deployments/         # Deployment artifacts
│   └── lux-testnet.json
├── artifacts/           # Compiled contract artifacts
└── hardhat.config.js    # Hardhat configuration
```
