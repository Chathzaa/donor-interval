# Three-minute presentation script

Replace bracketed details, read it aloud once, then adjust the wording to your speaking speed. Aim for **under 3:00**, including wallet confirmations and slide changes.

| Time | Screen | Say / do |
| --- | --- | --- |
| 0:00–0:25 | Title and problem | “We are Group [XX]. Our project is DonorInterval. When blood banks have separate records, one bank may not see a recent donation recorded by another. Our prototype gives participating banks one auditable timeline.” |
| 0:25–0:50 | Architecture diagram | “A bank wallet submits a fictional donor code hash to an Ethereum smart contract. The contract uses the block timestamp and enforces a conservative 124-day demonstration interval. Names, blood groups, and screening details stay off-chain.” |
| 0:50–1:55 | App demo | Show Account #0 recording one fictional donor, then Account #1 checking the same code and attempting another record. “The first transaction succeeds and appears in the history. The second bank reads that history; its early submission is rejected by the contract, even though it is an authorized bank.” |
| 1:55–2:22 | Tests | Show `8 passing`. “Our tests cover first and later records, cross-bank blocking, unauthorized wallets, revoked bank access, and invalid codes. The later-record test advances a local blockchain clock.” |
| 2:22–2:48 | Privacy and limits | “A code is pseudonymous, not anonymous, because anyone who learns it can link its records. This project checks only recorded timing. Blood-bank staff still perform every medical eligibility check.” |
| 2:48–3:00 | Close | “The result is a working, permissioned, auditable interval registry. Thank you.” |

**Backup if the live demo takes too long:** show the recorded success and failure screenshots while narrating the same sequence. Keep the test output visible for questions.

**Likely questions:**

- **Why 124 days?** NBTS states a four-month minimum. A fixed 124-day interval is a conservative prototype approximation, not clinical policy.
- **Is a hashed donor code private?** No. We use a long random fictional code to resist guessing, but records remain linkable if the code is disclosed.
- **Can a hospital decide eligibility from this result?** No. It is only an interval check on records present in this ledger.
- **What if a bank uses another code for the same person?** The contract cannot detect that. A real system needs trusted off-chain identity matching and governance.
- **Why blockchain?** Participating banks share an append-only audit trail with contract-enforced permissions and interval rules. A centralized database is a reasonable alternative when one trusted operator controls all participants.
