// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { LibChainInfo } from "../libraries/LibChainInfo.sol";
import { IChainInfo } from "../interfaces/IChainInfo.sol";

contract ChainInfoFacet is IChainInfo {
    function chainName() external view returns (string memory) {
        return LibChainInfo.chainName();
    }

    function isProxyChain() external view returns (bool) {
        return LibChainInfo.isProxyChain();
    }
}
