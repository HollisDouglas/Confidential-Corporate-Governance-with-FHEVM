# Deployment Guide

## Local Development

### Prerequisites
- Node.js v20+
- npm v9.0.0+
- Hardhat CLI

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Local FHEVM Node
```bash
# Terminal 1
npx hardhat node
```

### Step 3: Deploy Contract
```bash
# Terminal 2
npx hardhat deploy --network localhost
```

Contract will be deployed to a local address shown in output.

### Step 4: Interact
```bash
npx hardhat governance:info --contract <ADDRESS> --network localhost
```

## Sepolia Testnet Deployment

### Prerequisites
- MetaMask or similar Web3 wallet
- Sepolia ETH for gas fees (get from faucet)
- Infura API key

### Step 1: Set Environment Variables
```bash
# Set your mnemonic (from MetaMask)
npx hardhat vars set MNEMONIC

# Set Infura API key
npx hardhat vars set INFURA_API_KEY

# Set Etherscan API key (for verification)
npx hardhat vars set ETHERSCAN_API_KEY
```

### Step 2: Fund Deployer Wallet
Get Sepolia ETH from faucet:
- https://www.infura.io/faucet/sepolia
- https://sepolia-faucet.pk910.de/

### Step 3: Deploy
```bash
npx hardhat deploy --network sepolia
```

Note the contract address from output.

### Step 4: Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Testing Deployment

### On Localhost
```bash
# After deployment to localhost
npx hardhat test --network localhost
```

### On Sepolia
```bash
# WARNING: Only run a few tests as gas is consumed
npx hardhat test --network sepolia --grep "Deployment"
```

## Interacting with Deployed Contract

### Initialize Company
```bash
npx hardhat governance:init \
  --contract <ADDRESS> \
  --network sepolia \
  --name "MyCompany Inc." \
  --shares 10000
```

### Add Shareholder
```bash
npx hardhat governance:add-shareholder \
  --contract <ADDRESS> \
  --network sepolia \
  --address 0x... \
  --name "John Doe" \
  --shares 1000
```

### List Proposals
```bash
npx hardhat governance:list-proposals \
  --contract <ADDRESS> \
  --network sepolia
```

## Environment Configuration

### Hardhat Variables
```bash
# View all variables
npx hardhat vars list

# Set a variable
npx hardhat vars set VARIABLE_NAME

# Get a variable value
npx hardhat vars get VARIABLE_NAME
```

### .env File (Alternative)
Create `.env.local`:
```
MNEMONIC="your seed phrase"
INFURA_API_KEY="your api key"
ETHERSCAN_API_KEY="your etherscan key"
```

## Security Checklist

- [ ] Use a dedicated deployer wallet
- [ ] Store private keys securely (never in git)
- [ ] Test on localhost first
- [ ] Verify contract on Etherscan
- [ ] Check contract initialization
- [ ] Verify board members added
- [ ] Test voting flow before public use

## Troubleshooting

**"Insufficient funds"**
- Get Sepolia ETH from faucet
- Check wallet address is correct

**"Invalid mnemonic"**
- Check MNEMONIC is 12 or 24 words separated by spaces
- Get new mnemonic from MetaMask: Settings > Security & Privacy > Reveal Seed Phrase

**"Network timeout"**
- Check INFURA_API_KEY is valid
- Verify internet connection
- Try again after short delay

**"Contract already deployed"**
- Check artifacts/deployments directory
- Clear with `npm run clean` and redeploy

## Gas Estimation

Typical gas usage:
- Deploy: ~500k gas
- Initialize: ~50k gas
- Add shareholder: ~80k gas
- Create proposal: ~120k gas
- Vote (encrypted): ~150k gas
- Finalize: ~100k gas

Sepolia ETH needed: ~0.5-1.0 ETH for full testing

## Live Network Considerations

For production deployment:

1. **Security Audit**: Have contract audited before mainnet
2. **Time Lock**: Consider adding time delay for governance changes
3. **Multi-Sig**: Use multisig wallet for owner functions
4. **Transparent Proxy**: Consider upgradeable pattern for future fixes
5. **Gas Optimization**: Monitor gas prices before large deployments

## Monitoring Deployment

### View Contract on Etherscan
```
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
```

### Monitor Events
```bash
npx hardhat run scripts/watch-events.ts --network sepolia
```

### Check Balance
```bash
npx hardhat accounts --network sepolia
```

## Rollback Procedure

If deployment fails:

```bash
# Clean artifacts
npm run clean

# Check deploy scripts
cat deploy/001_deploy_governance.ts

# Redeploy
npx hardhat deploy --network sepolia
```

## Next Steps

After deployment:
1. Verify contract on Etherscan
2. Initialize company
3. Add board members
4. Register shareholders
5. Create test proposal
6. Test voting flow
7. Monitor gas usage

See FHEVM_README.md for detailed testing instructions.
