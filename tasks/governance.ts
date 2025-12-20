import { task } from "hardhat/config";

/**
 * @title Governance Interaction Tasks
 * @notice Helper tasks for interacting with the Confidential Governance contract
 */

task("governance:info", "Display governance contract information")
  .addParam("contract", "The governance contract address")
  .setAction(async (taskArgs, hre) => {
    const { contract } = taskArgs;
    const governanceContract = await hre.ethers.getContractAt("ConfidentialGovernance", contract);

    console.log("========================================");
    console.log("Governance Contract Information");
    console.log("========================================");
    console.log(`Contract Address: ${contract}`);
    console.log(`Company Name: ${await governanceContract.companyName()}`);
    console.log(`Total Shares: ${await governanceContract.totalShares()}`);
    console.log(`Owner: ${await governanceContract.owner()}`);
    console.log(`Board Member Count: ${await governanceContract.boardMemberCount()}`);
    console.log(`Shareholder Count: ${await governanceContract.shareholderCount()}`);
    console.log(`Proposal Count: ${await governanceContract.proposalCount()}`);
    console.log("========================================");
  });

task("governance:init", "Initialize a governance contract")
  .addParam("contract", "The governance contract address")
  .addParam("name", "Company name")
  .addParam("shares", "Total shares")
  .setAction(async (taskArgs, hre) => {
    const { contract, name, shares } = taskArgs;
    const [deployer] = await hre.ethers.getSigners();
    const governanceContract = await hre.ethers.getContractAt("ConfidentialGovernance", contract);

    console.log(`Initializing company: ${name} with ${shares} total shares...`);
    const tx = await governanceContract.connect(deployer).initializeCompany(name, shares);
    await tx.wait();

    console.log("✅ Company initialized successfully!");
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("governance:add-shareholder", "Add a new shareholder")
  .addParam("contract", "The governance contract address")
  .addParam("address", "Shareholder address")
  .addParam("name", "Shareholder name")
  .addParam("shares", "Number of shares")
  .setAction(async (taskArgs, hre) => {
    const { contract, address, name, shares } = taskArgs;
    const [deployer] = await hre.ethers.getSigners();
    const governanceContract = await hre.ethers.getContractAt("ConfidentialGovernance", contract);

    console.log(`Adding shareholder: ${name} (${address}) with ${shares} shares...`);
    const tx = await governanceContract.connect(deployer).addShareholder(address, name, shares);
    await tx.wait();

    console.log("✅ Shareholder added successfully!");
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("governance:create-proposal", "Create a new proposal")
  .addParam("contract", "The governance contract address")
  .addParam("type", "Proposal type (0-3)")
  .addParam("title", "Proposal title")
  .addParam("description", "Proposal description")
  .addParam("days", "Voting period in days")
  .setAction(async (taskArgs, hre) => {
    const { contract, type, title, description, days } = taskArgs;
    const [deployer] = await hre.ethers.getSigners();
    const governanceContract = await hre.ethers.getContractAt("ConfidentialGovernance", contract);

    console.log(`Creating proposal: ${title}...`);
    const tx = await governanceContract.connect(deployer).createProposal(type, title, description, days);
    const receipt = await tx.wait();

    console.log("✅ Proposal created successfully!");
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("governance:list-proposals", "List all proposals")
  .addParam("contract", "The governance contract address")
  .setAction(async (taskArgs, hre) => {
    const { contract } = taskArgs;
    const governanceContract = await hre.ethers.getContractAt("ConfidentialGovernance", contract);

    const proposalCount = await governanceContract.proposalCount();
    console.log(`\nTotal Proposals: ${proposalCount}\n`);

    for (let i = 0; i < proposalCount; i++) {
      const proposal = await governanceContract.getProposal(i);
      console.log(`Proposal #${i}:`);
      console.log(`  Title: ${proposal.title}`);
      console.log(`  Type: ${proposal.proposalType}`);
      console.log(`  Creator: ${proposal.creator}`);
      console.log(`  Deadline: ${new Date(Number(proposal.deadline) * 1000).toLocaleString()}`);
      console.log(`  Finalized: ${proposal.finalized}`);
      console.log("");
    }
  });
