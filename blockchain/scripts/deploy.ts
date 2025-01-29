import { ethers } from "hardhat";

async function main() {
   const [deployer] = await ethers.getSigners();
   console.log("Deploying contracts with the account:", deployer.address);

   const LegalDocumentManagement = await ethers.getContractFactory(
      "LegalDocumentManagement"
   );
   const contract = await LegalDocumentManagement.deploy();
   await contract.deployed();

   console.log("Contract deployed to:", contract.address);
}

main()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error);
      process.exit(1);
   });
