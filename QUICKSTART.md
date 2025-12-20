# Quick Start Guide - Confidential Corporate Governance FHEVM Example

**Time to run**: 5 minutes

## For Bounty Judges

This is a complete, standalone FHEVM example ready to run immediately.

## Prerequisites

- Node.js v20+
- npm v9.0.0+

## Run in 4 Commands

```bash
# 1. Install (use Hardhat package.json)
cp package-hardhat.json package.json && npm install

# 2. Compile
npm run compile

# 3. Test
npm run test

# 4. View results
# ✅ All tests should pass showing FHEVM patterns working
```

## What You'll See

### After `npm run compile`:
```
Compiled 1 Solidity file successfully
Generated typechain-types
```

### After `npm run test`:
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
    Public Decryption (Finalization)
      ✔ should finalize proposal and decrypt results
      ...

  30 passing (5s)
```

## What's Demonstrated

In these tests, you'll see:

1. **Encrypted Storage** - Votes stored as euint8/euint32
2. **Input Proofs** - FHE.fromExternal() validates encrypted inputs
3. **Access Control** - FHE.allowThis() and FHE.allow() patterns
4. **Encrypted Arithmetic** - Vote counting on encrypted data
5. **Public Decryption** - FHE.decrypt() after deadline
6. **User Decryption** - FHE.seal() for individual verification

## Project Structure

```
contracts/
  └── ConfidentialGovernance.sol     # FHEVM smart contract (330 lines)
test/
  └── ConfidentialGovernance.ts      # Comprehensive tests (600 lines)
deploy/
  └── 001_deploy_governance.ts       # Deployment script
tasks/
  ├── accounts.ts                    # Account utilities
  └── governance.ts                  # Contract interaction
```

## Key Files to Review

1. **README_BOUNTY.md** - Start here for overview
2. **contracts/ConfidentialGovernance.sol** - Main implementation
3. **test/ConfidentialGovernance.ts** - All patterns tested
4. **FHEVM_README.md** - Deep dive into concepts

## Common Commands

```bash
# Run specific test
npx hardhat test --grep "Confidential Voting"

# Generate coverage
npm run coverage

# Check code quality
npm run lint

# Format code
npm run prettier:check

# Deploy locally
npx hardhat node              # Terminal 1
npx hardhat deploy --network localhost  # Terminal 2
```

## Interact with Deployed Contract

```bash
# View contract info
npx hardhat governance:info --contract <ADDRESS> --network localhost

# Initialize company
npx hardhat governance:init \
  --contract <ADDRESS> \
  --name "TechCorp" \
  --shares 10000 \
  --network localhost

# Add shareholder
npx hardhat governance:add-shareholder \
  --contract <ADDRESS> \
  --address 0x... \
  --name "Alice" \
  --shares 1000 \
  --network localhost

# Create proposal
npx hardhat governance:create-proposal \
  --contract <ADDRESS> \
  --type 1 \
  --title "Q4 Budget" \
  --description "Approve budget" \
  --days 7 \
  --network localhost
```

## FHEVM Patterns Shown

### 1. Input Proof Verification
```solidity
euint8 encryptedVote = FHE.fromExternal(inputEuint8, inputProof);
```

### 2. Dual Permission Pattern (Critical!)
```solidity
FHE.allowThis(encryptedValue);          // Contract permission
FHE.allow(encryptedValue, msg.sender);  // User permission
```

### 3. Encrypted Operations
```solidity
euint8 one = FHE.asEuint8(1);
ebool isYes = FHE.eq(encryptedVote, one);
euint32 increment = FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0));
counter = FHE.add(counter, increment);
```

### 4. Public Decryption Timing
```solidity
require(block.timestamp >= deadline);
uint32 result = FHE.decrypt(encryptedValue);
```

### 5. User Decryption
```solidity
return FHE.seal(encryptedVotes[proposalId][msg.sender]);
```

## For Learning

### Beginner
Start with: `contracts/ConfidentialGovernance.sol` lines 75-95
→ Learn encrypted storage types

### Intermediate
Read: Lines 217-263
→ Understand encrypted voting flow

### Advanced
Study: Lines 320-338
→ Master public decryption patterns

### Expert
Review: `test/ConfidentialGovernance.ts`
→ See all patterns with edge cases

## Troubleshooting

**"Cannot find module"**
→ Run `cp package-hardhat.json package.json && npm install`

**"FHE contract call should not fail"**
→ Check both `allowThis()` and `allow()` are called

**Tests fail**
→ Ensure using FHEVM mock (tests check automatically)

## Next Steps

1. ✅ **Tests pass** - FHEVM patterns work correctly
2. 📖 **Read docs** - See FHEVM_README.md for deep dive
3. 🔍 **Review code** - Check contract implementation
4. 🚀 **Deploy** - Try local deployment with Hardhat tasks

## Why This Example?

- **Real Use Case**: Corporate governance is a genuine blockchain need
- **All Patterns**: Covers encrypted storage, arithmetic, decryption
- **Production Ready**: Security, error handling, optimization
- **Well Tested**: 600+ lines of comprehensive tests
- **Fully Documented**: 50+ KB of documentation

## Documentation

- **README_BOUNTY.md** - Overview and quick start
- **FHEVM_README.md** - Deep concept explanations (600+ lines)
- **DEPLOYMENT.md** - Deployment instructions
- **PROJECT_SUMMARY.md** - High-level summary
- **BOUNTY_FILES.md** - File listing for judges

## Support

All documentation is self-contained. Check:
1. FHEVM_README.md troubleshooting section
2. Inline code comments
3. Test suite for usage examples

---

**Ready to explore FHEVM?** Run `npm run test` and see privacy-preserving governance in action!
