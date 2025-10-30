import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: ["0x6cade16ba7c47d6ec9dcdb45212893cb83dfad11f0aa5c6612a0be56cc874452"]
    },
    eclipseTestnet: {
      url: "https://subnets.avax.network/eclipsecha/testnet/rpc",
      chainId: 555666,
      accounts: ["da563284613a8f5065eef60e4a9c2688709beb34aa5c0361833bc74ea91a2764"]
    }
  }
};

export default config;
