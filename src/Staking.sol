// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Staking is ERC20("PilotCafe", "xPILOT") {

    IERC20 public pilot;

    constructor(IERC20 _pilot) public {
        pilot = _pilot;
    }

    // Enter the bar. Pay some PILOTs. Earn some shares.
    function enter(uint256 _amount) public {
        uint256 totalPilot = pilot.balanceOf(address(this));    //PILOT toppedup token
        uint256 totalShares = totalSupply();                    //xPILOT total supply
        if (totalShares == 0 || totalPilot == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = (_amount * totalShares) / totalPilot;
            _mint(msg.sender, what); //xPilot
        }
        pilot.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your PILOTs.
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();                                    //xPILOT total supply
        uint256 what = (_share * pilot.balanceOf(address(this))) / totalShares; //PILOT toppedUp
        _burn(msg.sender, _share);  //xPilot burn
        pilot.transfer(msg.sender, what); //return pilot
    }
}
