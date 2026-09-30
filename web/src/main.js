import { ethers } from "ethers";
import deployment from "./deployment.json";
import "./style.css";

const RPC_URL = "http://127.0.0.1:8545";
const ABI = [
  "function administrator() view returns (address)",
  "function authorizedBanks(address) view returns (bool)",
  "function setBankAuthorization(address bank, bool authorized)",
  "function recordDonation(bytes32 donorKey)",
  "function getIntervalStatus(bytes32 donorKey) view returns (uint256 lastDonationAt, uint256 nextAllowedAt, uint256 donationCount, bool intervalClear)",
  "event DonationRecorded(bytes32 indexed donorKey, address indexed bank, uint256 timestamp, uint256 donationNumber)"
];

const $ = (id) => document.getElementById(id);
const readProvider = new ethers.JsonRpcProvider(RPC_URL);
let readContract;
let browserProvider;
let walletAddress;
let toastTimeout;

function short(address) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function formatDate(seconds) {
  return new Date(Number(seconds) * 1000).toLocaleString();
}

function showToast(message, kind = "success") {
  const element = $("toast");
  element.textContent = message;
  element.className = `toast visible ${kind}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { element.className = "toast"; }, 6000);
}

function explainError(error) {
  const message = `${error?.shortMessage || error?.reason || error?.message || error}`;
  if (message.includes("user rejected") || message.includes("User rejected")) return "Wallet request cancelled.";
  if (message.includes("BankOnly")) return "This wallet is not an authorized blood bank.";
  if (message.includes("AdministratorOnly")) return "Only the administrator can change bank access.";
  if (message.includes("IntervalNotMet")) return "A donation is already recorded inside the waiting interval.";
  if (message.includes("BankAuthorizationUnchanged")) return "This bank already has the selected access state.";
  if (message.includes("could not coalesce error")) return "Transaction failed. Check the wallet account and local network.";
  return message.length > 180 ? `${message.slice(0, 180)}…` : message;
}

async function requireContract() {
  if (!readContract) throw new Error("Start the local chain, deploy the contract, then run npm run sync.");
  return readContract;
}

async function requireSigner() {
  await requireContract();
  if (!window.ethereum?.isMetaMask) throw new Error("Install and unlock the MetaMask browser extension, then refresh this page.");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const targetChainId = `0x${Number(deployment.chainId).toString(16)}`;
  if ((await window.ethereum.request({ method: "eth_chainId" })).toLowerCase() !== targetChainId) {
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainId }] });
    } catch (error) {
      const code = error?.code ?? error?.data?.originalError?.code;
      if (code !== 4902) throw error;
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: targetChainId, chainName: "Hardhat Local", rpcUrls: [RPC_URL], nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 } }]
      });
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainId }] });
    }
  }
  browserProvider = new ethers.BrowserProvider(window.ethereum);
  const chain = await browserProvider.getNetwork();
  if (chain.chainId !== BigInt(deployment.chainId)) {
    throw new Error(`Switch MetaMask to the local Hardhat network (chain ID ${deployment.chainId}).`);
  }
  const signer = await browserProvider.getSigner();
  walletAddress = await signer.getAddress();
  $("connect").textContent = short(walletAddress);
  const [administrator, authorized] = await Promise.all([
    readContract.administrator(), readContract.authorizedBanks(walletAddress)
  ]);
  const role = walletAddress.toLowerCase() === administrator.toLowerCase()
    ? "Administrator / Bank A" : authorized ? "Authorized bank" : "Not an authorized bank";
  $("wallet-state").textContent = `${role}: ${walletAddress}`;
  return new ethers.Contract(deployment.address, ABI, signer);
}

function donorKey() {
  const code = $("donor-code").value.trim().toUpperCase();
  if (!/^DNR-[0-9A-F]{64}$/.test(code)) {
    throw new Error("Generate a 256-bit fictional donor code first.");
  }
  return ethers.sha256(ethers.toUtf8Bytes(code));
}

function setResult(kind, title, description) {
  const icon = { neutral: "◎", clear: "✓", wait: "!" }[kind];
  $("result").className = `result ${kind}`;
  $("result").innerHTML = `<span class="result-icon">${icon}</span><div><strong></strong><p></p></div>`;
  $("result").querySelector("strong").textContent = title;
  $("result").querySelector("p").textContent = description;
}

async function refreshHistory(key) {
  const contract = await requireContract();
  const events = await contract.queryFilter(contract.filters.DonationRecorded(key), 0, "latest");
  const container = $("history");
  container.replaceChildren();
  if (events.length === 0) return;
  const heading = document.createElement("h3");
  heading.textContent = "Recorded history";
  container.append(heading);
  for (const event of [...events].reverse()) {
    const row = document.createElement("div");
    row.className = "history-row";
    const number = document.createElement("strong");
    number.textContent = `Donation #${event.args.donationNumber}`;
    const detail = document.createElement("span");
    detail.textContent = `${formatDate(event.args.timestamp)} · Bank ${short(event.args.bank)}`;
    const tx = document.createElement("code");
    tx.textContent = `Tx ${short(event.transactionHash)}`;
    row.append(number, detail, tx);
    container.append(row);
  }
}

async function check() {
  const contract = await requireContract();
  const key = donorKey();
  const status = await contract.getIntervalStatus(key);
  if (status.donationCount === 0n) {
    setResult("clear", "No donation recorded", "This registry has no history for this fictional code. Clinical screening is still required.");
  } else if (status.intervalClear) {
    setResult("clear", "Recorded interval clear", `Last record: ${formatDate(status.lastDonationAt)}. This is not a medical eligibility decision.`);
  } else {
    setResult("wait", "Waiting interval active", `Last record: ${formatDate(status.lastDonationAt)}. Next permitted record in this demo: ${formatDate(status.nextAllowedAt)}.`);
  }
  await refreshHistory(key);
}

async function sendTransaction(action) {
  const contract = await requireSigner();
  const tx = await action(contract);
  showToast("Transaction sent. Waiting for confirmation…");
  await tx.wait();
  showToast(`Confirmed: ${short(tx.hash)}`);
  return tx;
}

async function initialize() {
  $("contract-address").textContent = `Contract: ${deployment.address}`;
  if (deployment.address === ethers.ZeroAddress) {
    $("chain-state").textContent = "Contract not deployed";
    return;
  }
  try {
    const chain = await readProvider.getNetwork();
    if (chain.chainId !== BigInt(deployment.chainId)) throw new Error("Wrong local chain ID");
    const code = await readProvider.getCode(deployment.address);
    if (code === "0x") throw new Error("Contract not present. Redeploy and sync after restarting Hardhat.");
    readContract = new ethers.Contract(deployment.address, ABI, readProvider);
    $("bank-address").value = await (await readProvider.getSigner(1)).getAddress();
    $("chain-state").textContent = `Local chain ${deployment.chainId}: ready`;
    $("chain-state").classList.add("ready");
  } catch (error) {
    $("chain-state").textContent = "Local chain: unavailable";
    showToast(explainError(error), "error");
  }
}

function onClick(id, action) {
  $(id).addEventListener("click", async () => {
    const button = $(id);
    button.disabled = true;
    try { await action(); } catch (error) { showToast(explainError(error), "error"); }
    finally { button.disabled = false; }
  });
}

onClick("connect", async () => { await requireSigner(); showToast("MetaMask connected to Hardhat Local."); });
onClick("generate", async () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  $("donor-code").value = `DNR-${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  setResult("neutral", "Fictional code generated", "Keep this code to check the same demo donor later.");
  $("history").replaceChildren();
});
onClick("copy", async () => {
  donorKey();
  await navigator.clipboard.writeText($("donor-code").value.trim());
  showToast("Fictional code copied.");
});
onClick("check", check);
onClick("record", async () => {
  const key = donorKey();
  await sendTransaction((contract) => contract.recordDonation(key));
  await check();
});
for (const [buttonId, authorized] of [["authorize", true], ["revoke", false]]) {
  onClick(buttonId, async () => {
    const bank = $("bank-address").value.trim();
    if (!ethers.isAddress(bank)) throw new Error("Enter a valid 0x bank wallet address.");
    await sendTransaction((contract) => contract.setBankAuthorization(bank, authorized));
  });
}
if (window.ethereum?.on) {
  const resetWallet = () => {
    browserProvider = undefined;
    walletAddress = undefined;
    $("connect").textContent = "Connect MetaMask";
    $("wallet-state").textContent = "MetaMask changed. Click Connect MetaMask to refresh the wallet role.";
  };
  window.ethereum.on("accountsChanged", resetWallet);
  window.ethereum.on("chainChanged", resetWallet);
}
initialize();
