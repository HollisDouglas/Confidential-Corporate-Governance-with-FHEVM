# Installation & Setup Instructions

**Zama FHEVM Bounty Submission: Confidential Corporate Governance**

## Quick Setup (5 minutes)

### For Testing the Main Example

```bash
# 1. Navigate to project
cd D:\\\CorporateGovernanceUltimate

# 2. Use bounty package configuration
cp package-bounty.json package.json

# 3. Install dependencies
npm install

# 4. Compile contracts
npm run compile

# 5. Run tests
npm run test
```

**Expected Result**: ✅ All tests pass, FHEVM patterns verified

---

## Complete Setup Instructions

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v9.0.0 or higher
- **Git**: For cloning (if needed)

Verify:
```bash
node --version  # Should be >= 20
npm --version   # Should be >= 9.0.0
```

### Step 1: Prepare Environment

```bash
# Navigate to project root
cd D:\\\CorporateGovernanceUltimate

# Copy the bounty package.json
cp package-bounty.json package.json
```

### Step 2: Install Dependencies

```bash
# Install all Hardhat and FHEVM dependencies
npm install

# This installs:
# - @fhevm/solidity ^0.9.1
# - @fhevm/hardhat-plugin ^0.3.0-1
# - hardhat ^2.26.0
# - TypeScript and all dev dependencies
```

### Step 3: Compile Smart Contracts

```bash
npm run compile
```

**Expected Output**:
```
Compiled 1 Solidity file successfully
Generated typechain-types
```

### Step 4: Run Tests

```bash
npm run test
```

**Expected Output**:
```
  ConfidentialGovernance
    Deployment & Initialization
      ✔ should set deployer as owner and board member
      ✔ should initialize company correctly
      ...
    Confidential Voting
      ✔ should allow shareholder to cast encrypted vote (Yes)
      ✔ should allow multiple shareholders to vote
      ...

  30 passing (5s)
```

### Step 5: Verify Code Quality

```bash
# Run all linters
npm run lint

# Check code formatting
npm run prettier:check

# Generate coverage report
npm run coverage
```

---

## Using Automation Scripts

### Generate Standalone Example Repository

```bash
# List available examples
npm run create-example

# Generate the Confidential Governance example
npm run create-example confidential-governance ./output/confidential-governance

# Navigate to generated example
cd ./output/confidential-governance

# Install and test
npm install
npm run compile
npm run test
```

The generated repository is completely standalone and includes:
- Contract and tests
- Deployment scripts
- Hardhat configuration
- README documentation
- All necessary config files

### Generate Documentation

```bash
# Generate docs for specific example
npm run generate-docs confidential-governance

# Generate all documentation
npm run generate-all-docs
```

Documentation will be created in `examples/` directory in GitBook-compatible markdown format.

---

## Project Structure After Setup

```
CorporateGovernanceUltimate/
├── contracts/
│   └── ConfidentialGovernance.sol     # Main contract
├── test/
│   └── ConfidentialGovernance.ts      # Test suite
├── deploy/
│   └── 001_deploy_governance.ts       # Deployment script
├── tasks/
│   ├── accounts.ts                    # Account utilities
│   └── governance.ts                  # Contract tasks
├── scripts/
│   ├── create-fhevm-example.ts        # Example generator
│   ├── generate-docs.ts               # Doc generator
│   └── README.md                      # Scripts guide
├── examples/
│   ├── confidential-governance.md     # Documentation
│   └── SUMMARY.md                     # Doc index
├── artifacts/                         # (after compile)
├── cache/                             # (after compile)
├── types/                             # (after compile)
├── node_modules/                      # (after npm install)
├── hardhat.config.ts                  # Hardhat config
├── package.json                       # Dependencies
├── package-bounty.json                # Bounty version
├── tsconfig.hardhat.json              # TypeScript config
└── Documentation Files                # Multiple READMEs
```

---

## Available npm Scripts

### Development

```bash
npm run compile      # Compile Solidity contracts
npm run test         # Run test suite
npm run coverage     # Generate coverage report
npm run typechain    # Generate TypeScript types
npm run clean        # Clean build artifacts
```

### Code Quality

```bash
npm run lint         # Run all linters
npm run lint:sol     # Lint Solidity only
npm run lint:ts      # Lint TypeScript only
npm run prettier:check   # Check formatting
npm run prettier:write   # Auto-format code
```

### Deployment

```bash
npm run deploy:localhost  # Deploy to local node
npm run deploy:sepolia    # Deploy to Sepolia testnet
npm run verify:sepolia    # Verify on Etherscan
npm run chain            # Start local Hardhat node
```

### Automation (Bounty Scripts)

```bash
npm run create-example <name> [dir]    # Generate standalone example
npm run generate-docs <name>           # Generate docs for example
npm run generate-all-docs              # Generate all docs
npm run help:examples                  # List available examples
npm run help:docs                      # Show docs help
```

### Hardhat Tasks

```bash
npx hardhat accounts                   # List accounts
npx hardhat governance:info --contract <addr>    # Contract info
npx hardhat governance:init --contract <addr> --name "MyCompany" --shares 10000
npx hardhat governance:list-proposals --contract <addr>
```

---

## Deployment to Networks

### Local Network

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat deploy --network localhost

# Use the deployed contract address in tasks
npx hardhat governance:info --contract <ADDRESS> --network localhost
```

### Sepolia Testnet

```bash
# 1. Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# 2. Deploy
npx hardhat deploy --network sepolia

# 3. Verify (optional)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 4. Interact
npx hardhat governance:info --contract <ADDRESS> --network sepolia
```

---

## Troubleshooting

### "Cannot find module" errors

**Solution**:
```bash
# Ensure you copied package-bounty.json
cp package-bounty.json package.json

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "File not found" during compilation

**Solution**:
```bash
# Clean and recompile
npm run clean
npm run compile
```

### Tests fail with "FHE contract call should not fail"

**Cause**: Missing `FHE.allowThis()` or incorrect signer

**Solution**: Review contract code, ensure both `allowThis()` and `allow()` are called

### TypeScript errors

**Solution**:
```bash
# Regenerate types
npm run typechain

# Check TypeScript config
cat tsconfig.hardhat.json
```

### Automation scripts don't run

**Cause**: ts-node or TypeScript not installed

**Solution**:
```bash
npm install --save-dev ts-node typescript
npm run create-example
```

---

## Next Steps After Installation

### 1. Explore the Code

- Read `contracts/ConfidentialGovernance.sol` - See FHEVM patterns
- Review `test/ConfidentialGovernance.ts` - Understand testing approach
- Check `FHEVM_README.md` - Deep dive into concepts

### 2. Generate a Standalone Example

```bash
npm run create-example confidential-governance ./my-governance
cd ./my-governance
npm install && npm test
```

### 3. Generate Documentation

```bash
npm run generate-all-docs
cat examples/confidential-governance.md
```

### 4. Deploy and Interact

```bash
# Start local node
npx hardhat node

# In another terminal
npx hardhat deploy --network localhost
npx hardhat governance:info --contract <ADDRESS> --network localhost
```

### 5. Review Documentation

Start with these files in order:
1. `START_HERE.md` - Entry point
2. `QUICKSTART.md` - 5-minute guide
3. `FHEVM_README.md` - Concept deep dive
4. `BOUNTY_COMPLETE.md` - Submission status

---

## Verification Checklist

After installation, verify:

- [ ] `npm run compile` completes without errors
- [ ] `npm run test` shows all tests passing
- [ ] `npm run lint` passes without warnings
- [ ] `npm run coverage` shows 95%+ coverage
- [ ] `npm run create-example confidential-governance ./test-output/test` generates working example
- [ ] `npm run generate-all-docs` creates documentation in `examples/`

If all checks pass: ✅ Installation successful!

---

## Support & Resources

### Documentation Files
- `START_HERE.md` - Main entry point
- `README_BOUNTY.md` - Project overview
- `FHEVM_README.md` - FHEVM concepts (600+ lines)
- `DEPLOYMENT.md` - Deployment guide
- `scripts/README.md` - Automation scripts guide

### External Resources
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/
- **Zama Discord**: https://discord.gg/zama

---

## For Bounty Judges

To quickly verify this submission:

```bash
# 1. Setup
cp package-bounty.json package.json && npm install

# 2. Test
npm run compile && npm run test

# 3. Review
cat BOUNTY_COMPLETE.md
cat BOUNTY_FILES.md

# Expected: All tests pass, full feature checklist ✅
```

---

**Installation Guide Version**: 1.0
**For**: Zama FHEVM Bounty December 2025
**Status**: Complete and Tested
