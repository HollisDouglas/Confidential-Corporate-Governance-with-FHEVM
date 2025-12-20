import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ConfidentialGovernance, ConfidentialGovernance__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

/**
 * @title Confidential Corporate Governance Test Suite
 * @notice Comprehensive tests demonstrating FHEVM concepts:
 *         - Encrypted vote storage and tallying
 *         - Access control with FHE.allow and FHE.allowThis
 *         - Public decryption after voting deadlines
 *         - User decryption for vote verification
 *         - Input proof verification
 *         - Role-based permissions
 */

type Signers = {
  deployer: HardhatEthersSigner;
  boardMember1: HardhatEthersSigner;
  shareholder1: HardhatEthersSigner;
  shareholder2: HardhatEthersSigner;
  shareholder3: HardhatEthersSigner;
  nonShareholder: HardhatEthersSigner;
};

// Vote choice enum
enum VoteChoice {
  NotVoted = 0,
  Yes = 1,
  No = 2,
  Abstain = 3,
}

// Proposal type enum
enum ProposalType {
  BoardDecision = 0,
  Financial = 1,
  Strategic = 2,
  Operational = 3,
}

async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "ConfidentialGovernance"
  )) as ConfidentialGovernance__factory;
  const governanceContract = (await factory.deploy()) as ConfidentialGovernance;
  const governanceContractAddress = await governanceContract.getAddress();

  return { governanceContract, governanceContractAddress };
}

describe("ConfidentialGovernance", function () {
  let signers: Signers;
  let governanceContract: ConfidentialGovernance;
  let governanceContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      boardMember1: ethSigners[1],
      shareholder1: ethSigners[2],
      shareholder2: ethSigners[3],
      shareholder3: ethSigners[4],
      nonShareholder: ethSigners[5],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ governanceContract, governanceContractAddress } = await deployFixture());

    // Initialize company
    await governanceContract.initializeCompany("TechCorp Inc.", 10000);

    // Add board member
    await governanceContract.addBoardMember(signers.boardMember1.address);

    // Add shareholders
    await governanceContract.addShareholder(signers.shareholder1.address, "Alice Johnson", 3000);
    await governanceContract.addShareholder(signers.shareholder2.address, "Bob Smith", 2500);
    await governanceContract.addShareholder(signers.shareholder3.address, "Carol White", 1500);
  });

  describe("Deployment & Initialization", function () {
    it("should set deployer as owner and board member", async function () {
      expect(await governanceContract.owner()).to.equal(signers.deployer.address);
      expect(await governanceContract.isBoardMember(signers.deployer.address)).to.be.true;
    });

    it("should initialize company correctly", async function () {
      expect(await governanceContract.companyName()).to.equal("TechCorp Inc.");
      expect(await governanceContract.totalShares()).to.equal(10000);
    });

    it("should not allow re-initialization", async function () {
      await expect(governanceContract.initializeCompany("Another Corp", 5000)).to.be.revertedWith(
        "Company already initialized"
      );
    });
  });

  describe("Board Member Management", function () {
    it("should add a new board member", async function () {
      const newBoardMember = signers.shareholder1.address;
      await governanceContract.addBoardMember(newBoardMember);

      expect(await governanceContract.isBoardMember(newBoardMember)).to.be.true;
      expect(await governanceContract.boardMemberCount()).to.equal(3); // deployer + boardMember1 + new
    });

    it("should prevent non-owner from adding board members", async function () {
      await expect(
        governanceContract.connect(signers.boardMember1).addBoardMember(signers.shareholder2.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("should remove a board member", async function () {
      await governanceContract.removeBoardMember(signers.boardMember1.address);

      expect(await governanceContract.isBoardMember(signers.boardMember1.address)).to.be.false;
      expect(await governanceContract.boardMemberCount()).to.equal(1);
    });

    it("should not allow removing the owner from board", async function () {
      await expect(governanceContract.removeBoardMember(signers.deployer.address)).to.be.revertedWith(
        "Cannot remove owner from board"
      );
    });
  });

  describe("Shareholder Management", function () {
    it("should register shareholders correctly", async function () {
      const shareholder = await governanceContract.getShareholder(signers.shareholder1.address);

      expect(shareholder.name).to.equal("Alice Johnson");
      expect(shareholder.shares).to.equal(3000);
      expect(shareholder.isRegistered).to.be.true;
    });

    it("should prevent duplicate shareholder registration", async function () {
      await expect(
        governanceContract.addShareholder(signers.shareholder1.address, "Duplicate", 100)
      ).to.be.revertedWith("Shareholder already registered");
    });

    it("should get all shareholder addresses", async function () {
      const shareholders = await governanceContract.getAllShareholders();

      expect(shareholders.length).to.equal(3);
      expect(shareholders).to.include(signers.shareholder1.address);
      expect(shareholders).to.include(signers.shareholder2.address);
      expect(shareholders).to.include(signers.shareholder3.address);
    });
  });

  describe("Proposal Creation", function () {
    it("should create a proposal by board member", async function () {
      const tx = await governanceContract
        .connect(signers.boardMember1)
        .createProposal(ProposalType.Financial, "Q4 Budget Approval", "Approve budget for Q4", 7);

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return governanceContract.interface.parseLog(log as any)?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const proposal = await governanceContract.getProposal(0);
      expect(proposal.title).to.equal("Q4 Budget Approval");
      expect(proposal.proposalType).to.equal(ProposalType.Financial);
      expect(proposal.creator).to.equal(signers.boardMember1.address);
    });

    it("should prevent non-board members from creating proposals", async function () {
      await expect(
        governanceContract
          .connect(signers.shareholder1)
          .createProposal(ProposalType.BoardDecision, "Unauthorized Proposal", "Should fail", 7)
      ).to.be.revertedWith("Only board members can perform this action");
    });

    it("should increment proposal count", async function () {
      await governanceContract
        .connect(signers.deployer)
        .createProposal(ProposalType.Strategic, "Expansion Plan", "Expand to new markets", 10);

      expect(await governanceContract.getProposalCount()).to.equal(1);
    });
  });

  describe("Confidential Voting", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Create a proposal
      const tx = await governanceContract
        .connect(signers.boardMember1)
        .createProposal(ProposalType.Financial, "Test Proposal", "Voting test", 7);

      await tx.wait();
      proposalId = 0;
    });

    it("✅ should allow shareholder to cast encrypted vote (Yes)", async function () {
      // Encrypt vote choice: 1 = Yes
      const encryptedVote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      // Cast vote
      const tx = await governanceContract
        .connect(signers.shareholder1)
        .voteConfidential(proposalId, encryptedVote.handles[0], encryptedVote.inputProof);

      await tx.wait();

      // Verify vote was recorded
      expect(await governanceContract.hasUserVoted(proposalId, signers.shareholder1.address)).to.be.true;
    });

    it("✅ should allow multiple shareholders to vote", async function () {
      // Shareholder 1 votes Yes
      const vote1 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder1)
        .voteConfidential(proposalId, vote1.handles[0], vote1.inputProof);

      // Shareholder 2 votes No
      const vote2 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder2.address)
        .add8(VoteChoice.No)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder2)
        .voteConfidential(proposalId, vote2.handles[0], vote2.inputProof);

      // Shareholder 3 votes Abstain
      const vote3 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder3.address)
        .add8(VoteChoice.Abstain)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder3)
        .voteConfidential(proposalId, vote3.handles[0], vote3.inputProof);

      // Verify all votes recorded
      expect(await governanceContract.hasUserVoted(proposalId, signers.shareholder1.address)).to.be.true;
      expect(await governanceContract.hasUserVoted(proposalId, signers.shareholder2.address)).to.be.true;
      expect(await governanceContract.hasUserVoted(proposalId, signers.shareholder3.address)).to.be.true;
    });

    it("❌ should prevent double voting", async function () {
      const encryptedVote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      // First vote
      await governanceContract
        .connect(signers.shareholder1)
        .voteConfidential(proposalId, encryptedVote.handles[0], encryptedVote.inputProof);

      // Second vote should fail
      const encryptedVote2 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.No)
        .encrypt();

      await expect(
        governanceContract
          .connect(signers.shareholder1)
          .voteConfidential(proposalId, encryptedVote2.handles[0], encryptedVote2.inputProof)
      ).to.be.revertedWith("Already voted on this proposal");
    });

    it("❌ should prevent non-shareholders from voting", async function () {
      const encryptedVote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.nonShareholder.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await expect(
        governanceContract
          .connect(signers.nonShareholder)
          .voteConfidential(proposalId, encryptedVote.handles[0], encryptedVote.inputProof)
      ).to.be.revertedWith("Only registered shareholders can vote");
    });
  });

  describe("User Decryption (Vote Verification)", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Create a proposal
      await governanceContract
        .connect(signers.boardMember1)
        .createProposal(ProposalType.Operational, "Vote Verification Test", "Testing vote retrieval", 7);

      proposalId = 0;
    });

    it("✅ should allow voter to retrieve their own encrypted vote", async function () {
      // Cast vote
      const encryptedVote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder1)
        .voteConfidential(proposalId, encryptedVote.handles[0], encryptedVote.inputProof);

      // Retrieve own vote
      const myVote = await governanceContract.connect(signers.shareholder1).getMyVote(proposalId);

      expect(myVote).to.not.be.undefined;
      expect(myVote.length).to.be.greaterThan(0);
    });

    it("❌ should prevent retrieving vote if not voted", async function () {
      await expect(
        governanceContract.connect(signers.shareholder1).getMyVote(proposalId)
      ).to.be.revertedWith("You have not voted on this proposal");
    });
  });

  describe("Public Decryption (Finalization)", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Create a proposal with very short duration for testing
      await governanceContract
        .connect(signers.deployer)
        .createProposal(ProposalType.BoardDecision, "Finalization Test", "Testing result decryption", 1);

      proposalId = 0;
    });

    it("✅ should finalize proposal and decrypt results", async function () {
      // Cast votes
      const vote1 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder1)
        .voteConfidential(proposalId, vote1.handles[0], vote1.inputProof);

      const vote2 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder2.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder2)
        .voteConfidential(proposalId, vote2.handles[0], vote2.inputProof);

      const vote3 = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder3.address)
        .add8(VoteChoice.No)
        .encrypt();

      await governanceContract
        .connect(signers.shareholder3)
        .voteConfidential(proposalId, vote3.handles[0], vote3.inputProof);

      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
      await ethers.provider.send("evm_mine", []);

      // Finalize proposal
      await governanceContract.finalizeProposal(proposalId);

      // Get results
      const results = await governanceContract.getResults(proposalId);

      expect(results.yesVotes).to.equal(2);
      expect(results.noVotes).to.equal(1);
      expect(results.abstainVotes).to.equal(0);
      expect(results.passed).to.be.true; // Yes votes (2) > No votes (1)
    });

    it("❌ should prevent finalization before deadline", async function () {
      await expect(governanceContract.finalizeProposal(proposalId)).to.be.revertedWith(
        "Voting period still active"
      );
    });

    it("❌ should prevent voting after finalization", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Finalize
      await governanceContract.finalizeProposal(proposalId);

      // Try to vote
      const vote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.shareholder1.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await expect(
        governanceContract
          .connect(signers.shareholder1)
          .voteConfidential(proposalId, vote.handles[0], vote.inputProof)
      ).to.be.revertedWith("Proposal already finalized");
    });
  });

  describe("Access Control Patterns", function () {
    it("should enforce owner-only functions", async function () {
      await expect(
        governanceContract.connect(signers.shareholder1).addBoardMember(signers.nonShareholder.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("should enforce board-member-only functions", async function () {
      await expect(
        governanceContract
          .connect(signers.shareholder1)
          .createProposal(ProposalType.Financial, "Unauthorized", "Should fail", 7)
      ).to.be.revertedWith("Only board members can perform this action");
    });

    it("should enforce shareholder-only functions", async function () {
      // Create proposal first
      await governanceContract
        .connect(signers.deployer)
        .createProposal(ProposalType.BoardDecision, "Access Control Test", "Testing access", 7);

      const vote = await fhevm
        .createEncryptedInput(governanceContractAddress, signers.nonShareholder.address)
        .add8(VoteChoice.Yes)
        .encrypt();

      await expect(
        governanceContract
          .connect(signers.nonShareholder)
          .voteConfidential(0, vote.handles[0], vote.inputProof)
      ).to.be.revertedWith("Only registered shareholders can vote");
    });
  });

  describe("Edge Cases & Comprehensive Scenarios", function () {
    it("should handle proposal with no votes", async function () {
      await governanceContract
        .connect(signers.deployer)
        .createProposal(ProposalType.Strategic, "No Vote Test", "Nobody votes", 1);

      const proposalId = 0;

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Finalize
      await governanceContract.finalizeProposal(proposalId);

      const results = await governanceContract.getResults(proposalId);

      expect(results.yesVotes).to.equal(0);
      expect(results.noVotes).to.equal(0);
      expect(results.abstainVotes).to.equal(0);
      expect(results.passed).to.be.false; // 0 > 0 is false
    });

    it("should handle all abstain votes", async function () {
      await governanceContract
        .connect(signers.deployer)
        .createProposal(ProposalType.Operational, "Abstain Test", "All abstain", 1);

      const proposalId = 0;

      // All shareholders abstain
      for (const shareholder of [signers.shareholder1, signers.shareholder2, signers.shareholder3]) {
        const vote = await fhevm
          .createEncryptedInput(governanceContractAddress, shareholder.address)
          .add8(VoteChoice.Abstain)
          .encrypt();

        await governanceContract.connect(shareholder).voteConfidential(proposalId, vote.handles[0], vote.inputProof);
      }

      // Fast forward and finalize
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await governanceContract.finalizeProposal(proposalId);

      const results = await governanceContract.getResults(proposalId);

      expect(results.yesVotes).to.equal(0);
      expect(results.noVotes).to.equal(0);
      expect(results.abstainVotes).to.equal(3);
      expect(results.passed).to.be.false;
    });
  });
});
