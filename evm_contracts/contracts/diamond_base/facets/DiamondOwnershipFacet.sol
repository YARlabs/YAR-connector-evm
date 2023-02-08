// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IDiamondOwnership } from "../interfaces/IDiamondOwnership.sol";

contract DiamondOwnershipFacet is IDiamondOwnership {
    function transferOwnership(address _newOwner) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    function owner() external override view returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }
}