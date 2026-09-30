import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DonorIntervalModule", (m) => {
  const registry = m.contract("DonorInterval");
  return { registry };
});
