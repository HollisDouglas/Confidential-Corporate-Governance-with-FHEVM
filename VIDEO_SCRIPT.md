# Video Demonstration Script
## Confidential Corporate Governance with FHEVM

**Duration**: 60 seconds
**Target Audience**: Zama FHEVM Bounty Judges & Developers

---

## Scene Breakdown

### Scene 1: Introduction (0:00-0:10)
**Visual**:
- Show project logo and title screen
- Fade to dashboard overview

**Action**:
- Display "Confidential Corporate Governance with FHEVM"
- Show key statistics on dashboard
- Highlight active proposals

**Narration**: See dialogue file

---

### Scene 2: Architecture Overview (0:10-0:20)
**Visual**:
- Split screen showing smart contract code and frontend
- Highlight FHEVM imports and encrypted types
- Show code snippet of encrypted vote storage

**Action**:
- Display `euint8` type definition
- Show `TFHE.allow()` function call
- Highlight access control modifiers

**Code Display**:
```solidity
mapping(uint256 => mapping(address => euint8)) private encryptedVotes;
```

**Narration**: See dialogue file

---

### Scene 3: Creating a Proposal (0:20-0:30)
**Visual**:
- Screen recording of frontend interface
- Board member clicking "Create Proposal"
- Form filling with proposal details

**Action**:
1. Click "Create Proposal" button
2. Select proposal type: "Financial Decision"
3. Enter title: "Q4 Budget Allocation"
4. Set duration: "7 days"
5. Click "Submit" - MetaMask popup appears
6. Confirm transaction
7. Show success notification

**Narration**: See dialogue file

---

### Scene 4: Confidential Voting (0:30-0:45)
**Visual**:
- Switch to shareholder account
- Open active proposal
- Vote modal with confidential option

**Action**:
1. Navigate to "Proposals" page
2. Click on "Q4 Budget Allocation" proposal
3. Click "Vote" button
4. Select vote choice: "Yes"
5. Toggle "Confidential Vote" switch ON
6. Show encryption happening (loading spinner)
7. Display encrypted input creation in console (optional)
8. Submit vote transaction
9. Show transaction confirmation
10. Display "Vote Cast Successfully" message

**Code Overlay** (brief):
```typescript
const { handles, inputProof } = await instance
  .createEncryptedInput(contractAddress, userAddress)
  .add8(voteChoice)
  .encrypt();
```

**Narration**: See dialogue file

---

### Scene 5: Results & Decryption (0:45-0:55)
**Visual**:
- Fast-forward time indicator
- Proposal status changes to "Completed"
- Click "View Results"
- Show decrypted vote tallies

**Action**:
1. Display "Voting Period Ended" badge
2. Click "Finalize Results" button
3. Show decryption animation
4. Display results:
   - Yes: 150 votes
   - No: 45 votes
   - Abstain: 5 votes
   - Status: APPROVED
5. Show approval checkmark animation

**Code Overlay** (brief):
```solidity
uint32 yesVotes = TFHE.decrypt(encryptedYesCount);
uint32 noVotes = TFHE.decrypt(encryptedNoCount);
```

**Narration**: See dialogue file

---

### Scene 6: Closing & Call to Action (0:55-1:00)
**Visual**:
- Show key features summary slide:
  - ✓ Confidential Voting with FHE
  - ✓ Access Control (Board/Shareholders)
  - ✓ Public Decryption
  - ✓ User Vote Verification
  - ✓ Input Proof Security

- Display project information:
  - GitHub repository link
  - Documentation link
  - "Built for Zama FHEVM Bounty December 2025"

**Action**:
- Fade through feature checkmarks
- Show final title card
- Display Zama logo

**Narration**: See dialogue file

---

## Technical Requirements

### Recording Settings
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 fps
- Format: MP4 (H.264 codec)
- Audio: Clear narration, 44.1kHz, stereo

### Screen Recording Tools
- OBS Studio (recommended)
- Loom
- ScreenFlow
- Camtasia

### Editing Recommendations
- Add subtle background music (non-distracting)
- Use smooth transitions between scenes
- Highlight cursor movements for clarity
- Add text overlays for key concepts
- Include brief code snippets where relevant
- Use zoom effects for important UI elements

### Visual Enhancements
- Highlight boxes around active UI elements
- Animated arrows pointing to key features
- Smooth fade transitions between scenes
- Code syntax highlighting for overlays
- Loading animations during encryption
- Success/confirmation animations

---

## Pre-Recording Checklist

- [ ] Smart contract deployed on Sepolia testnet
- [ ] Frontend application running locally
- [ ] MetaMask connected and funded with test ETH
- [ ] Multiple test accounts ready (board member, shareholders)
- [ ] Test proposal created and ready to vote
- [ ] Browser zoom set to 100%
- [ ] Close unnecessary browser tabs
- [ ] Clear browser notifications
- [ ] Test audio levels
- [ ] Prepare screen recording software
- [ ] Have narration script ready
- [ ] Disable desktop notifications
- [ ] Clean up desktop background

---

## Post-Production Checklist

- [ ] Trim any dead time or loading delays
- [ ] Add background music (subtle, non-intrusive)
- [ ] Insert text overlays for key features
- [ ] Add code snippet overlays where helpful
- [ ] Include smooth transitions
- [ ] Add intro and outro screens
- [ ] Verify audio clarity
- [ ] Check video length (should be ~60 seconds)
- [ ] Export in required format (MP4, 1080p)
- [ ] Test playback on different devices
- [ ] Add captions/subtitles (optional but recommended)
- [ ] Final quality check

---

## Alternative Shorter Version (if needed)

### 30-Second Version
**Focus on core flow**:
- 0-5s: Intro
- 5-12s: Show encrypted vote submission
- 12-20s: Show decryption and results
- 20-25s: Display key FHEVM features
- 25-30s: Outro with links

### 45-Second Version
**Focus on demonstration**:
- 0-8s: Intro and architecture
- 8-20s: Create proposal
- 20-35s: Confidential voting process
- 35-40s: Results decryption
- 40-45s: Features and outro

---

## Common Issues & Solutions

### Issue: Transaction Taking Too Long
**Solution**: Pre-confirm transactions before recording, or edit out wait time

### Issue: MetaMask Popup Blocking View
**Solution**: Position MetaMask popup to the side, or show it intentionally

### Issue: Loading States Too Long
**Solution**: Use local development network for faster confirmations, or speed up video slightly

### Issue: UI Elements Too Small
**Solution**: Zoom in on specific areas, or use larger browser zoom temporarily

### Issue: Code Snippets Unreadable
**Solution**: Use larger font in code editor, or add text overlays in post-production

---

## Key Messages to Convey

1. **Privacy**: Votes remain confidential during voting period
2. **Security**: Input proofs ensure vote validity
3. **Transparency**: Results publicly verifiable after decryption
4. **Usability**: Clean, intuitive user interface
5. **FHEVM Integration**: Proper use of TFHE library and encrypted types
6. **Access Control**: Role-based permissions working correctly
7. **Real-world Application**: Practical corporate governance use case

---

## Success Criteria

The video successfully demonstrates:
- ✓ Complete end-to-end workflow
- ✓ Proper FHEVM integration
- ✓ Client-side encryption
- ✓ Server-side decryption
- ✓ Access control mechanisms
- ✓ User-friendly interface
- ✓ Real blockchain interaction
- ✓ Professional presentation quality

---

**Note**: This script is designed to be flexible. Adjust timing as needed while maintaining the core demonstration flow. The dialogue narration is in a separate file for easy recording and modification.
