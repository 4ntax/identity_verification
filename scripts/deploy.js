// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const IdentityVerification = await hre.ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    await identityVerification.waitForDeployment();

    const address = await identityVerification.getAddress();
    console.log("IdentityVerification deployed to:", address);
  } catch (error) {
    console.error("Error during deployment:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });