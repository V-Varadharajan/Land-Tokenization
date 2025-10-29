import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: ["0x02b5ffe8a17d3474f28237f8fe5149a96f3dae618976fee15d04ff227d3d7250"]
    },
    eclipseTestnet: {
      url: "https://subnets.avax.network/eclipsecha/testnet/rpc",
      chainId: 555666,
      accounts: ["0xda563284613a8f5065eef60e4a9c2688709beb34aa5c0361833bc74ea91a2764"]
    }
  }
};

export default config;
