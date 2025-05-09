const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityVerification", function () {
  let IdentityVerification;
  let identityVerification;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    identityVerification = await IdentityVerification.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await identityVerification.admin()).to.equal(owner.address);
    });
  });

  describe("Identity Registration", function () {
    const validIdentity = {
      name: "John Doe",
      dateOfBirth: 946684800, // 2000-01-01
      physicalAddress: "123 Main St",
      nationality: "USA",
      idNumber: "1234567890123456" // 16 characters
    };

    it("Should allow a user to register their identity", async function () {
      await expect(identityVerification.connect(user).registerIdentity(
        validIdentity.name,
        validIdentity.dateOfBirth,
        validIdentity.physicalAddress,
        validIdentity.nationality,
        validIdentity.idNumber
      )).to.emit(identityVerification, "IdentityRegistered")
        .withArgs(user.address, validIdentity.name);

      const identity = await identityVerification.getIdentity(user.address);
      expect(identity.name).to.equal(validIdentity.name);
      expect(identity.isVerified).to.equal(false);
    });

    it("Should not allow duplicate registration", async function () {
      await identityVerification.connect(user).registerIdentity(
        validIdentity.name,
        validIdentity.dateOfBirth,
        validIdentity.physicalAddress,
        validIdentity.nationality,
        validIdentity.idNumber
      );

      await expect(identityVerification.connect(user).registerIdentity(
        validIdentity.name,
        validIdentity.dateOfBirth,
        validIdentity.physicalAddress,
        validIdentity.nationality,
        validIdentity.idNumber
      )).to.be.revertedWith("Identity already registered");
    });

    it("Should validate ID number length", async function () {
      const invalidIdentity = { ...validIdentity, idNumber: "123" };
      await expect(identityVerification.connect(user).registerIdentity(
        invalidIdentity.name,
        invalidIdentity.dateOfBirth,
        invalidIdentity.physicalAddress,
        invalidIdentity.nationality,
        invalidIdentity.idNumber
      )).to.be.revertedWith("ID number must be exactly 16 characters");
    });
  });

  describe("Identity Verification", function () {
    beforeEach(async function () {
      await identityVerification.connect(user).registerIdentity(
        "John Doe",
        946684800,
        "123 Main St",
        "USA",
        "1234567890123456"
      );
    });

    it("Should allow admin to verify identity", async function () {
      await expect(identityVerification.connect(owner).verifyIdentity(user.address))
        .to.emit(identityVerification, "IdentityVerified")
        .withArgs(user.address, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      const identity = await identityVerification.getIdentity(user.address);
      expect(identity.isVerified).to.equal(true);
    });

    it("Should not allow non-admin to verify identity", async function () {
      await expect(identityVerification.connect(user).verifyIdentity(user.address))
        .to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow verifying unregistered identity", async function () {
      const [, , unregisteredUser] = await ethers.getSigners();
      await expect(identityVerification.verifyIdentity(unregisteredUser.address))
        .to.be.revertedWith("Identity not registered");
    });

    it("Should not allow verifying already verified identity", async function () {
      await identityVerification.verifyIdentity(user.address);
      await expect(identityVerification.verifyIdentity(user.address))
        .to.be.revertedWith("Identity already verified");
    });
  });
});