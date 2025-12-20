# FHEVM Example Hub - Automation Scripts

This directory contains TypeScript-based automation scripts for generating standalone FHEVM example repositories and documentation.

## Scripts Overview

### 1. `create-fhevm-example.ts` - Repository Generator

Generates a complete, standalone FHEVM example repository from the base template.

**Usage:**
```bash
ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
npm run create-example <example-name> [output-dir]
```

**Features:**
- Copies base Hardhat template configuration
- Includes contract and comprehensive tests
- Generates deployment scripts
- Creates example-specific README
- Produces ready-to-use standalone repositories

**Available Examples:**
- `confidential-governance` - Complete privacy-preserving corporate governance system

**Example:**
```bash
# Generate confidential-governance example
ts-node scripts/create-fhevm-example.ts confidential-governance ./output/confidential-governance

# Test the generated example
cd output/confidential-governance
npm install
npm run compile
npm run test
```

### 2. `generate-docs.ts` - Documentation Generator

Generates GitBook-formatted documentation from contract and test files.

**Usage:**
```bash
ts-node scripts/generate-docs.ts <example-name>
ts-node scripts/generate-docs.ts --all
npm run generate-docs <example-name>
npm run generate-all-docs
```

**Features:**
- Extracts contract and test code
- Generates GitBook-compatible markdown
- Creates comprehensive documentation
- Auto-updates `examples/SUMMARY.md`
- Includes security considerations and learning points

**Example:**
```bash
# Generate docs for single example
ts-node scripts/generate-docs.ts confidential-governance

# Generate all documentation
ts-node scripts/generate-docs.ts --all
```

**Output:**
- `examples/confidential-governance.md` - Full documentation
- `examples/SUMMARY.md` - Index of all examples

### 3. `create-fhevm-category.ts` - Category Generator (Future)

Placeholder for future multi-example category generation.

## Development Workflow

### Adding a New Example

1. **Create the contract** in `contracts/` with detailed comments
2. **Create comprehensive tests** in `test/`
3. **Update scripts configurations:**
   - Add to `EXAMPLES_MAP` in `create-fhevm-example.ts`
   - Add to `EXAMPLES_CONFIG` in `generate-docs.ts`

4. **Generate documentation:**
   ```bash
   npm run generate-docs new-example
   ```

5. **Generate standalone repository:**
   ```bash
   npm run create-example new-example ./output/new-example
   ```

6. **Test the generated repository:**
   ```bash
   cd output/new-example
   npm install
   npm run compile
   npm run test
   npm run lint
   ```

### Configuration Objects

#### create-fhevm-example.ts

```typescript
interface ExampleConfig {
  contract: string;              // Path to contract file
  test: string;                  // Path to test file
  description: string;           // Short description
  title: string;                 // Display title
  additionalFiles?: string[];    // Optional additional files to copy
}

const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'example-name': {
    contract: 'contracts/Example.sol',
    test: 'test/Example.ts',
    title: 'Example Title',
    description: 'Description of what this example demonstrates',
    additionalFiles: ['tasks/example.ts'],
  },
};
```

#### generate-docs.ts

```typescript
interface DocsConfig {
  title: string;                 // Display title
  description: string;           // Full description
  contract: string;              // Contract file path
  test: string;                  // Test file path
  output: string;                // Output markdown file
  category: string;              // Documentation category
  concepts: string[];            // FHEVM concepts demonstrated
}

const EXAMPLES_CONFIG: Record<string, DocsConfig> = {
  'example-name': {
    title: 'Example Title',
    description: 'Full description for documentation',
    contract: 'contracts/Example.sol',
    test: 'test/Example.ts',
    output: 'examples/example.md',
    category: 'Category Name',
    concepts: ['Concept 1', 'Concept 2'],
  },
};
```

## File Structure

```
scripts/
├── README.md                     # This file
├── create-fhevm-example.ts      # Single example generator
├── generate-docs.ts             # Documentation generator
└── create-fhevm-category.ts     # Category generator (placeholder)
```

## npm Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "create-example": "ts-node scripts/create-fhevm-example.ts",
    "generate-docs": "ts-node scripts/generate-docs.ts",
    "generate-all-docs": "ts-node scripts/generate-docs.ts --all",
    "help:examples": "ts-node scripts/create-fhevm-example.ts",
    "help:docs": "ts-node scripts/generate-docs.ts"
  }
}
```

## Usage Examples

### List Available Examples

```bash
npm run create-example
npm run generate-docs
```

### Generate Single Example

```bash
npm run create-example confidential-governance ./my-governance-example
cd my-governance-example
npm install && npm run test
```

### Generate Documentation

```bash
# Single example
npm run generate-docs confidential-governance

# All examples
npm run generate-all-docs
```

### Complete Workflow

```bash
# 1. Create standalone example
npm run create-example confidential-governance ./output/confidential-governance

# 2. Generate documentation
npm run generate-all-docs

# 3. Test generated example
cd output/confidential-governance
npm install
npm run compile
npm run test
npm run coverage
npm run lint

# 4. Review documentation
cat ../examples/confidential-governance.md
cat ../examples/SUMMARY.md
```

## Best Practices

### For Contract Code

- Include detailed JSDoc comments
- Mark FHEVM patterns with `@fhevm` tags
- Show both correct usage and anti-patterns
- Explain security considerations
- Document access control requirements

### For Test Code

- Use descriptive test names
- Include comments explaining each test
- Test both success and failure paths
- Show common pitfalls with ❌ markers
- Demonstrate correct patterns with ✅ markers

### For Examples

- Keep contracts focused on specific concepts
- Make tests comprehensive but readable
- Document all FHEVM-specific patterns
- Provide clear learning progression
- Include deployment guidance

## Troubleshooting

### Script Errors

**"Cannot find module"**
- Ensure TypeScript is installed: `npm install`
- Check Node.js version: v16+ required

**"File not found"**
- Verify paths in script configuration objects
- Check contract/test files exist
- Ensure paths are relative to project root

**"Contract name extraction fails"**
- Verify contract declaration format
- Ensure contract name is on separate line
- Check no extra keywords before `contract`

### Generated Example Issues

**Compilation fails**
- Verify all dependencies in `package.json`
- Check contract imports are correct
- Review Solidity version compatibility

**Tests fail**
- Ensure FHEVM mock is available
- Check test fixture paths
- Verify contract deployment in tests

**Missing documentation**
- Check example name matches config
- Verify category name is set
- Run `npm run generate-all-docs`

## Maintenance

### Updating Dependencies

When updating `@fhevm/solidity` or other dependencies:

1. **Update base files**
   ```bash
   npm install @fhevm/solidity@latest
   npm run compile
   npm run test
   ```

2. **Regenerate examples**
   ```bash
   npm run create-example confidential-governance ./test-output/confidential-governance
   cd ./test-output/confidential-governance
   npm install && npm test
   ```

3. **Update documentation**
   ```bash
   npm run generate-all-docs
   ```

### Bulk Operations

```bash
# Regenerate all documentation
npm run generate-all-docs

# Test multiple examples
npm run create-example confidential-governance ./output/confidential-governance
cd ./output/confidential-governance
npm install && npm test
```

## Contributing

When adding new examples or modifying scripts:

1. ✅ Update script configurations
2. ✅ Test generation output
3. ✅ Verify documentation generation
4. ✅ Test generated repositories compile and pass tests
5. ✅ Update this README

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/
- **TypeScript Docs**: https://www.typescriptlang.org/
- **Zama Discord**: https://discord.gg/zama

## License

MIT License - See main LICENSE file

---

**Built for Zama FHEVM Bounty December 2025**
