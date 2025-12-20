// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, externalEuint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential Corporate Governance Contract
/// @notice Demonstrates privacy-preserving corporate voting using Fully Homomorphic Encryption (FHE)
/// @dev This contract showcases multiple FHEVM concepts:
///      - Encrypted vote storage (euint8 for vote choices)
///      - Access control with FHE.allow and FHE.allowThis
///      - Public decryption after voting deadlines
///      - User decryption for vote verification
///      - Input proof verification for encrypted submissions
///      - Role-based permissions (board members, shareholders, owner)
contract ConfidentialGovernance is ZamaEthereumConfig {

    // ============ Enums ============

    /// @notice Types of governance proposals
    enum ProposalType {
        BoardDecision,   // 0: Board-level decisions
        Financial,       // 1: Financial matters
        Strategic,       // 2: Strategic planning
        Operational      // 3: Operational changes
    }

    /// @notice Vote choices (stored as encrypted euint8)
    /// @dev 0 = Not Voted, 1 = Yes, 2 = No, 3 = Abstain
    enum VoteChoice {
        NotVoted,
        Yes,
        No,
        Abstain
    }

    // ============ Structs ============

    /// @notice Shareholder information
    struct Shareholder {
        string name;
        uint256 shares;
        bool isRegistered;
    }

    /// @notice Governance proposal structure
    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        string title;
        string description;
        address creator;
        uint256 deadline;
        bool finalized;
        bool executed;
    }

    /// @notice Vote tally results (decrypted after finalization)
    struct VoteTally {
        uint32 yesVotes;
        uint32 noVotes;
        uint32 abstainVotes;
        bool passed;
    }

    // ============ State Variables ============

    /// @notice Company information
    string public companyName;
    uint256 public totalShares;
    address public owner;

    /// @notice Board member management
    mapping(address => bool) public boardMembers;
    uint256 public boardMemberCount;

    /// @notice Shareholder management
    mapping(address => Shareholder) public shareholders;
    address[] public shareholderAddresses;
    uint256 public shareholderCount;

    /// @notice Proposal storage
    Proposal[] public proposals;
    uint256 public proposalCount;

    /// @notice Encrypted votes: proposalId => voter => encrypted vote choice (euint8)
    /// @dev Vote choices: 0=NotVoted, 1=Yes, 2=No, 3=Abstain
    mapping(uint256 => mapping(address => euint8)) private encryptedVotes;

    /// @notice Tracking who has voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /// @notice Vote tallies (available after finalization)
    mapping(uint256 => VoteTally) public results;

    /// @notice Encrypted vote counters during voting period
    mapping(uint256 => euint32) private encryptedYesCount;
    mapping(uint256 => euint32) private encryptedNoCount;
    mapping(uint256 => euint32) private encryptedAbstainCount;

    // ============ Events ============

    event CompanyInitialized(string name, uint256 totalShares);
    event BoardMemberAdded(address indexed member);
    event BoardMemberRemoved(address indexed member);
    event ShareholderAdded(address indexed shareholder, string name, uint256 shares);
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, string title, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event ProposalFinalized(uint256 indexed proposalId, uint32 yesVotes, uint32 noVotes, uint32 abstainVotes, bool passed);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyBoardMember() {
        require(boardMembers[msg.sender], "Only board members can perform this action");
        _;
    }

    modifier onlyShareholder() {
        require(shareholders[msg.sender].isRegistered, "Only registered shareholders can vote");
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    modifier votingActive(uint256 _proposalId) {
        require(block.timestamp < proposals[_proposalId].deadline, "Voting period has ended");
        require(!proposals[_proposalId].finalized, "Proposal already finalized");
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        boardMembers[msg.sender] = true;
        boardMemberCount = 1;
    }

    // ============ Company Initialization ============

    /// @notice Initialize company details
    /// @param _name Company name
    /// @param _totalShares Total number of shares
    function initializeCompany(string memory _name, uint256 _totalShares) external onlyOwner {
        require(bytes(companyName).length == 0, "Company already initialized");
        require(_totalShares > 0, "Total shares must be greater than 0");

        companyName = _name;
        totalShares = _totalShares;

        emit CompanyInitialized(_name, _totalShares);
    }

    // ============ Board Member Management ============

    /// @notice Add a new board member
    /// @param _member Address of the board member to add
    function addBoardMember(address _member) external onlyOwner {
        require(_member != address(0), "Invalid address");
        require(!boardMembers[_member], "Already a board member");

        boardMembers[_member] = true;
        boardMemberCount++;

        emit BoardMemberAdded(_member);
    }

    /// @notice Remove a board member
    /// @param _member Address of the board member to remove
    function removeBoardMember(address _member) external onlyOwner {
        require(boardMembers[_member], "Not a board member");
        require(_member != owner, "Cannot remove owner from board");

        boardMembers[_member] = false;
        boardMemberCount--;

        emit BoardMemberRemoved(_member);
    }

    // ============ Shareholder Management ============

    /// @notice Register a new shareholder
    /// @param _shareholder Address of the shareholder
    /// @param _name Name of the shareholder
    /// @param _shares Number of shares owned
    function addShareholder(
        address _shareholder,
        string memory _name,
        uint256 _shares
    ) external onlyOwner {
        require(_shareholder != address(0), "Invalid address");
        require(!shareholders[_shareholder].isRegistered, "Shareholder already registered");
        require(_shares > 0, "Shares must be greater than 0");

        shareholders[_shareholder] = Shareholder({
            name: _name,
            shares: _shares,
            isRegistered: true
        });

        shareholderAddresses.push(_shareholder);
        shareholderCount++;

        emit ShareholderAdded(_shareholder, _name, _shares);
    }

    // ============ Proposal Management ============

    /// @notice Create a new governance proposal
    /// @param _proposalType Type of the proposal
    /// @param _title Title of the proposal
    /// @param _description Detailed description
    /// @param _votingDays Number of days for voting period
    /// @return proposalId The ID of the created proposal
    function createProposal(
        ProposalType _proposalType,
        string memory _title,
        string memory _description,
        uint256 _votingDays
    ) external onlyBoardMember returns (uint256) {
        require(_votingDays > 0 && _votingDays <= 365, "Invalid voting period");
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 proposalId = proposalCount;
        uint256 deadline = block.timestamp + (_votingDays * 1 days);

        proposals.push(Proposal({
            id: proposalId,
            proposalType: _proposalType,
            title: _title,
            description: _description,
            creator: msg.sender,
            deadline: deadline,
            finalized: false,
            executed: false
        }));

        proposalCount++;

        emit ProposalCreated(proposalId, _proposalType, _title, deadline);

        return proposalId;
    }

    /// @notice Get proposal details
    /// @param _proposalId ID of the proposal
    /// @return Proposal details
    function getProposal(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (Proposal memory)
    {
        return proposals[_proposalId];
    }

    // ============ Confidential Voting ============

    /// @notice Cast an encrypted vote on a proposal
    /// @param _proposalId ID of the proposal
    /// @param inputEuint8 Encrypted vote choice (1=Yes, 2=No, 3=Abstain)
    /// @param inputProof Input proof for the encrypted value
    /// @dev This function demonstrates:
    ///      - Input proof verification
    ///      - FHE.fromExternal to convert external encrypted input
    ///      - FHE.allowThis for contract permission
    ///      - FHE.allow for user permission
    ///      - Encrypted arithmetic operations
    function voteConfidential(
        uint256 _proposalId,
        externalEuint8 inputEuint8,
        bytes calldata inputProof
    )
        external
        onlyShareholder
        proposalExists(_proposalId)
        votingActive(_proposalId)
    {
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        // Convert external encrypted input with proof verification
        euint8 encryptedVoteChoice = FHE.fromExternal(inputEuint8, inputProof);

        // Grant access permissions
        // IMPORTANT: Both allowThis and allow are required
        FHE.allowThis(encryptedVoteChoice);
        FHE.allow(encryptedVoteChoice, msg.sender);

        // Store the encrypted vote
        encryptedVotes[_proposalId][msg.sender] = encryptedVoteChoice;
        hasVoted[_proposalId][msg.sender] = true;

        // Update encrypted vote counters
        // Create encrypted constants for comparison
        euint8 encryptedOne = FHE.asEuint8(1);
        euint8 encryptedTwo = FHE.asEuint8(2);
        euint8 encryptedThree = FHE.asEuint8(3);

        // Check if vote is "Yes" (1)
        ebool isYes = FHE.eq(encryptedVoteChoice, encryptedOne);
        euint32 yesIncrement = FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0));
        encryptedYesCount[_proposalId] = FHE.add(encryptedYesCount[_proposalId], yesIncrement);
        FHE.allowThis(encryptedYesCount[_proposalId]);

        // Check if vote is "No" (2)
        ebool isNo = FHE.eq(encryptedVoteChoice, encryptedTwo);
        euint32 noIncrement = FHE.select(isNo, FHE.asEuint32(1), FHE.asEuint32(0));
        encryptedNoCount[_proposalId] = FHE.add(encryptedNoCount[_proposalId], noIncrement);
        FHE.allowThis(encryptedNoCount[_proposalId]);

        // Check if vote is "Abstain" (3)
        ebool isAbstain = FHE.eq(encryptedVoteChoice, encryptedThree);
        euint32 abstainIncrement = FHE.select(isAbstain, FHE.asEuint32(1), FHE.asEuint32(0));
        encryptedAbstainCount[_proposalId] = FHE.add(encryptedAbstainCount[_proposalId], abstainIncrement);
        FHE.allowThis(encryptedAbstainCount[_proposalId]);

        emit VoteCast(_proposalId, msg.sender);
    }

    // ============ User Decryption ============

    /// @notice Get your own encrypted vote for verification
    /// @param _proposalId ID of the proposal
    /// @return Re-encrypted vote for the caller
    /// @dev This demonstrates user decryption pattern:
    ///      - FHE.seal re-encrypts the value for a specific user
    ///      - Only the user can decrypt their own vote
    ///      - Other votes remain confidential
    function getMyVote(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (bytes memory)
    {
        require(hasVoted[_proposalId][msg.sender], "You have not voted on this proposal");

        // Re-encrypt the vote for the user
        // This is safe because it only reveals the caller's own vote
        return FHE.seal(encryptedVotes[_proposalId][msg.sender]);
    }

    // ============ Public Decryption ============

    /// @notice Finalize a proposal and decrypt the vote results
    /// @param _proposalId ID of the proposal to finalize
    /// @dev This demonstrates public decryption:
    ///      - Only callable after voting deadline
    ///      - FHE.decrypt converts encrypted values to plaintext
    ///      - Results become publicly visible
    ///      - Votes are tallied and proposal outcome is determined
    function finalizeProposal(uint256 _proposalId)
        external
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.deadline, "Voting period still active");
        require(!proposal.finalized, "Proposal already finalized");

        // Decrypt the vote counts (PUBLIC DECRYPTION)
        uint32 yesVotes = FHE.decrypt(encryptedYesCount[_proposalId]);
        uint32 noVotes = FHE.decrypt(encryptedNoCount[_proposalId]);
        uint32 abstainVotes = FHE.decrypt(encryptedAbstainCount[_proposalId]);

        // Determine if proposal passed (simple majority)
        bool passed = yesVotes > noVotes;

        // Store results
        results[_proposalId] = VoteTally({
            yesVotes: yesVotes,
            noVotes: noVotes,
            abstainVotes: abstainVotes,
            passed: passed
        });

        proposal.finalized = true;

        emit ProposalFinalized(_proposalId, yesVotes, noVotes, abstainVotes, passed);
    }

    /// @notice Get the decrypted results of a finalized proposal
    /// @param _proposalId ID of the proposal
    /// @return VoteTally structure with vote counts and outcome
    function getResults(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (VoteTally memory)
    {
        require(proposals[_proposalId].finalized, "Proposal not yet finalized");
        return results[_proposalId];
    }

    // ============ Utility Functions ============

    /// @notice Check if an address is a board member
    function isBoardMember(address _address) external view returns (bool) {
        return boardMembers[_address];
    }

    /// @notice Check if an address is a shareholder
    function isShareholder(address _address) external view returns (bool) {
        return shareholders[_address].isRegistered;
    }

    /// @notice Get shareholder details
    function getShareholder(address _address) external view returns (Shareholder memory) {
        require(shareholders[_address].isRegistered, "Not a registered shareholder");
        return shareholders[_address];
    }

    /// @notice Get all shareholder addresses
    function getAllShareholders() external view returns (address[] memory) {
        return shareholderAddresses;
    }

    /// @notice Get total number of proposals
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    /// @notice Check if a user has voted on a proposal
    function hasUserVoted(uint256 _proposalId, address _user)
        external
        view
        proposalExists(_proposalId)
        returns (bool)
    {
        return hasVoted[_proposalId][_user];
    }
}
