# Video Narration Script
## Confidential Corporate Governance with FHEVM

**Note**: Read naturally and clearly. Pause briefly between sections.

---

## Introduction

Welcome to Confidential Corporate Governance, a privacy-preserving voting platform built with Zama's FHEVM technology. This application enables shareholders to vote on corporate proposals with complete confidentiality using Fully Homomorphic Encryption.

---

## Architecture Overview

Our smart contract leverages FHEVM's encrypted types to store votes securely. Each vote is stored as an encrypted unsigned integer, or euint8, ensuring privacy throughout the voting period. The TFHE library provides access control functions that determine who can decrypt and view encrypted data.

---

## Creating a Proposal

Board members can create governance proposals directly through the interface. Let me demonstrate by creating a new financial proposal for Q4 budget allocation with a seven-day voting window. After submitting the transaction and confirming in MetaMask, the proposal becomes available for shareholder voting.

---

## Confidential Voting

Now let me switch to a shareholder account to cast a confidential vote. After selecting my vote choice, I enable the confidential vote option. This triggers client-side encryption using the FHEVM JavaScript library. The vote is encrypted into a handle with an input proof before being submitted to the blockchain. This ensures that my vote remains private and cannot be viewed by anyone during the voting period.

---

## Results and Decryption

Once the voting deadline passes, anyone can trigger the finalization process. The smart contract uses TFHE.decrypt to convert the encrypted vote tallies into readable results. Now we can see the final outcome: the proposal has been approved with one hundred and fifty yes votes, forty-five no votes, and five abstentions. The decryption only happens after voting closes, ensuring no one could see the results beforehand.

---

## Closing

This project demonstrates five key FHEVM concepts: confidential data storage, access control patterns, public decryption, user verification, and input proof security. Built for the Zama FHEVM Bounty December 2025, this application shows how Fully Homomorphic Encryption can transform corporate governance by enabling truly private and secure voting. Thank you for watching.

---

## Alternative Narration Styles

### Option 1: Technical Focus

Welcome to our FHEVM implementation for confidential corporate governance. This project showcases advanced FHE techniques including encrypted type storage, proper access control using TFHE.allow and TFHE.allowTransient, input proof verification for secure vote submission, and controlled public decryption after voting deadlines.

The architecture demonstrates best practices for FHEVM development. Encrypted votes are stored using euint8 types, client-side encryption generates input proofs for security, role-based access control ensures only authorized users can perform specific actions, and the decryption process converts encrypted tallies only when appropriate.

Watch as we create a proposal through the board member interface, cast an encrypted vote using the fhevmjs library, and finalize results through the TFHE decrypt function. This end-to-end workflow proves that practical privacy-preserving applications are achievable with FHEVM technology.

---

### Option 2: Business Focus

Imagine a corporate governance system where shareholders can vote without fear of coercion or vote buying. That's exactly what we've built with FHEVM technology.

Traditional voting systems reveal results in real-time, which can influence voter behavior and create unfair advantages. Our solution keeps every vote encrypted until the deadline passes. Shareholders cast their votes confidentially, board members cannot see who voted which way, and results only become visible after voting closes.

This isn't just a prototype. The smart contract is deployed on Sepolia testnet, the frontend provides an intuitive user experience, and every feature is production-ready. From proposal creation to vote casting to result finalization, the entire workflow is secure, private, and transparent when it needs to be.

---

### Option 3: Educational Focus

Let me explain how Fully Homomorphic Encryption works in practice. When a shareholder casts a vote, their choice is encrypted on the client side before ever reaching the blockchain. This encryption uses the FHEVM JavaScript library to create what's called an input proof.

The encrypted vote, represented as a handle, is stored in the smart contract. The contract can perform computations on this encrypted data without ever decrypting it. For example, it can count yes votes and no votes while keeping individual choices private.

Only when the voting period ends does the contract decrypt the totals using the TFHE.decrypt function. This demonstrates the power of FHE: computation on encrypted data with controlled decryption. The result is a voting system that's both private during voting and transparent after finalization.

---

### Option 4: Feature Highlight Focus

Five powerful features make this governance platform unique.

First, confidential voting. Every vote is encrypted using FHEVM before submission to the blockchain.

Second, role-based access control. Board members create proposals, shareholders vote, and the owner manages company setup.

Third, input proof verification. Cryptographic proofs ensure that encrypted votes are valid and haven't been tampered with.

Fourth, public decryption. After the deadline, anyone can trigger result decryption for complete transparency.

Fifth, user verification. Shareholders can verify their own encrypted votes without revealing them to others.

Together, these features create a governance system that's private, secure, and trustworthy.

---

### Option 5: Quick Demo Focus

Let me show you this in action.

First, a board member creates a proposal. Next, shareholders receive notification and can vote. Watch as this vote gets encrypted client-side. The transaction includes both the encrypted vote and a proof of validity.

During voting, results remain hidden. No one can see the current tallies. Once the deadline passes, we trigger finalization. The smart contract decrypts the totals. And here are the results: approved.

That's confidential corporate governance powered by FHEVM. Privacy during voting, transparency after finalization.

---

## Pronunciation Guide

- **FHEVM**: F-H-E-V-M (spell out each letter)
- **Zama**: ZAH-mah
- **euint8**: E-U-INT-EIGHT or "encrypted unsigned integer eight"
- **TFHE**: T-F-H-E (spell out) or "TFHE library"
- **Sepolia**: seh-POH-lee-ah
- **Hardhat**: HARD-hat
- **MetaMask**: MET-ah-mask
- **Vue**: VIEW (like the word "view")

---

## Voice Direction Notes

**Tone**: Professional, confident, enthusiastic but not overly excited

**Pace**: Moderate - clear and easy to follow, not rushed

**Emphasis**: Stress key technical terms like "encrypted," "confidential," "decryption," "FHEVM"

**Energy**: Maintain consistent energy throughout, slight increase for closing

**Clarity**: Enunciate technical terms clearly, pause briefly after important concepts

**Style**: Educational but accessible, demonstrating expertise without being condescending

---

## Recording Tips

Start each section with a brief pause to allow for editing flexibility.

Speak clearly and at a consistent volume.

If you make a mistake, pause, then restart the entire sentence.

Record in a quiet environment with minimal background noise.

Consider recording multiple takes of each section for best quality.

Keep water nearby to maintain voice quality.

Take breaks between recording sessions to avoid vocal fatigue.

Review each recording immediately to catch any issues.

---

## Post-Recording Notes

Leave space for technical terms to have visual overlays in the final video.

Allow pauses where code snippets or UI highlights will appear.

The narration should complement, not compete with, on-screen demonstrations.

Some sections may be shortened or extended based on visual pacing.

Background music should be subtle and not interfere with narration.

Consider adding brief pauses where viewers need time to absorb visual information.
