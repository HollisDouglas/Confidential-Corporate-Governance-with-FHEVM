# Confidential Corporate Governance with FHEVM

A privacy-preserving corporate governance platform built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), enabling confidential shareholder voting while maintaining complete transparency and auditability when needed.

## Overview

This project demonstrates how Fully Homomorphic Encryption (FHE) can revolutionize corporate governance by enabling shareholders to vote on proposals with complete privacy. Votes remain encrypted on-chain and are only decrypted when the voting period ends, preventing vote manipulation and ensuring fair decision-making processes.

Video Demostration: Confidential Corporate Governance with FHEVM.mp4  https://youtu.be/6qEalXOVYZw

Live Demo : https://confidential-corporate-governance-w.vercel.app/

## Key Features

- **Confidential Voting**: Cast votes on governance proposals with FHE encryption
- **Access Control**: Role-based permissions for board members and shareholders
- **Public Decryption**: Automatic vote tallying after proposal deadline
- **User Decryption**: Shareholders can verify their own encrypted votes
- **Input Proofs**: Secure vote submission with cryptographic verification
- **Real-time Dashboard**: Track active proposals and voting status
- **Modern Web Interface**: Responsive Vue.js application with TypeScript

## FHEVM Concepts Demonstrated

### 1. Confidential Data Storage
The smart contract stores votes as encrypted values using FHEVM's encrypted types:
- Encrypted vote choices (euint8)
- Confidential vote tallies during active voting
- Privacy-preserving vote counting

### 2. Access Control Patterns
Demonstrates proper FHE access control:
- `TFHE.allow()` for granting access to encrypted values
- `TFHE.allowTransient()` for temporary access during transactions
- Role-based access for board members and shareholders

### 3. Public Decryption
Shows how to decrypt confidential data when appropriate:
- Votes remain encrypted during voting period
- Automatic decryption after proposal deadline
- Transparent result publication

### 4. User Decryption
Enables users to verify their own encrypted votes:
- Individual vote verification
- Privacy maintained for other voters
- Cryptographic proof of vote integrity

### 5. Input Proof Verification
Secure vote submission process:
- Client-side vote encryption
- Input proof generation
- On-chain proof verification
- Prevention of invalid encrypted values

## Technology Stack

### Smart Contract
- **Solidity**: Smart contract development
- **FHEVM SDK**: Fully Homomorphic Encryption operations
- **Hardhat**: Development environment and testing
- **OpenZeppelin**: Security and standard implementations

### Frontend Application
- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Next-generation frontend tooling
- **Tailwind CSS**: Utility-first styling
- **Ethers.js**: Ethereum blockchain interaction
- **fhevmjs**: FHEVM client-side encryption

## Project Structure

```
ConfidentialCorporateGovernance/
├── contracts/
│   ├── ConfidentialGovernance.sol    # Main governance contract
│   └── interfaces/
│       └── IGovernance.sol           # Contract interface
├── test/
│   ├── ConfidentialGovernance.test.ts
│   └── fixtures/
│       └── deploy.ts
├── scripts/
│   ├── deploy.ts
│   └── interact.ts
├── frontend/                          # Vue.js application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── composables/              # Vue composition functions
│   │   ├── views/                    # Page components
│   │   ├── utils/                    # Helper functions
│   │   └── types/                    # TypeScript definitions
│   ├── public/                       # Static assets
│   └── package.json
├── hardhat.config.ts
├── package.json
└── README.md
```

## Smart Contract Architecture

### Core Contract: ConfidentialGovernance

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

contract ConfidentialGovernance {
    // Encrypted vote storage
    mapping(uint256 => mapping(address => euint8)) private encryptedVotes;

    // Public vote tallies (decrypted after deadline)
    mapping(uint256 => VoteTally) public results;

    // Access control
    mapping(address => bool) public boardMembers;
    mapping(address => Shareholder) public shareholders;

    // Proposal management
    Proposal[] public proposals;
}
```

### Key Functions

#### 1. Creating Proposals (Board Members Only)
```solidity
function createProposal(
    uint8 _type,
    string memory _title,
    uint256 _days
) external onlyBoardMember returns (uint256)
```

#### 2. Confidential Voting
```solidity
function voteConfidential(
    uint256 _id,
    bytes calldata encryptedVote,
    bytes calldata inputProof
) external onlyShareholder
```

#### 3. Vote Finalization with Public Decryption
```solidity
function finalize(uint256 _id) public {
    require(block.timestamp >= proposals[_id].deadline, "Voting still active");

    // Decrypt vote tallies
    uint32 yesVotes = TFHE.decrypt(encryptedYesCount);
    uint32 noVotes = TFHE.decrypt(encryptedNoCount);

    results[_id] = VoteTally(yesVotes, noVotes, yesVotes > noVotes);
}
```

#### 4. User Vote Verification
```solidity
function getMyVote(uint256 _id) external view returns (bytes memory) {
    // Allow voter to decrypt their own vote
    return TFHE.reencrypt(encryptedVotes[_id][msg.sender], msg.sender);
}
```

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH

### Backend Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

3. Compile contracts:
```bash
npx hardhat compile
```

4. Run tests:
```bash
npx hardhat test
```

5. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_RPC_URL=https://sepolia.infura.io/v3/your_key
VITE_CHAIN_ID=11155111
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:3001`

5. Build for production:
```bash
npm run build
```

## Usage Guide

### For Company Administrators

1. **Initialize Company**
   - Connect wallet as contract owner
   - Set company name and total shares
   - Company details are stored on-chain

2. **Add Board Members**
   - Grant board member role to addresses
   - Board members can create proposals

3. **Add Shareholders**
   - Register shareholder addresses
   - Assign share amounts
   - Set shareholder names and information

### For Board Members

1. **Create Proposals**
   - Navigate to Proposals page
   - Click "Create Proposal"
   - Select proposal type (Board Decision, Financial, Strategic, Operational)
   - Enter proposal title and voting duration
   - Submit transaction

### For Shareholders

1. **View Proposals**
   - Dashboard shows active and completed proposals
   - Click on proposal cards for details

2. **Cast Confidential Votes**
   - Click "Vote" on active proposal
   - Select Yes/No/Abstain
   - Enable "Confidential Vote" option
   - Vote is encrypted client-side before submission
   - Confirm transaction in wallet

3. **Verify Your Vote**
   - After voting, verify your encrypted vote
   - Your vote remains private until finalization

4. **View Results**
   - Results appear after voting deadline
   - Votes are decrypted and tallied automatically

## Testing

### Smart Contract Tests

The test suite demonstrates:
- Company initialization
- Board member management
- Shareholder registration
- Proposal creation
- Confidential voting
- Vote decryption
- Access control enforcement
- Edge case handling

Run tests:
```bash
npx hardhat test
```

Test coverage:
```bash
npx hardhat coverage
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Security Considerations

### FHE Security
- All votes encrypted with FHEVM
- Encryption keys managed by FHEVM network
- No plaintext votes stored on-chain during voting period

### Access Control
- Role-based permissions enforced
- Board member verification for proposal creation
- Shareholder verification for voting
- Owner-only administrative functions

### Input Validation
- Input proofs verify encrypted vote validity
- Proposal deadline enforcement
- Double-voting prevention
- Invalid vote rejection

## Gas Optimization

- Efficient encrypted storage patterns
- Batch operations where possible
- Optimized access control checks
- Minimal storage usage

## Common Patterns & Best Practices

### 1. Proper FHE Allowances
```typescript
// Always grant access before using encrypted values
TFHE.allow(encryptedValue, address);
```

### 2. Input Proof Usage
```typescript
// Client-side encryption with proof
const { handles, inputProof } = await instance.createEncryptedInput(
    contractAddress,
    userAddress
).add8(voteChoice).encrypt();

// Submit with proof
await contract.voteConfidential(proposalId, handles[0], inputProof);
```

### 3. Decryption Timing
```typescript
// Only decrypt when appropriate
require(block.timestamp >= deadline, "Cannot decrypt yet");
uint32 result = TFHE.decrypt(encryptedValue);
```

## Anti-Patterns to Avoid

### Don't: Use encrypted values in view functions
```solidity
// ❌ WRONG - Cannot return encrypted values in view
function getVote(uint256 id) public view returns (euint8) {
    return encryptedVotes[id][msg.sender];
}
```

### Do: Re-encrypt for user
```solidity
// ✅ CORRECT - Re-encrypt for specific user
function getVote(uint256 id) public view returns (bytes memory) {
    return TFHE.reencrypt(encryptedVotes[id][msg.sender], msg.sender);
}
```

### Don't: Forget access permissions
```solidity
// ❌ WRONG - Missing allowThis
euint8 vote = TFHE.asEuint8(encryptedInput);
```

### Do: Grant proper access
```solidity
// ✅ CORRECT - Grant access to contract
euint8 vote = TFHE.asEuint8(encryptedInput);
TFHE.allowThis(vote);
TFHE.allow(vote, msg.sender);
```

## Understanding Handles

### What are Handles?
Handles are references to encrypted values in FHEVM:
- Unique identifier for encrypted data
- Enable efficient storage and computation
- Used in re-encryption for users

### Handle Lifecycle
1. **Creation**: Generated during encryption
2. **Storage**: Stored in contract state
3. **Computation**: Used in FHE operations
4. **Access**: Re-encrypted for authorized users
5. **Decryption**: Converted to plaintext when appropriate

### Example
```solidity
// Store handle
euint8 encryptedVote = TFHE.asEuint8(input);
encryptedVotes[proposalId][voter] = encryptedVote;

// Use in computation
euint32 totalYes = TFHE.add(totalYes, encryptedVote);

// Re-encrypt for user
bytes memory reencrypted = TFHE.reencrypt(encryptedVote, voter);
```

## Deployment

### Sepolia Testnet
- Network: Sepolia Testnet
- Chain ID: 11155111
- Contract: `0x7c04dD380e26B56899493ec7A654EdEf108A2414`
- Explorer: https://sepolia.etherscan.io

### Deployment Steps
1. Fund deployer wallet with Sepolia ETH
2. Configure `.env` with private key and RPC URL
3. Run deployment script: `npx hardhat run scripts/deploy.ts --network sepolia`
4. Verify contract on Etherscan: `npx hardhat verify --network sepolia CONTRACT_ADDRESS`
5. Update frontend `.env` with deployed address
6. Deploy frontend to hosting platform

## Video Demonstration

A comprehensive video demonstration is included showing:
- Contract deployment and initialization
- Company setup and role assignment
- Proposal creation workflow
- Confidential voting process
- Vote encryption and submission
- Result decryption and display
- User interface walkthrough

## Future Enhancements

- Delegation voting support
- Multi-signature proposal approval
- Vote weight by share amount
- Proposal amendment system
- Voting analytics dashboard
- Mobile application
- DAO treasury integration
- Quadratic voting option

## Contributing

This project is submitted for the Zama FHEVM Bounty December 2025. Contributions and feedback are welcome.

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm)
- [fhevmjs Client Library](https://github.com/zama-ai/fhevmjs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Vue.js Documentation](https://vuejs.org/)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Zama team for FHEVM technology and bounty program
- OpenZeppelin for security libraries
- Vue.js and Hardhat communities

## Support

For questions and issues:
- GitHub Issues: [Project Repository]
- FHEVM Discord: [Zama Discord]
- Documentation: [Project Docs]

---

**Built with ❤️ for the Zama FHEVM Bounty December 2025**

*Demonstrating the power of Fully Homomorphic Encryption in corporate governance*
