import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { config } from "../config";
import { customIds } from "./customIds";
import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs";

export const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'ETHEREUM',
    [Mumbai.chainId]: 'POLYGON',
    [customIds.yar]: 'YAR',
    [customIds.skale]: 'SKALE'
}

export const idToBridgeAddress = {
    [BSCTestnet.chainId]: BRIDGES_ADDRESSES.erc1155.binanceTest,
    [Goerli.chainId]: BRIDGES_ADDRESSES.erc1155.ethereumTest,
    [Mumbai.chainId]: BRIDGES_ADDRESSES.erc1155.polygonTest,
    [customIds.yar]: BRIDGES_ADDRESSES.erc1155.yarTest,
    [customIds.skale]: BRIDGES_ADDRESSES.erc1155.chaosSkaleTest
}

export const idToRpcUrl = {
    [BSCTestnet.chainId]: config.network.bsctestnet.url,
    [Goerli.chainId]: config.network.goerli.url,
    [Mumbai.chainId]: config.network.mumbai.url,
    [customIds.yar]: config.network.yar.url,
    [customIds.skale]: config.network.skale.url
}

export const idToScanLink = {
    [BSCTestnet.chainId]: CHAINS_CONFIG.binanceTest.explorer + '/',
    [Goerli.chainId]: CHAINS_CONFIG.ethereumTest.explorer + '/',
    [Mumbai.chainId]: CHAINS_CONFIG.polygonTest.explorer + '/',
    [customIds.yar]: CHAINS_CONFIG.yarTest.explorer + '/',
    [customIds.skale]: CHAINS_CONFIG.chaosSkaleTest.explorer + '/',
}

