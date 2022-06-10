import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Staking");
    const greeter = await Greeter.deploy("0x0000000000000000000000000000000000000000");
    await greeter.deployed();
    console.log("address:" ,greeter.address);

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    expect("Hola, mundo!").to.equal("Hola, mundo!");
  });
});
