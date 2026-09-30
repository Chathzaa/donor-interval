import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { ethers } from "ethers";

const deployment = JSON.parse(
  await readFile(new URL("../web/src/deployment.json", import.meta.url), "utf8")
);
if (deployment.address === ethers.ZeroAddress) {
  throw new Error("Deploy and sync the contract first.");
}

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const [admin, secondBank, stranger] = await Promise.all([
  provider.getSigner(0),
  provider.getSigner(1),
  provider.getSigner(2)
]);
const abi = [
  "function setBankAuthorization(address,bool)",
  "function recordDonation(bytes32)",
  "function getIntervalStatus(bytes32) view returns(uint256,uint256,uint256,bool)",
  "event DonationRecorded(bytes32 indexed donorKey,address indexed bank,uint256 timestamp,uint256 donationNumber)"
];
const registry = new ethers.Contract(deployment.address, abi, admin);
const code = `DNR-${randomBytes(32).toString("hex").toUpperCase()}`;
const donorKey = ethers.sha256(ethers.toUtf8Bytes(code));

await (await registry.setBankAuthorization(await secondBank.getAddress(), true)).wait();
await (await registry.recordDonation(donorKey)).wait();
const status = await registry.getIntervalStatus(donorKey);
if (status[2] !== 1n || status[3] !== false) {
  throw new Error("First donation status is incorrect");
}

let earlyRejected = false;
try {
  await registry.connect(secondBank).recordDonation(donorKey);
} catch {
  earlyRejected = true;
}
if (!earlyRejected) throw new Error("Early second donation was not rejected");

let unauthorizedRejected = false;
try {
  await registry.connect(stranger).recordDonation(donorKey);
} catch {
  unauthorizedRejected = true;
}
if (!unauthorizedRejected) throw new Error("Unauthorized donation was not rejected");

const events = await registry.queryFilter(registry.filters.DonationRecorded(donorKey));
if (events.length !== 1) throw new Error("Expected one donation event");
console.log("Smoke check passed: first donation recorded, early and unauthorized entries rejected.");
console.log(`Fictional donor code for browser demo: ${code}`);
