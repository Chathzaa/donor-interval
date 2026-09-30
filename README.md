# DonorInterval — start-to-submission guide

This folder contains a complete EC8204 teaching prototype: an Ethereum smart contract, a browser app, eight contract tests, a deployment script, and a presentation script. **Use fictional donor codes only.** The project checks the timing of *recorded* donations; it does not assess whether a person may safely donate blood.

## 0. Do the course administration first

1. Open the [project selection sheet](https://docs.google.com/spreadsheets/d/1eML8xuLvQTjudrwoultCFngpVC9YGHXA3NtJC8vkzDo/edit?usp=sharing). Search for blood donation projects before entering your row. The list shared with this project did not show an identical one.
2. Enter the project name, all three group member IDs, domain, and application below. Leave the video link blank only until the video has been uploaded.
3. Check ELMS and ask the lecturer about the PDF's invalid date **31/09/2026**. September has 30 days. Prepare to submit on 30 September if ELMS permits.

| Sheet column | Paste this, then personalize it |
| --- | --- |
| Project name | DonorInterval — Blockchain-Based Blood Donation Interval Registry |
| Group members | Your three registration numbers |
| Domain | Healthcare / Donation Record Integrity |
| Application | Authorized blood banks record fictional donations against pseudonymous donor codes on a shared Ethereum ledger. The contract rejects a second recorded donation inside a conservative demonstration waiting interval, and anyone holding the code can inspect its timestamped history. Real identity, blood group, and medical screening information remain off-chain. The result is an interval check, not a medical eligibility decision. |
| 3 min Presentation video link | Add the accessible recording link after uploading it. |

The [National Blood Transfusion Service of Sri Lanka](https://nbts.health.gov.lk/donate-blood/) lists a minimum **four months** between donations and other screening criteria. The contract uses **124 days** as a conservative *fixed-day demonstration rule*. Do not describe this as the complete clinical rule. Hashed or pseudonymous records are still linkable when a code is known; see the [ICO guidance on pseudonymisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/).

## 1. Install the prerequisites

- A computer with Node.js **22.13.0 or later**, Chrome or Edge, and the [official MetaMask browser extension](https://support.metamask.io/start/getting-started-with-metamask/). After installation, click the browser's puzzle-piece icon and pin MetaMask so its fox icon stays visible.
- Internet access the first time `npm install` and the Solidity compiler run.
- PowerPoint or another editor that can export the presentation format ELMS accepts.

In Windows PowerShell, use `npm.cmd` instead of `npm` if PowerShell blocks `npm.ps1`. Open PowerShell **in this `donor-interval` folder**. Check:

```powershell
node --version
npm.cmd --version
npm.cmd install
```

Create a fresh MetaMask wallet for this class demo if you do not already have one. Keep its recovery phrase private and offline. The Hardhat accounts below are separate, public development keys; do not use them with real funds or other networks.

Do not use any real donor data, production wallet, real cryptocurrency, or real clinical decision with this prototype.

## 2. Verify the code

```powershell
npm.cmd run build:contracts
npm.cmd test
npm.cmd run build:web
```

Expected: the Solidity contract compiles, **8 tests pass**, and Vite creates `web/dist`. The tests cover a first record, shared interval enforcement across banks, a later valid record after simulated time, separate donors, role restrictions, and invalid inputs.

## 3. Start the blockchain, deploy, and start the app

Keep **three PowerShell windows** open in this folder:

**Window A — local blockchain:**

```powershell
npm.cmd run chain
```

Leave it running. It prints development accounts and private keys. These are well-known *test keys*. They must never be used with real funds.

**Window B — deploy and configure the web app:**

```powershell
npm.cmd run deploy
npm.cmd run sync
```

`deploy` deliberately resets Ignition's **local deployment state** and deploys a fresh contract. `sync` copies its address to `web/src/deployment.json`. Do **not** run `smoke` before the filmed demo: that optional script already authorizes Account #1 and adds a donation, so it changes the clean starting state.

**Window C — browser app:**

```powershell
npm.cmd run dev
```

Open the local URL Vite prints, usually `http://127.0.0.1:5173/`. The header should say **Local chain 31337: ready**. If it does not, see Troubleshooting below.

## 4. Set up MetaMask with the Hardhat demo accounts

Use the **same Chrome or Edge browser** for MetaMask and the app. If the fox icon is hidden, click the browser's **puzzle-piece Extensions icon**, then pin MetaMask. If MetaMask is absent, install it from [MetaMask's official instructions](https://support.metamask.io/start/getting-started-with-metamask/), then refresh the app.

1. In **Window A**, find **Account #0** and its **Private Key**. Copy *only that development key*.
2. In MetaMask, click the account selector at the top, then **Add wallet > Import an account**. Paste Account #0's private key and import it. Rename it **Bank A - Admin** if MetaMask offers a rename option.
3. Repeat with Window A's **Account #1** private key. Name it **Bank B**. Account #2 is optional for the unauthorized-wallet demonstration.
4. Select **Bank A - Admin** in MetaMask. In the app, click **Connect MetaMask**. Approve the connection. The app will ask MetaMask to add or switch to **Hardhat Local**, chain ID **31337**. Confirm that the RPC shown is `http://127.0.0.1:8545` and approve.
5. The app's right-hand panel should now show **Administrator / Bank A** and its wallet address. If it does not, select the imported Account #0 in MetaMask and click **Connect MetaMask** again.

If automatic network setup fails, add a [custom network manually](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/): name **Hardhat Local**, RPC URL `http://127.0.0.1:8545`, chain ID `31337`, currency symbol `ETH`. Select it, then click **Connect MetaMask** in the app.

If you close and restart Window A, its blockchain history is gone. Rerun **deploy** and **sync** in Window B, then refresh the browser. The same standard Hardhat development keys can stay imported in MetaMask.

## 5. Run the complete demonstration

Use only the invented codes generated by the app.

1. In MetaMask select **Bank A - Admin (Account #0)** and click **Connect MetaMask** in the app.
2. Click **Generate** and **Copy code**. Save this code temporarily for the demo.
3. Click **Check interval**: the registry says no donation is recorded.
4. Click **Record donation** and **Confirm** in MetaMask. Check again: the page shows **Waiting interval active**, the recording bank, and a transaction hash.
5. With Account #0 still selected, click **Authorize** under **Manage a bank** and **Confirm** in MetaMask. Account #1's address is already filled in. If you ran `smoke` earlier, this account is already authorized; skip this step or redeploy for a clean demonstration.
6. In MetaMask select **Bank B (Account #1)**. Click **Connect MetaMask** in the app again if needed. Keep the *same* fictional donor code in the field. Check interval: it sees Account #0's entry. Click **Record donation**: the contract rejects the early second record. MetaMask may show the rejection before offering a Confirm button, because it estimates that the transaction will fail.
7. Optional: select imported **Account #2**, connect it, generate a **new** fictional code, and attempt to record it. The contract rejects it because Account #2 has no bank authorization.
8. In a terminal, show `npm.cmd test`. One test advances the local clock to the allowed time and proves a later record succeeds. You do not need to wait 124 real days.

For a cleaner recording, rehearse the MetaMask account changes once, save the generated fictional code in a temporary text editor, and keep the test-output terminal ready. Do not show the terminal's development private keys in the published video.

## 6. Capture evidence

Save these screenshots or a short screen recording:

- The app before any record.
- The successful first record and its event history.
- The early second-record rejection from Account #1.
- `8 passing` from the automated tests.
- The contract deployment address or Hardhat transaction output.

The source code is in `contracts/`, `test/`, and `web/`. `node_modules/`, `.npm-cache/`, `web/dist/`, `cache/`, and `artifacts/` are generated files; exclude them if sharing a source ZIP.

## 7. Prepare the three-minute presentation

Use [`PRESENTATION_SCRIPT.md`](PRESENTATION_SCRIPT.md) as the narration and timing. A slide deck template is in `presentation/`. Replace every placeholder with your group number, three member names, actual screenshots, and the tested contract address. Rehearse until it fits **three minutes**. Each member should understand the contract, website, tests, and privacy limitation even if one person operates the demo.

The project guide asks for a filename resembling `GP_XX_Task_name.ppt`. Use your actual group number. If you edit the supplied `.pptx` template, export or save as `.ppt` if ELMS requires the guide's exact extension; verify it opens afterward.

## 8. Record, publish, and submit

1. Record a **three-minute** presentation video with clear speech and readable screen text. Show the working app and the rejected second attempt. Show only fictional donor codes; keep every private key and recovery phrase off screen.
2. Upload it to a video or online-storage service. Set link access so the lecturer can view it. Test the link in a private/incognito window without your login.
3. Paste the working link into your row's **3 min Presentation video link** column.
4. Have **one group member** upload **one final presentation** to ELMS. Check the uploaded file opens and save the submission confirmation. The PDF says the last presentation submitted before the deadline counts if multiple are submitted, so avoid duplicate uploads.
5. Keep a copy of the source folder, video, slides, screenshots, and test output available for questions.

## Troubleshooting

- **`npm.ps1 cannot be loaded`**: use `npm.cmd` as shown above.
- **`Local chain: unavailable`**: start Window A, confirm port `8545`, then refresh.
- **`Contract not deployed` / `Contract not present`**: run `npm.cmd run deploy`, then `npm.cmd run sync`, then refresh.
- **No fox icon**: use Chrome/Edge Extensions (puzzle-piece) to pin MetaMask, or install it from the official site.
- **Wrong network**: click **Connect MetaMask** to switch, or select Hardhat Local, chain ID `31337`, in MetaMask.
- **Wrong wallet role**: switch to the imported Account #0 and reconnect; the right-hand panel should say **Administrator / Bank A**.
- **MetaMask says insufficient funds**: check that you imported a Hardhat development account and selected Hardhat Local. These accounts have local test ETH.
- **BankOnly**: connect Account #0 or authorize Account #1 from Account #0.
- **IntervalNotMet**: this is the expected result when attempting a second record too soon.
- **Browser shows old data after restarting the node**: redeploy and sync; a local chain does not persist when its process stops.

## What to say if asked why blockchain

The prototype shows multiple participating banks writing to one contract with public, timestamped records and permission checks. No one bank can silently edit a past transaction. A real deployment would need a trusted way to assign one consistent donor code across banks, formal bank governance, privacy controls, and clinical screening. If a single trusted national operator already controls every bank, a conventional database may be simpler; explain the shared-audit benefit and this tradeoff honestly.

## Sources

- EC8204 project guide (provided separately by the module lecturer)
- [MetaMask: install the extension](https://support.metamask.io/start/getting-started-with-metamask/)
- [MetaMask: import a development account](https://support.metamask.io/start/use-an-existing-wallet/)
- [MetaMask: add a custom network](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/)
- [Sri Lanka National Blood Transfusion Service: donor guidance](https://nbts.health.gov.lk/donate-blood/)
- [ICO: pseudonymisation and hash risks](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/)
- [Hardhat 3 setup](https://hardhat.org/docs/getting-started)
- [Hardhat local node and deployment](https://hardhat.org/docs/tutorial/deploying)
- [ethers v6 browser-wallet usage](https://docs.ethers.org/v6/getting-started/)
