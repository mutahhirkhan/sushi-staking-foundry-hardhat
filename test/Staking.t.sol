// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Staking.sol";
import "./../src/Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ContractTest is Test {
    Staking public staking;
    Token public pilot;
    address public alice = address(0xABCD);
    address public bob = address(0xDCBA);
    address public carol = address(0xAAAA);
    uint256 public ONE = 1 ether;
    address public xPILOT;

    function setUp() public {
        pilot = new Token();
        staking = new Staking(IERC20(pilot));
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
        vm.label(carol, "Carol");
        vm.label(address(staking), "Staking");
        vm.label(address(pilot), "Token");
    }

    ///@dev this is a helper function to test the staking contract balance
    ///and xPILOT balance in any of the test function. If called independently,
    ///then all values will be zero.
    function stakingBalance() public {
        assertEq(pilot.balanceOf(address(staking)), ONE * 40); //10 pilots staked
        assertEq(staking.totalSupply(), ONE * 40); //xPILOT total supply
    }


    function testTokenName() public {
        assertEq(pilot.name(), "TOKEN");
    }

    function testStakingAddress() public {
        assertEq(
            address(staking),
            address(0x185a4dc360CE69bDCceE33b3784B0282f7961aea)
        );
    }

    function testStakingIsNotZeroAddress() public {
        bool isValid = address(staking) != address(0) ? true : false;
        assertEq(isValid, true);
    }

    function aliceTenDeposit() public {
        vm.startPrank(alice); //msg.sender is alice now
        //mint pilots to alice
        pilot.mint(alice, ONE * 10); //mint 10 pilots
        pilot.approve(address(staking), ONE * 10); //approve 10 pilots
        staking.enter(ONE * 10); // deposit 10 pilotsate
        vm.stopPrank();
    }

    function bobTenDeposit() public {
        vm.startPrank(bob);
        //mint pilots to alice
        pilot.mint(bob, ONE * 10); //mint 10 pilots
        pilot.approve(address(staking), ONE * 10); //approve 10 pilots
        staking.enter(ONE * 10); // deposit 10 pilotsate
        vm.stopPrank();
    }

    function carolTenDeposit() public {
        vm.startPrank(carol);
        //mint pilots to alice
        pilot.mint(carol, ONE * 20); //mint 20 pilots
        pilot.approve(address(staking), ONE * 20); //approve 20 pilots
        staking.enter(ONE * 20); // deposit 10 pilotsate
        vm.stopPrank();
    }

    function carolTwentyClaim() public {
        vm.startPrank(carol);
        staking.leave(ONE * 20); // unstake 20 tokens
        vm.stopPrank();
    }

    function aliceTenClaim() public {
        vm.startPrank(alice);
        staking.leave(ONE * 10); // unstake 20 tokens
        vm.stopPrank();
    }

    function bobTenClaim() public {
        vm.startPrank(bob);
        staking.leave(ONE * 10); // unstake 20 tokens
        vm.stopPrank();
    }

    // ACTUAL TESTING STARTS HERE
    function testDepositTenFromEach() public {
        aliceTenDeposit();
        bobTenDeposit();
        carolTenDeposit();

        stakingBalance();

        carolTwentyClaim();
        pilot.mint(address(staking), ONE * 100);
        aliceTenClaim();
        bobTenClaim();
    }
}
