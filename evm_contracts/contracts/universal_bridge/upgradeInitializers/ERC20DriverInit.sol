// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { LibERC20Driver } from "../libraries/LibERC20Driver.sol";

contract ERC20DriverInit {
    function init(address _issuedTokenImplementation, string[] calldata _regesteredChains)
        external
    {
        LibERC20Driver.ERC20DriverStorage storage ds = LibERC20Driver.diamondStorage();
        ds.issuedTokenImplementation = _issuedTokenImplementation;
        ds.initialBlockNumber = block.number;
        uint256 l = _regesteredChains.length;
        for (uint256 i; i < l; i++) {
            LibERC20Driver.setChainRegistration(_regesteredChains[i], true);
        }
    }
}
