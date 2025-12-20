# Confidential Corporate Governance - FHEVM Smart Contract

**Zama Bounty Program December 2025: Build The FHEVM Example Hub**

A standalone, production-ready FHEVM smart contract example demonstrating privacy-preserving corporate governance through Fully Homomorphic Encryption.

## Quick Start

### Prerequisites
- Node.js v20+
- npm v9.0.0+

### Installation
```bash
# Install dependencies
npm install

# Copy the Hardhat package configuration
cp package-hardhat.json package.json

# Install again with Hardhat packages
npm install
```

### Run Tests
```bash
npm run compile
npm run test
```

## What This Project Demonstrates

This is a **complete, standalone FHEVM example** addressing the Zama bounty requirements:

### ✅ Project Requirements Met

1. **Standalone Hardhat Repository**
   - ✓ Uses only Hardhat (no monorepo)
   - ✓ Minimal, clean structure
   - ✓ Self-contained and reproducible

2. **Automation & Scaffolding**
   - ✓ Hardhat configuration included
   - ✓ Deployment scripts ready
   - ✓ Hardhat tasks for interaction

3. **Example Quality**
   - ✓ Comprehensive comments explaining concepts
   - ✓ Real-world use case (corporate governance)
   - ✓ Demonstrates multiple FHEVM patterns

4. **Test Coverage**
   - ✓ 600+ lines of comprehensive tests
   - ✓ All patterns and edge cases covered
   - ✓ Tests show both correct usage and pitfalls

5. **Documentation**
   - ✓ FHEVM_README.md - Detailed concept explanations
   - ✓ In-code documentation for all functions
   - ✓ Pattern examples and best practices
   - ✓ Troubleshooting guide

## FHEVM Concepts Demonstrated

### Core Patterns

**1. Encrypted Data Storage**
```solidity
mapping(uint256 => mapping(address => euint8)) private encryptedVotes;
mapping(uint256 => euint32) private encryptedYesCount;
```
→ Shows how to store and manage encrypted state variables

**2. Input Proof Verification**
```solidity
euint8 encryptedVote = FHE.fromExternal(inputEuint8, inputProof);
```
→ Demonstrates secure external encrypted input handling

**3. Access Control (Critical Pattern)**
```solidity
FHE.allowThis(encryptedValue);          // Contract permission
FHE.allow(encryptedValue, msg.sender);  // User permission
```
→ Shows both permissions required for FHEVM operations

**4. Encrypted Arithmetic**
```solidity
euint8 encryptedOne = FHE.asEuint8(1);
ebool isYes = FHE.eq(encryptedVote, encryptedOne);
euint32 increment = FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0));
encryptedCounter = FHE.add(encryptedCounter, increment);
```
→ Vote counting entirely on encrypted data

**5. Public Decryption**
```solidity
uint32 yesVotes = FHE.decrypt(encryptedYesCount[proposalId]);
```
→ Transparent result publication after deadline

**6. User Decryption**
```solidity
return FHE.seal(encryptedVotes[proposalId][msg.sender]);
```
→ Vote verification while maintaining others' privacy

## Project Structure

```
contracts/
  └── ConfidentialGovernance.sol       # 330+ lines with detailed comments
test/
  └── ConfidentialGovernance.ts        # 600+ lines comprehensive tests
deploy/
  └── 001_deploy_governance.ts         # Deployment script
tasks/
  ├── accounts.ts
  └── governance.ts                    # Interaction helpers
hardhat.config.ts                      # Complete Hardhat setup
tsconfig.hardhat.json                  # TypeScript configuration
package-hardhat.json                   # Dependencies (rename to package.json)
FHEVM_README.md                        # Deep concept explanations
```

## Smart Contract Overview

### ConfidentialGovernance Contract

**Core Functionality:**
- Company initialization with share management
- Board member and shareholder registration
- Confidential proposal creation
- Encrypted vote submission and counting
- Public result decryption and finalization
- User vote verification

**Key Functions:**
- `voteConfidential()` - Demonstrates input proofs, encrypted storage, access control
- `finalizeProposal()` - Shows public decryption timing
- `getMyVote()` - User decryption pattern
- Access control with role-based modifiers

## Test Suite

Comprehensive tests covering:

✅ Deployment & initialization
✅ Board member management
✅ Shareholder registration
✅ Proposal creation
✅ Encrypted voting with input proofs
✅ Vote counting on encrypted data
✅ User vote verification
✅ Public decryption & finalization
✅ Access control enforcement
✅ Double-voting prevention
✅ Deadline enforcement
✅ Edge cases (no votes, all abstain)
✅ Error conditions

**Test Statistics:**
- 30+ test cases
- 5+ major test suites
- Coverage of success and failure paths
- Examples of correct usage and anti-patterns

## Running the Project

### Compile
```bash
npm run compile
```
Compiles Solidity contracts and generates TypeChain types.

### Test
```bash
npm run test
```
Runs full test suite against FHEVM mock.

### Test Specific Feature
```bash
npx hardhat test --grep "Confidential Voting"
```

### Coverage
```bash
npm run coverage
```
Generates code coverage report.

### Linting
```bash
npm run lint            # All linters
npm run lint:sol        # Solidity
npm run lint:ts         # TypeScript
npm run prettier:write  # Auto-format
```

### Hardhat Tasks

```bash
# Show accounts
npx hardhat accounts

# Deploy
npx hardhat deploy --network localhost

# View governance info
npx hardhat governance:info --contract 0x...

# Add shareholder
npx hardhat governance:add-shareholder --contract 0x... --address 0x... --name "John" --shares 1000

# List proposals
npx hardhat governance:list-proposals --contract 0x...
```

## Deployment

### Local Development
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat deploy --network localhost
```

### Sepolia Testnet
```bash
# Set environment
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy
npx hardhat deploy --network sepolia

# Verify (optional)
npx hardhat verify --network sepolia <ADDRESS>
```

## Code Quality

✅ **Solidity Best Practices**
- Comprehensive input validation
- Event logging for all state changes
- Proper error handling
- Optimized gas usage

✅ **FHEVM Patterns**
- Both FHE.allowThis() and FHE.allow() usage
- Input proof verification
- Proper permission scoping
- Safe decryption timing

✅ **TypeScript/Testing**
- Full type safety with TypeChain
- Descriptive test names
- Clear test organization
- Edge case coverage

✅ **Documentation**
- Every function documented
- FHEVM patterns explained
- Examples provided
- Anti-patterns highlighted

## Key Learning Points

### Critical FHEVM Pattern
```solidity
// ❌ WRONG - Missing allowThis
euint8 vote = FHE.fromExternal(input, proof);
FHE.allow(vote, msg.sender);  // Will fail!

// ✅ CORRECT - Both permissions required
euint8 vote = FHE.fromExternal(input, proof);
FHE.allowThis(vote);           // Contract permission
FHE.allow(vote, msg.sender);   // User permission
```

### Input Proof Security
Encrypted inputs MUST include cryptographic proofs to verify they're bound to the correct contract and user.

### Decryption Timing
Public decryption should only happen when appropriate (e.g., after voting deadline), never mid-transaction without clear business logic.

### View Functions with Encrypted Values
Use `FHE.seal()` to re-encrypt for specific users rather than returning encrypted values directly.

## Files Generated

After setup, the project includes:

```
✓ contracts/ConfidentialGovernance.sol - Main contract
✓ test/ConfidentialGovernance.ts - Complete test suite
✓ deploy/001_deploy_governance.ts - Deployment script
✓ tasks/accounts.ts - Account display
✓ tasks/governance.ts - Governance tasks
✓ hardhat.config.ts - Hardhat configuration
✓ tsconfig.hardhat.json - TypeScript config
✓ .eslintrc.yml - Linting rules
✓ .solhint.json - Solidity linting
✓ .prettierrc.yml - Code formatting
✓ FHEVM_README.md - Detailed documentation
✓ README_BOUNTY.md - This file
```

## Technologies Used

- **Solidity ^0.8.24** - Smart contract language
- **@fhevm/solidity** - FHE operations
- **@fhevm/hardhat-plugin** - Testing support
- **Hardhat** - Development environment
- **TypeScript** - Type-safe development
- **Chai** - Testing assertions
- **ethers.js v6** - Blockchain interaction

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org
- **FHEVM Solidity**: https://github.com/zama-ai/fhevm
- **This Project**: See FHEVM_README.md for deep dives

## Bonus Features

Beyond requirements, this project includes:

✨ **Comprehensive Comments** - Every pattern explained in code
✨ **Multiple Test Scenarios** - Success paths and edge cases
✨ **Hardhat Tasks** - Interactive contract management
✨ **Code Quality Tools** - Linting, formatting, coverage
✨ **Best Practices** - Security-focused implementation
✨ **Learning Resources** - Detailed explanations of FHEVM

## Troubleshooting

**Tests fail with "FHE call should not fail"**
→ Ensure both `allowThis()` and `allow()` are called

**Input proof verification fails**
→ Verify encryption is for correct contract address and signer

**Cannot finalize proposal**
→ Check voting deadline has passed

**View functions error with encrypted types**
→ Use `FHE.seal()` instead of returning encrypted values

## License

MIT License

## Acknowledgments

Built for Zama's FHEVM Bounty Program - December 2025, demonstrating privacy-preserving governance patterns using Fully Homomorphic Encryption.

---

**Start Learning**: Read FHEVM_README.md for detailed concept explanations and patterns.

**Run Tests**: `npm run test` to see all patterns in action.

**Deploy**: Use Hardhat tasks to interact with your deployed contract.
