// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./../src/Staking.sol";
import "./../src/Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ContractTest is Test {
    Staking public staking;
    Token public token;

    function setUp() public {
        token = new Token();
        staking = new Staking(IERC20(token));
    }

    function testTokenName() public {
        assertEq(token.name(), "TOKEN");
    }

    function testStakingAddress() public {
        assertEq(address(staking), address(0x185a4dc360CE69bDCceE33b3784B0282f7961aea));
    }
}
