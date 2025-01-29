import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({
   path: "./.env",
});

const config: HardhatUserConfig = {
   solidity: "0.8.28",
   networks: {
      sepolia: {
         url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
         accounts: [process.env.PRIVATE_KEY!],
      },
   },
};

export default config;
