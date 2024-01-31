/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GoldBullionNFT", function () {
  var sut;
  before(async function() {
    console.log("init...");
    const GoldBullionNFT = await ethers.getContractFactory("GoldBullionNFT");
    const goldBullionNFT = await GoldBullionNFT.deploy();
    await goldBullionNFT.deployed();
    console.log("goldBullionNFT deployed at:" + goldBullionNFT.address);
    sut = goldBullionNFT;
  });

  it("test initial value", async function () {
    //expect((await storage.retrieve()).toNumber()).to.equal(0);
  });
  it("test updating and retrieving updated value", async function () {
    const goldBullionNFT2 = await ethers.getContractAt("GoldBullionNFT", sut.address);
    //const setValue = await goldBullionNFT2.store(56);
    //await setValue.wait();
    //expect((await storage2.retrieve()).toNumber()).to.equal(56);
  });
  it("setting and collecting transaction fees", async function() {
    const [goldKeeper, goldOwner, admin] = await ethers.getSigners();

    await sut.safeMint(123, "", "");
    await sut.setDespositFees(123, 1e12, 0);
    // await sut.connect(goldOwner).payDepositFees(123, {value: 1e12});
    await sut.payDepositFees(123, {value: 1e12});
    await sut.collectDepositFees(123);
  });
  it("solve accept dispute by accepting", async function() {
    const [goldKeeper, goldOwner, admin] = await ethers.getSigners();
    await sut.grantRole(sut.DEFAULT_ADMIN_ROLE(), admin.address);
    // console.log(ethers.utils.id("ala"));

    await sut.safeMint(666, "", "");
    
    // expect(await sut.ownerOf(666)).to.equal(goldOwner.address);

    await sut.setDespositFees(666, 1e12, 0);
    await sut.claimNftBack(666, {value: 1e9});
    await sut.connect(admin).claimBackApproved(666);
    
    expect(await sut.ownerOf(666)).to.equal(goldKeeper.address);
  });
});
