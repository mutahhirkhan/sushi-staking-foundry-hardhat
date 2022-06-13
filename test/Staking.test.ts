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
});
