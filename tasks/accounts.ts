import { task } from "hardhat/config";

/**
 * @title Accounts Task
 * @notice Display available accounts and their balances
 */
task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    const address = await account.getAddress();
    const balance = await hre.ethers.provider.getBalance(address);
    console.log(`${address} - ${hre.ethers.formatEther(balance)} ETH`);
  }
});
