import { expect } from "chai";
import { BigNumber } from "ethers";
import { Staking } from "../typechain/Staking.d";
import { Token } from "../typechain/Token.d";
import { ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseUnits } from "ethers/lib/utils";

describe("Staking", () => {
  let staking: Staking;
  let pilot: Token;
  let ONE = parseUnits('1','18');
  let [
    wallet,
    alice,
    bob,
    carol,
    other,
    user1,
    user2,
    user3,
    user4,
  ] = waffle.provider.getWallets();
  beforeEach(async () => {
    const tokenContract = await ethers.getContractFactory("Token");
    const stakingContract = await ethers.getContractFactory("Staking");
    pilot = (await tokenContract.deploy()) as Token;
    staking = (await stakingContract.deploy(pilot.address)) as Staking;
    pilot.connect(alice).mint(alice.address, ONE.mul(100));
    pilot.connect(bob).mint(bob.address, ONE.mul(100));
    pilot.connect(carol).mint(carol.address, ONE.mul(100));
  });
  describe("#enter", () => {
    it("should not allow to enter if not enough approved", async () => {
      const reason:string = "ERC20: insufficient allowance";
      const hundredEthers = parseUnits('100',18);
      //enter with no approval with 100tokens
      const enterWithoutApprove = staking.connect(alice).enter(hundredEthers); 
      await expect( enterWithoutApprove ).to.be.revertedWith(reason);

      //approve 50 tokens
      await pilot.connect(alice).approve(staking.address, hundredEthers.div(2));  //50 approval
      
      //enter 100 tokens
      let enterWithHalfApproval =  staking.connect(alice).enter(hundredEthers) 
      await expect(enterWithHalfApproval).to.be.revertedWith(reason);
      
      //approve 100 tokens
      await pilot.connect(alice).approve(staking.address, hundredEthers);
      
      //enter 100 tokens
      await staking.connect(alice).enter(hundredEthers);
      
      //check balance of pilot of staking contract
      const balance = await pilot.balanceOf(staking.address);
      expect(balance).to.be.equal(hundredEthers);
    });
  });
  describe("#leave", () => {
    it('should not allow to withdraw more than deposited amount', async() => {
      const hundredEthers: BigNumber = parseUnits('100',18);
      const reason: string = "ERC20: burn amount exceeds balance"
      //approve 100 tokens
      await pilot.connect(alice).approve(staking.address, hundredEthers);

      //enter 100 tokens
      await staking.connect(alice).enter(hundredEthers);

      //leave with 200 tokens
      const burnResponse = staking.connect(alice).leave(hundredEthers.mul(2));  //200 withdraw
      await expect(burnResponse).to.be.revertedWith(reason);
    })
  })
  describe("#enter & #leave", () => {
    it('should work with more than one participant', async () => {
      //approve 100 from alice and bob
      const hundredEthers: BigNumber = parseUnits('100',18);
      const twentyEthers: BigNumber = parseUnits('20',18);
      const tenEthers: BigNumber = parseUnits('10',18);
      await pilot.connect(alice).approve(staking.address, hundredEthers);
      await pilot.connect(bob).approve(staking.address, hundredEthers);
      
      //enter with 20 and 10 from alice and bob respectively
      await staking.connect(alice).enter(twentyEthers); //20 from alice
      await staking.connect(bob).enter(tenEthers); //10 from bob
      
      //check balance of pilot of staking contract and balance of alice and bob of xPILOT
      const stakingInitialBalance = await pilot.balanceOf(staking.address);
      expect(stakingInitialBalance).to.be.equal(parseUnits('30',18)); 
      
      let aliceBalance = await staking.xPilotBalance(alice.address);
      let bobBalance = await staking.xPilotBalance(bob.address);
      expect(aliceBalance).to.be.equal(twentyEthers);
      expect(bobBalance).to.be.equal(tenEthers);

      //staking contract gets funded with 20 tokens from external source of carol
      await pilot.connect(carol).transfer(staking.address, twentyEthers);

      //alice deposits ten more tokens. she should receive 10*30/50 = 6 shares
      await staking.connect(alice).enter(tenEthers);
      aliceBalance = await staking.xPilotBalance(alice.address);
      bobBalance = await staking.xPilotBalance(bob.address);
      expect(aliceBalance).to.be.equal(parseUnits('26',18)); //20 earlier and 6 new
      expect(bobBalance).to.be.equal(tenEthers);

      //bob withdraws 5 share out of 10
      await staking.connect(bob).leave(tenEthers.div(2)); //withdrawing 5 shares
      aliceBalance = await staking.xPilotBalance(alice.address);
      bobBalance = await staking.xPilotBalance(bob.address);
      expect(aliceBalance).to.be.equal(parseUnits('26',18)); //26 = 20 earlier + 6 new
      expect(bobBalance).to.be.equal(tenEthers.div(2)); //5 remains out of 10

      const stakingFinalBalance = await pilot.balanceOf(staking.address);
      const aliceFinalBalance = await pilot.balanceOf(alice.address);
      const bobFinalBalance = await pilot.balanceOf(bob.address);
      expect(stakingFinalBalance.toString()).to.be.equal("51666666666666666667");
      expect(aliceFinalBalance).to.be.equal(parseUnits('70', 18));
      expect(bobFinalBalance.toString()).to.be.equal("98333333333333333333"); // 100-10-5+8.33+5 = 98.33
    })
  })
});
