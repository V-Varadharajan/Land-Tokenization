import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LandTokenizationModule = buildModule("LandTokenizationModule", (m) => {
  const landTokenization = m.contract("LandTokenization");

  return { landTokenization };
});

export default LandTokenizationModule;
