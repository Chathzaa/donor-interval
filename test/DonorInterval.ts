import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();
const donorKey = ethers.sha256(ethers.toUtf8Bytes("fictional-donor-001"));
const anotherKey = ethers.sha256(ethers.toUtf8Bytes("fictional-donor-002"));

describe("DonorInterval", function () {
  async function setup() {
    const [administrator, secondBank, stranger] = await ethers.getSigners();
    const registry = await ethers.deployContract("DonorInterval");
    await registry.waitForDeployment();
    return { registry, administrator, secondBank, stranger };
  }

  it("authorizes the deploying bank and starts with no donor history", async function () {
    const { registry, administrator } = await setup();
    expect(await registry.administrator()).to.equal(administrator.address);
    expect(await registry.authorizedBanks(administrator.address)).to.equal(true);
    const status = await registry.getIntervalStatus(donorKey);
    expect(status.donationCount).to.equal(0n);
    expect(status.intervalClear).to.equal(true);
  });

  it("records a first donation with the bank and blockchain timestamp", async function () {
    const { registry, administrator } = await setup();
    const tx = await registry.recordDonation(donorKey);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    const status = await registry.getIntervalStatus(donorKey);
    expect(status.lastDonationAt).to.equal(BigInt(block!.timestamp));
    expect(status.donationCount).to.equal(1n);
    expect(status.intervalClear).to.equal(false);
    await expect(tx)
      .to.emit(registry, "DonationRecorded")
      .withArgs(donorKey, administrator.address, BigInt(block!.timestamp), 1n);
  });

  it("rejects a second donation inside the interval, even from another bank", async function () {
    const { registry, secondBank } = await setup();
    await registry.setBankAuthorization(secondBank.address, true);
    await registry.recordDonation(donorKey);
    const status = await registry.getIntervalStatus(donorKey);
    await expect(registry.connect(secondBank).recordDonation(donorKey))
      .to.be.revertedWithCustomError(registry, "IntervalNotMet")
      .withArgs(status.nextAllowedAt);
    expect((await registry.getIntervalStatus(donorKey)).donationCount).to.equal(1n);
  });

  it("accepts another donation once the interval has elapsed", async function () {
    const { registry, secondBank } = await setup();
    await registry.setBankAuthorization(secondBank.address, true);
    await registry.recordDonation(donorKey);
    const status = await registry.getIntervalStatus(donorKey);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(status.nextAllowedAt)]);
    await registry.connect(secondBank).recordDonation(donorKey);
    expect((await registry.getIntervalStatus(donorKey)).donationCount).to.equal(2n);
  });

  it("keeps independent histories for different pseudonymous donors", async function () {
    const { registry } = await setup();
    await registry.recordDonation(donorKey);
    await registry.recordDonation(anotherKey);
    expect((await registry.getIntervalStatus(donorKey)).donationCount).to.equal(1n);
    expect((await registry.getIntervalStatus(anotherKey)).donationCount).to.equal(1n);
  });

  it("rejects writes from unauthorized or revoked banks", async function () {
    const { registry, secondBank, stranger } = await setup();
    await expect(registry.connect(stranger).recordDonation(donorKey))
      .to.be.revertedWithCustomError(registry, "BankOnly");
    await registry.setBankAuthorization(secondBank.address, true);
    await registry.setBankAuthorization(secondBank.address, false);
    await expect(registry.connect(secondBank).recordDonation(donorKey))
      .to.be.revertedWithCustomError(registry, "BankOnly");
  });

  it("allows only the administrator to change bank authorization", async function () {
    const { registry, secondBank, stranger } = await setup();
    await expect(registry.connect(stranger).setBankAuthorization(secondBank.address, true))
      .to.be.revertedWithCustomError(registry, "AdministratorOnly");
    await expect(registry.setBankAuthorization(ethers.ZeroAddress, true))
      .to.be.revertedWithCustomError(registry, "InvalidBank");
    await registry.setBankAuthorization(secondBank.address, true);
    expect(await registry.authorizedBanks(secondBank.address)).to.equal(true);
    await expect(registry.setBankAuthorization(secondBank.address, true))
      .to.be.revertedWithCustomError(registry, "BankAuthorizationUnchanged");
  });

  it("rejects an empty donor key", async function () {
    const { registry } = await setup();
    await expect(registry.recordDonation(ethers.ZeroHash))
      .to.be.revertedWithCustomError(registry, "InvalidDonorKey");
    await expect(registry.getIntervalStatus(ethers.ZeroHash))
      .to.be.revertedWithCustomError(registry, "InvalidDonorKey");
  });
});
