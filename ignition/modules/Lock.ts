// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LandModule = buildModule("LandModule", (m) => {
  // Deploy LandTokenization contract (constructor has no parameters)
  const landTokenization = m.contract("LandTokenization", [], {});

  return { landTokenization };
});

export default LandModule;
