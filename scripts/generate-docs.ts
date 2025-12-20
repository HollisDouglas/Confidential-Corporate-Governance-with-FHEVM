#!/usr/bin/env ts-node

/**
 * generate-docs - CLI tool to generate GitBook documentation from FHEVM examples
 *
 * Usage: ts-node scripts/generate-docs.ts <example-name>
 *        ts-node scripts/generate-docs.ts --all
 *
 * Example: ts-node scripts/generate-docs.ts confidential-governance
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Example documentation configuration
interface DocsConfig {
  title: string;
  description: string;
  contract: string;
  test: string;
  output: string;
  category: string;
  concepts: string[];
}

// Map of examples to their documentation config
const EXAMPLES_CONFIG: Record<string, DocsConfig> = {
  'confidential-governance': {
    title: 'Confidential Corporate Governance',
    description: 'Complete privacy-preserving corporate governance system with encrypted voting, demonstrating all major FHEVM patterns.',
    contract: 'contracts/ConfidentialGovernance.sol',
    test: 'test/ConfidentialGovernance.ts',
    output: 'examples/confidential-governance.md',
    category: 'Advanced Examples',
    concepts: [
      'Encrypted Storage',
      'Input Proof Verification',
      'Access Control',
      'Encrypted Arithmetic',
      'Public Decryption',
      'User Decryption',
      'Role-Based Permissions',
      'Real-World Application',
    ],
  },
};

/**
 * Read file content
 */
function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Write file
 */
function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Generate GitBook documentation
 */
function generateDocumentation(exampleName: string, config: DocsConfig, projectRoot: string): string {
  const contractPath = path.join(projectRoot, config.contract);
  const testPath = path.join(projectRoot, config.test);

  const contractCode = readFile(contractPath);
  const testCode = readFile(testPath);

  // Extract key comments and patterns
  const contractLines = contractCode.split('\n');
  const testLines = testCode.split('\n');

  // Find documentation comments
  const docComments: string[] = [];
  for (let i = 0; i < contractLines.length; i++) {
    const line = contractLines[i];
    if (line.includes('///') || line.includes('/**')) {
      docComments.push(line.trim());
    }
  }

  const markdown = `# ${config.title}

## Overview

${config.description}

### Zama Bounty Program: December 2025

This example is part of the "Build The FHEVM Example Hub" bounty, demonstrating complete implementation of privacy-preserving patterns using Fully Homomorphic Encryption.

## FHEVM Concepts Demonstrated

${config.concepts.map((concept) => `- **${concept}**`).join('\n')}

## Smart Contract

### File: \`${config.contract}\`

This contract demonstrates:

1. **Encrypted State Variables** - Using euint8 and euint32 types for confidential data storage
2. **Input Proof Verification** - Validating encrypted inputs with FHE.fromExternal()
3. **Access Control** - Proper implementation of FHE.allowThis() and FHE.allow()
4. **Encrypted Operations** - Arithmetic and comparison operations on encrypted data
5. **Public Decryption** - Strategic decryption of results after deadlines
6. **User Decryption** - Individual vote verification while maintaining privacy

### Key Functions

\`\`\`solidity
// Encrypted vote submission with proof verification
function voteConfidential(
    uint256 _proposalId,
    externalEuint8 inputEuint8,
    bytes calldata inputProof
) external

// Finalize proposal and decrypt results
function finalizeProposal(uint256 _proposalId) external

// User verification of their own vote
function getMyVote(uint256 _proposalId) external view returns (bytes memory)
\`\`\`

**View Contract Code Below** ↓

\`\`\`solidity
${contractCode}
\`\`\`

## Test Suite

### File: \`${config.test}\`

Comprehensive test coverage including:

- ✅ Contract deployment and initialization
- ✅ Role-based access control enforcement
- ✅ Proposal creation and validation
- ✅ Encrypted vote submission with input proofs
- ✅ Vote counting on encrypted data (without decryption)
- ✅ User vote verification
- ✅ Public result decryption after deadline
- ✅ Edge cases and error conditions

Each test demonstrates proper FHEVM patterns and includes both success and failure scenarios.

**View Test Code Below** ↓

\`\`\`typescript
${testCode}
\`\`\`

## Key Learning Points

### Pattern 1: Critical Dual Permission Requirements

\`\`\`solidity
// ❌ WRONG - Missing allowThis causes failures
euint8 encryptedValue = FHE.fromExternal(input, proof);
FHE.allow(encryptedValue, msg.sender);  // Insufficient!

// ✅ CORRECT - Both permissions required
euint8 encryptedValue = FHE.fromExternal(input, proof);
FHE.allowThis(encryptedValue);          // Contract permission
FHE.allow(encryptedValue, msg.sender);  // User permission
\`\`\`

### Pattern 2: Encrypted Vote Counting

Vote counting happens entirely on encrypted data, never revealing individual votes during the voting period:

\`\`\`solidity
// Encrypted comparison and conditional increment
euint8 choiceOne = FHE.asEuint8(1);
ebool isYes = FHE.eq(encryptedVote, choiceOne);
euint32 increment = FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0));
encryptedYesCount = FHE.add(encryptedYesCount, increment);
\`\`\`

### Pattern 3: Decryption Timing Control

Results are only decrypted after the voting deadline, preventing manipulation:

\`\`\`solidity
function finalizeProposal(uint256 _proposalId) external {
    require(block.timestamp >= deadline, "Voting period still active");
    uint32 yesVotes = FHE.decrypt(encryptedYesCount);  // Public decryption
    // Results now visible to all
}
\`\`\`

### Pattern 4: User Decryption for Verification

Users can verify their own votes without revealing others' votes:

\`\`\`solidity
function getMyVote(uint256 _proposalId) external view returns (bytes memory) {
    return FHE.seal(encryptedVotes[_proposalId][msg.sender]);  // Re-encrypt for user only
}
\`\`\`

## Security Considerations

### ✅ Good Practices Demonstrated

- Input proofs validate encrypted submissions
- Access control enforced at contract boundaries
- Decryption only happens when appropriate
- Event logging for all state changes
- Role-based permission system

### ❌ Anti-Patterns to Avoid

- Never forget FHE.allowThis() when using FHE.allow()
- Don't return encrypted values from view functions
- Avoid decrypting during active voting periods
- Never decrypt without validating prerequisites

## Deployment

### Local Testing

\`\`\`bash
npm install
npm run compile
npm run test
npm run coverage
\`\`\`

### Network Deployment

\`\`\`bash
# Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy to Sepolia
npx hardhat deploy --network sepolia
\`\`\`

## Testing Examples

### Basic Initialization

\`\`\`typescript
it("should initialize company correctly", async function () {
  await governanceContract.initializeCompany("TechCorp Inc.", 10000);
  expect(await governanceContract.companyName()).to.equal("TechCorp Inc.");
  expect(await governanceContract.totalShares()).to.equal(10000);
});
\`\`\`

### Confidential Voting

\`\`\`typescript
it("should allow shareholder to cast encrypted vote", async function () {
  const encryptedVote = await fhevm
    .createEncryptedInput(contractAddress, shareholder.address)
    .add8(VoteChoice.Yes)
    .encrypt();

  await governanceContract.connect(shareholder)
    .voteConfidential(proposalId, encryptedVote.handles[0], encryptedVote.inputProof);

  expect(await governanceContract.hasUserVoted(proposalId, shareholder.address)).to.be.true;
});
\`\`\`

## Real-World Applications

This governance pattern can be adapted for:

- **Corporate Elections** - Board elections with privacy
- **Shareholder Votes** - Confidential voting on company decisions
- **DAO Governance** - Private voting in decentralized organizations
- **Stakeholder Decisions** - Any multi-party voting scenario

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/
- **Solidity Documentation**: https://docs.soliditylang.org/
- **Zama Discord**: https://discord.gg/zama

## Summary

This example demonstrates a production-ready implementation of privacy-preserving corporate governance. It showcases how Fully Homomorphic Encryption enables:

✅ Complete vote privacy during voting period
✅ Transparent result publication when appropriate
✅ User verification of individual votes
✅ Secure cryptographic validation of inputs
✅ Real-world applicability beyond simple examples

The comprehensive test suite validates all FHEVM patterns and edge cases, making this an excellent reference for advanced FHEVM development.

---

**Built for the Zama FHEVM Bounty Program - December 2025**

*Demonstrating the power of privacy-preserving governance with Fully Homomorphic Encryption*
`;

  return markdown;
}

/**
 * Update SUMMARY.md
 */
function updateSummary(projectRoot: string, examples: Map<string, DocsConfig>): void {
  const summaryPath = path.join(projectRoot, 'examples', 'SUMMARY.md');

  // Group examples by category
  const byCategory: Record<string, string[]> = {};

  examples.forEach((config, name) => {
    if (!byCategory[config.category]) {
      byCategory[config.category] = [];
    }
    byCategory[config.category].push(name);
  });

  let content = `# FHEVM Examples - Complete Documentation

This guide provides comprehensive documentation for all FHEVM examples, demonstrating key patterns and concepts for privacy-preserving smart contracts.

## Table of Contents

`;

  // Generate TOC
  Object.keys(byCategory)
    .sort()
    .forEach((category) => {
      content += `\n### ${category}\n\n`;
      byCategory[category].forEach((name) => {
        const config = examples.get(name)!;
        const docName = path.basename(config.output, '.md');
        content += `- [${config.title}](${docName}.md)\n`;
      });
    });

  content += `

## Learning Path

### Beginner Level
Start with basic contract deployment and simple operations.

### Intermediate Level
Learn encrypted operations and access control patterns.

### Advanced Level
Master public decryption timing and user verification patterns.

## FHEVM Concepts Coverage

All major FHEVM concepts are demonstrated:

- ✅ Encrypted Data Storage (euint8, euint32, etc.)
- ✅ Input Proof Verification
- ✅ Access Control Patterns (FHE.allowThis, FHE.allow)
- ✅ Encrypted Arithmetic Operations
- ✅ Encrypted Comparisons and Conditionals
- ✅ Public Decryption
- ✅ User Decryption
- ✅ Handle Management

## Best Practices

Each example includes:
- Comprehensive inline documentation
- Security considerations
- Common pitfalls to avoid
- Testing patterns and edge cases
- Deployment instructions

## Resources

- **Official FHEVM Docs**: https://docs.zama.ai/fhevm
- **GitHub Examples**: https://github.com/zama-ai/fhevm
- **Community Discord**: https://discord.gg/zama
- **Zama Website**: https://www.zama.ai/

## Bounty Program

These examples are part of the **Zama FHEVM Bounty December 2025: Build The FHEVM Example Hub** program.

---

**Generated for the Zama FHEVM Community**
`;

  writeFile(summaryPath, content);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log('\n📚 FHEVM Documentation Generator\n', Color.Cyan);
    log('Usage: ts-node scripts/generate-docs.ts <example-name>\n', Color.Yellow);
    log('       ts-node scripts/generate-docs.ts --all\n', Color.Yellow);
    log('Available examples:', Color.Blue);
    Object.keys(EXAMPLES_CONFIG).forEach((name) => {
      const config = EXAMPLES_CONFIG[name];
      log(`  • ${name}`, Color.Green);
      log(`    ${config.title}`, Color.Reset);
    });
    process.exit(0);
  }

  const projectRoot = process.cwd();

  if (args[0] === '--all') {
    log('\n📚 Generating all documentation\n', Color.Cyan);

    const allExamples = new Map(Object.entries(EXAMPLES_CONFIG));

    allExamples.forEach((config, exampleName) => {
      info(`Generating docs for ${exampleName}...`);

      const docs = generateDocumentation(exampleName, config, projectRoot);
      const outputPath = path.join(projectRoot, config.output);
      writeFile(outputPath, docs);

      success(`Generated: ${config.output}`);
    });

    // Update SUMMARY.md
    info('Updating SUMMARY.md...');
    updateSummary(projectRoot, allExamples);
    success('Updated: examples/SUMMARY.md');

    log(`\n${'='.repeat(60)}`, Color.Green);
    success(`All documentation generated!`);
    log(`${'='.repeat(60)}\n`, Color.Green);

    log('📄 Generated files:', Color.Blue);
    allExamples.forEach((config) => {
      log(`   • ${config.output}`, Color.Green);
    });
    log(`   • examples/SUMMARY.md\n`, Color.Green);
  } else {
    const exampleName = args[0];

    if (!EXAMPLES_CONFIG[exampleName]) {
      error(`Unknown example: ${exampleName}`);
    }

    const config = EXAMPLES_CONFIG[exampleName];

    log(`\n📚 Generating documentation for: ${exampleName}\n`, Color.Cyan);

    info('Reading contract and test files...');
    const docs = generateDocumentation(exampleName, config, projectRoot);

    info('Writing documentation...');
    const outputPath = path.join(projectRoot, config.output);
    writeFile(outputPath, docs);
    success(`Generated: ${config.output}`);

    log(`\n${'='.repeat(60)}`, Color.Green);
    success(`Documentation generated!`);
    log(`${'='.repeat(60)}\n`, Color.Green);

    log('📄 Output file:', Color.Blue);
    log(`   ${outputPath}\n`, Color.Cyan);
  }
}

// Run the script
main().catch((err) => {
  error(err.message);
});
