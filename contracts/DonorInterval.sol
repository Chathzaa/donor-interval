// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DonorInterval
/// @notice Records donation timestamps subject to bank authorization and a fixed interval.
/// @dev Status returned by this contract does not assess medical eligibility.
contract DonorInterval {
    // 124 days is a conservative fixed-day approximation of four calendar months.
    // It is a demonstration rule, not a substitute for current clinical guidance.
    uint256 public constant MIN_INTERVAL = 124 days;

    address public immutable administrator;
    mapping(address => bool) public authorizedBanks;

    struct DonorRecord {
        uint64 lastDonationAt;
        uint32 donationCount;
    }

    mapping(bytes32 => DonorRecord) private donorRecords;

    event BankAuthorizationChanged(address indexed bank, bool authorized);
    event DonationRecorded(
        bytes32 indexed donorKey,
        address indexed bank,
        uint256 timestamp,
        uint256 donationNumber
    );

    error AdministratorOnly();
    error BankOnly();
    error InvalidBank();
    error InvalidDonorKey();
    error BankAuthorizationUnchanged();
    error IntervalNotMet(uint256 nextAllowedAt);

    constructor() {
        administrator = msg.sender;
        authorizedBanks[msg.sender] = true;
        emit BankAuthorizationChanged(msg.sender, true);
    }

    modifier onlyAdministrator() {
        if (msg.sender != administrator) revert AdministratorOnly();
        _;
    }

    modifier onlyBank() {
        if (!authorizedBanks[msg.sender]) revert BankOnly();
        _;
    }

    function setBankAuthorization(address bank, bool authorized)
        external
        onlyAdministrator
    {
        if (bank == address(0)) revert InvalidBank();
        if (authorizedBanks[bank] == authorized) {
            revert BankAuthorizationUnchanged();
        }
        authorizedBanks[bank] = authorized;
        emit BankAuthorizationChanged(bank, authorized);
    }

    function recordDonation(bytes32 donorKey) external onlyBank {
        if (donorKey == bytes32(0)) revert InvalidDonorKey();

        DonorRecord storage record = donorRecords[donorKey];
        if (record.donationCount != 0) {
            uint256 nextAllowedAt = uint256(record.lastDonationAt) + MIN_INTERVAL;
            if (block.timestamp < nextAllowedAt) {
                revert IntervalNotMet(nextAllowedAt);
            }
        }

        record.lastDonationAt = uint64(block.timestamp);
        record.donationCount += 1;
        emit DonationRecorded(
            donorKey,
            msg.sender,
            block.timestamp,
            record.donationCount
        );
    }

    function getIntervalStatus(bytes32 donorKey)
        external
        view
        returns (
            uint256 lastDonationAt,
            uint256 nextAllowedAt,
            uint256 donationCount,
            bool intervalClear
        )
    {
        if (donorKey == bytes32(0)) revert InvalidDonorKey();
        DonorRecord storage record = donorRecords[donorKey];
        lastDonationAt = record.lastDonationAt;
        donationCount = record.donationCount;
        if (donationCount == 0) {
            return (0, 0, 0, true);
        }
        nextAllowedAt = lastDonationAt + MIN_INTERVAL;
        intervalClear = block.timestamp >= nextAllowedAt;
    }
}
