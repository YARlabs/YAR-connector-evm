// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { Diamond } from "../diamond_base/Diamond.sol";
import { LibChainInfo } from "./libraries/LibChainInfo.sol";
import { LibValidatorController } from "./libraries/LibValidatorController.sol";

contract UniversalBridgeDiamond is Diamond {
    constructor(
        string memory _chainName,
        bool _isProxyChain,
        address _contractOwner,
        address _diamondCutFacet,
        address _validator
    ) Diamond(_contractOwner, _diamondCutFacet) {
        LibChainInfo.setChainName(_chainName);
        LibChainInfo.setIsProxyChain(_isProxyChain);
        LibValidatorController.setValidator(_validator);
    }
}
