import { readFile, writeFile } from "node:fs/promises";

const deploymentPath = new URL(
  "../ignition/deployments/chain-31337/deployed_addresses.json",
  import.meta.url
);
const outputPath = new URL("../web/src/deployment.json", import.meta.url);
const addresses = JSON.parse(await readFile(deploymentPath, "utf8"));
const address = addresses["DonorIntervalModule#DonorInterval"];
if (!address) throw new Error("DonorInterval deployment address not found");
await writeFile(outputPath, JSON.stringify({ chainId: 31337, address }, null, 2) + "\n");
console.log(`Web app configured for contract ${address}`);
