# DonorInterval

DonorInterval is a local Ethereum application for recording the time of a blood donation against a pseudonymous donor code. An authorized bank can submit a record. The contract rejects another record for the same code until a fixed interval has elapsed. The browser app shows the current interval status and transaction history.

This is a project prototype using fictional records. Its output is **not** a medical eligibility decision.

## Design

| Component | Responsibility |
| --- | --- |
| `DonorInterval.sol` | Stores the latest timestamp and count for each donor key; enforces authorization and the interval. |
| Hardhat local node | Provides the development blockchain and test accounts. |
| MetaMask | Signs bank transactions and selects the local chain. |
| Browser app | Hashes a random donor code, reads contract status and events, and submits transactions. |

The contract uses a fixed **124-day** interval as a conservative approximation of the four-month minimum stated by the Sri Lankan National Blood Transfusion Service. Calendar-month rules and clinical screening are outside this contract. Only a 32-byte code hash is submitted to the chain; names, blood groups, and screening details are not stored there.

### Access rules

- The deployer is the administrator and the first authorized bank.
- Only the administrator can authorize or revoke another bank wallet.
- Only authorized bank wallets can record donations.
- Anyone with a donor code can read the status and its public event history.

## Run locally

Requirements: Node.js 22.13 or newer, Chrome or Edge, and the MetaMask browser extension.

```powershell
npm.cmd install
npm.cmd run build:contracts
```

Run the following in separate terminals from this directory:

| Terminal | Commands |
| --- | --- |
| A | `npm.cmd run chain` |
| B | `npm.cmd run deploy` then `npm.cmd run sync` |
| C | `npm.cmd run dev` |

Open `http://127.0.0.1:5173/`. Import Hardhat development accounts #0 and #1 into MetaMask, select account #0, and click **Connect MetaMask**. The app requests the local network (RPC `http://127.0.0.1:8545`, chain ID `31337`). Account #0 is the administrator; account #1 must be authorized by account #0 before it can write.

The local blockchain is reset when terminal A stops. Run `deploy` and `sync` again after restarting it. Development private keys must not be used with real funds.

## Tests

```powershell
npm.cmd test
npm.cmd run build:web
```

The eight contract tests cover the first record, a second bank attempting an early record, a later accepted record after simulated time, separate donor histories, administrator permissions, revoked or unauthorized wallets, and invalid donor keys. `npm.cmd run smoke` is an optional check against a running local node; it writes a fictional record and authorizes account #1.

## Limits

- The application can check only records submitted to this contract. It cannot find donations outside the participating banks or detect two different codes used for one person.
- A hash of a random code is pseudonymous rather than anonymous. If someone obtains the code, they can link its public records.
- A real deployment would need trusted identity matching, bank governance, privacy controls, and clinical screening.

## References

- [National Blood Transfusion Service of Sri Lanka: donor guidance](https://nbts.health.gov.lk/donate-blood/)
- [ICO: pseudonymisation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/)
- [Hardhat documentation](https://hardhat.org/docs/getting-started)
