#!/usr/bin/env ts-node

/**
 * create-fhevm-example - CLI tool to generate standalone FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-example.ts confidential-governance ./output
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

// Example configuration interface
interface ExampleConfig {
  contract: string;
  test: string;
  description: string;
  title: string;
  additionalFiles?: string[];
}

// Map of example names to their contract and test paths
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'confidential-governance': {
    contract: 'contracts/ConfidentialGovernance.sol',
    test: 'test/ConfidentialGovernance.ts',
    title: 'Confidential Corporate Governance',
    description: 'Complete privacy-preserving corporate governance system with encrypted voting, demonstrating all major FHEVM patterns including encrypted storage, input proofs, access control, encrypted arithmetic, and public/user decryption',
    additionalFiles: [
      'tasks/accounts.ts',
      'tasks/governance.ts',
      'deploy/001_deploy_governance.ts',
    ],
  },
};

/**
 * Copy directory recursively
 */
function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy file
 */
function copyFile(src: string, dest: string): void {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
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
 * Extract contract name from Solidity file
 */
function extractContractName(contractPath: string): string {
  const content = fs.readFileSync(contractPath, 'utf-8');
  const match = content.match(/contract\s+(\w+)/);
  if (!match) {
    error(`Could not extract contract name from ${contractPath}`);
  }
  return match[1];
}

/**
 * Generate README for the example
 */
function generateReadme(exampleName: string, config: ExampleConfig, contractName: string): string {
  return `# ${config.title}

${config.description}

## FHEVM Concepts Demonstrated

This example showcases key FHEVM patterns:

- **Encrypted Storage**: Using euint8 and euint32 types for confidential data
- **Input Proof Verification**: Validating encrypted inputs with FHE.fromExternal()
- **Access Control**: Proper use of FHE.allowThis() and FHE.allow()
- **Encrypted Arithmetic**: Operations on encrypted data (FHE.add, FHE.eq, FHE.select)
- **Public Decryption**: Revealing results with FHE.decrypt() at appropriate times
- **User Decryption**: Allowing users to verify their own data with FHE.seal()

## Quick Start

### Prerequisites
- Node.js v20+
- npm v9.0.0+

### Installation

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
\`\`\`

## Project Structure

\`\`\`
${exampleName}/
├── contracts/
│   └── ${contractName}.sol       # Main contract
├── test/
│   └── ${contractName}.ts        # Comprehensive tests
├── deploy/
│   └── 001_deploy_${contractName.toLowerCase()}.ts  # Deployment script
├── tasks/
│   ├── accounts.ts               # Account utilities
│   └── governance.ts             # Contract interaction tasks
├── hardhat.config.ts             # Hardhat configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
\`\`\`

## Smart Contract

The \`${contractName}\` contract demonstrates:

1. **Encrypted State Variables**
   - Votes and counters stored as encrypted types
   - Privacy preserved throughout voting period

2. **Input Proof Validation**
   - All encrypted inputs validated with cryptographic proofs
   - Prevents invalid encrypted value submission

3. **Dual Permission Pattern**
   - Contract permission with FHE.allowThis()
   - User permission with FHE.allow()
   - Both required for proper operation

4. **Encrypted Operations**
   - Vote counting without decryption
   - Conditional logic on encrypted data
   - Arithmetic operations preserving encryption

5. **Controlled Decryption**
   - Public decryption after voting deadline
   - User decryption for vote verification
   - Timing-based access control

## Testing

The test suite includes:

✅ Contract deployment and initialization
✅ Role-based access control
✅ Encrypted vote submission with proofs
✅ Vote counting on encrypted data
✅ User vote verification
✅ Public result decryption
✅ Edge cases and error conditions

Run tests:
\`\`\`bash
npm run test
\`\`\`

Run with coverage:
\`\`\`bash
npm run coverage
\`\`\`

## Deployment

### Local Network

\`\`\`bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat deploy --network localhost
\`\`\`

### Sepolia Testnet

\`\`\`bash
# Configure environment
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy
npx hardhat deploy --network sepolia

# Verify (optional)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

## Hardhat Tasks

Interact with the deployed contract:

\`\`\`bash
# View contract information
npx hardhat governance:info --contract <ADDRESS> --network localhost

# Initialize company
npx hardhat governance:init --contract <ADDRESS> --name "MyCompany" --shares 10000

# Add shareholder
npx hardhat governance:add-shareholder --contract <ADDRESS> --address 0x... --name "Alice" --shares 1000

# Create proposal
npx hardhat governance:create-proposal --contract <ADDRESS> --type 1 --title "Q4 Budget" --description "Approve" --days 7

# List proposals
npx hardhat governance:list-proposals --contract <ADDRESS>
\`\`\`

## Key Learning Points

### Critical Pattern: Dual Permissions

\`\`\`solidity
// ❌ WRONG - Missing allowThis
euint8 vote = FHE.fromExternal(input, proof);
FHE.allow(vote, msg.sender);  // Will fail!

// ✅ CORRECT - Both permissions required
euint8 vote = FHE.fromExternal(input, proof);
FHE.allowThis(vote);           // Contract permission
FHE.allow(vote, msg.sender);   // User permission
\`\`\`

### Input Proof Security

Always verify encrypted inputs with proofs to ensure they're bound to the correct contract and user.

### Decryption Timing

Only decrypt when appropriate (e.g., after deadlines). Never decrypt mid-transaction without clear business logic.

### View Functions

Use \`FHE.seal()\` to re-encrypt for specific users rather than returning encrypted values directly from view functions.

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/
- **FHEVM Solidity Library**: https://github.com/zama-ai/fhevm
- **Zama Discord**: https://discord.gg/zama

## License

MIT License

## Acknowledgments

Built with Zama's FHEVM technology for the Bounty Program December 2025.
`;
}

/**
 * Generate deployment script
 */
function generateDeployScript(contractName: string): string {
  return `import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("${contractName}", {
    from: deployer,
    args: [],
    log: true,
  });
};

export default func;
func.tags = ["${contractName}"];
`;
}

/**
 * Update package.json for the example
 */
function updatePackageJson(outputDir: string, exampleName: string, config: ExampleConfig): void {
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = exampleName;
  packageJson.description = config.description;
  packageJson.keywords = ['fhevm', 'zama', 'ethereum', 'privacy', 'confidential', 'governance', 'hardhat'];

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log('\n📦 FHEVM Example Generator\n', Color.Cyan);
    log('Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]\n', Color.Yellow);
    log('Available examples:', Color.Blue);
    Object.keys(EXAMPLES_MAP).forEach((name) => {
      const config = EXAMPLES_MAP[name];
      log(`  • ${name}`, Color.Green);
      log(`    ${config.description}`, Color.Reset);
    });
    process.exit(0);
  }

  const exampleName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', exampleName);

  if (!EXAMPLES_MAP[exampleName]) {
    error(`Unknown example: ${exampleName}`);
  }

  const config = EXAMPLES_MAP[exampleName];
  const projectRoot = process.cwd();

  log(`\n🚀 Generating FHEVM example: ${exampleName}\n`, Color.Cyan);

  // Step 1: Create output directory
  info('Creating output directory...');
  if (fs.existsSync(outputDir)) {
    log(`⚠️  Output directory already exists: ${outputDir}`, Color.Yellow);
    log('Removing existing directory...', Color.Yellow);
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  success(`Created: ${outputDir}`);

  // Step 2: Copy base template files
  info('Copying base template...');
  const templateFiles = [
    'hardhat.config.ts',
    'tsconfig.hardhat.json',
    'package-hardhat.json',
    '.eslintrc.yml',
    '.eslintignore',
    '.solhint.json',
    '.solhintignore',
    '.prettierrc.yml',
    '.prettierignore',
    '.solcover.js',
    '.gitignore',
  ];

  for (const file of templateFiles) {
    const srcPath = path.join(projectRoot, file);
    const destPath = path.join(outputDir, file);
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    }
  }

  // Rename package-hardhat.json to package.json
  const packageHardhatPath = path.join(outputDir, 'package-hardhat.json');
  const packageJsonPath = path.join(outputDir, 'package.json');
  if (fs.existsSync(packageHardhatPath)) {
    fs.renameSync(packageHardhatPath, packageJsonPath);
  }

  success('Base template copied');

  // Step 3: Copy contract
  info('Copying contract...');
  const contractSrc = path.join(projectRoot, config.contract);
  const contractDest = path.join(outputDir, config.contract);
  copyFile(contractSrc, contractDest);
  const contractName = extractContractName(contractSrc);
  success(`Copied: ${config.contract}`);

  // Step 4: Copy test
  info('Copying test file...');
  const testSrc = path.join(projectRoot, config.test);
  const testDest = path.join(outputDir, config.test);
  copyFile(testSrc, testDest);
  success(`Copied: ${config.test}`);

  // Step 5: Copy additional files
  if (config.additionalFiles) {
    info('Copying additional files...');
    for (const file of config.additionalFiles) {
      const src = path.join(projectRoot, file);
      const dest = path.join(outputDir, file);
      if (fs.existsSync(src)) {
        copyFile(src, dest);
        success(`Copied: ${file}`);
      }
    }
  }

  // Step 6: Generate deployment script if not provided
  info('Generating deployment script...');
  const deployDir = path.join(outputDir, 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  const deployScript = generateDeployScript(contractName);
  writeFile(path.join(deployDir, `001_deploy_${contractName.toLowerCase()}.ts`), deployScript);
  success('Deployment script generated');

  // Step 7: Generate README
  info('Generating README...');
  const readme = generateReadme(exampleName, config, contractName);
  writeFile(path.join(outputDir, 'README.md'), readme);
  success('README generated');

  // Step 8: Update package.json
  info('Updating package.json...');
  updatePackageJson(outputDir, exampleName, config);
  success('package.json updated');

  // Done!
  log(`\n${'='.repeat(60)}`, Color.Green);
  success(`Example generated successfully!`);
  log(`${'='.repeat(60)}\n`, Color.Green);

  log('📦 Output directory:', Color.Blue);
  log(`   ${outputDir}\n`, Color.Cyan);

  log('🚀 Next steps:', Color.Blue);
  log(`   cd ${outputDir}`, Color.Reset);
  log(`   npm install`, Color.Reset);
  log(`   npm run compile`, Color.Reset);
  log(`   npm run test\n`, Color.Reset);

  log('📚 Files generated:', Color.Blue);
  log(`   • ${config.contract}`, Color.Green);
  log(`   • ${config.test}`, Color.Green);
  log(`   • deploy/001_deploy_${contractName.toLowerCase()}.ts`, Color.Green);
  log(`   • README.md`, Color.Green);
  log(`   • Hardhat configuration files`, Color.Green);
  if (config.additionalFiles) {
    config.additionalFiles.forEach((file) => log(`   • ${file}`, Color.Green));
  }
  log('');
}

// Run the script
main().catch((err) => {
  error(err.message);
});
