// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IChainInfo {
    function chainName() external view returns (string memory);

    function isProxyChain() external view returns (bool);
}
