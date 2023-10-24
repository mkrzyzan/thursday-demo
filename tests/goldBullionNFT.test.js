/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GoldBullionNFT", function () {
  it("test initial value", async function () {
    const GoldBullionNFT = await ethers.getContractFactory("GoldBullionNFT");
    const goldBullionNFT = await GoldBullionNFT.deploy();
    await goldBullionNFT.deployed();
    console.log("goldBullionNFT deployed at:" + goldBullionNFT.address);
    //expect((await storage.retrieve()).toNumber()).to.equal(0);
  });
  it("test updating and retrieving updated value", async function () {
    const GoldBullionNFT = await ethers.getContractFactory("GoldBullionNFT");
    const goldBullionNFT = await GoldBullionNFT.deploy();
    await goldBullionNFT.deployed();
    const goldBullionNFT2 = await ethers.getContractAt("GoldBullionNFT", storage.address);
    //const setValue = await goldBullionNFT2.store(56);
    //await setValue.wait();
    //expect((await storage2.retrieve()).toNumber()).to.equal(56);
  });
});
