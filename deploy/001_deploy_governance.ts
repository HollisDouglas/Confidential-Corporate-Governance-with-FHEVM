import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * @title Deploy Confidential Governance Contract
 * @notice Deploys the ConfidentialGovernance contract to the specified network
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  log("========================================");
  log("Deploying Confidential Governance Contract...");
  log("========================================");

  const governanceDeployment = await deploy("ConfidentialGovernance", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    waitConfirmations: 1,
  });

  log(`ConfidentialGovernance deployed to: ${governanceDeployment.address}`);
  log(`Transaction hash: ${governanceDeployment.transactionHash}`);
  log("========================================");

  // Return true to indicate deployment was successful
  return true;
};

export default func;
func.tags = ["ConfidentialGovernance", "all"];
