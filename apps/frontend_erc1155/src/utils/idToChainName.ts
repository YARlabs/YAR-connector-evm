import { config } from "../config";
import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs";

export const idToChainName = {
    [CHAINS_CONFIG.binanceTest.chainId]: 'BINANCE',
    [CHAINS_CONFIG.ethereumTest.chainId]: 'ETHEREUM',
    [CHAINS_CONFIG.polygonTest.chainId]: 'POLYGON',
    [CHAINS_CONFIG.yarTest.chainId]: 'YAR',
    [CHAINS_CONFIG.chaosSkaleTest.chainId]: 'SKALE',
    [CHAINS_CONFIG.optimismTest.chainId]: 'OPTIMISM',
    [CHAINS_CONFIG.arbitrumTest.chainId]: 'ARBITRUM',
    [CHAINS_CONFIG.avaxTest.chainId]: 'AVAX',
    [CHAINS_CONFIG.baseTest.chainId]: 'BASE',
}

export const idToBridgeAddress = {
    [CHAINS_CONFIG.binanceTest.chainId]: BRIDGES_ADDRESSES.erc1155.binanceTest,
    [CHAINS_CONFIG.ethereumTest.chainId]: BRIDGES_ADDRESSES.erc1155.ethereumTest,
    [CHAINS_CONFIG.polygonTest.chainId]: BRIDGES_ADDRESSES.erc1155.polygonTest,
    [CHAINS_CONFIG.yarTest.chainId]: BRIDGES_ADDRESSES.erc1155.yarTest,
    [CHAINS_CONFIG.chaosSkaleTest.chainId]: BRIDGES_ADDRESSES.erc1155.chaosSkaleTest,
    [CHAINS_CONFIG.optimismTest.chainId]: BRIDGES_ADDRESSES.erc1155.optimismTest,
    [CHAINS_CONFIG.arbitrumTest.chainId]: BRIDGES_ADDRESSES.erc1155.arbitrumTest,
    [CHAINS_CONFIG.avaxTest.chainId]: BRIDGES_ADDRESSES.erc1155.avaxTest,
    [CHAINS_CONFIG.baseTest.chainId]: BRIDGES_ADDRESSES.erc1155.baseTest,
}

export const idToRpcUrl = {
    [CHAINS_CONFIG.binanceTest.chainId]: config.network.bsctestnet.url,
    [CHAINS_CONFIG.ethereumTest.chainId]: config.network.goerli.url,
    [CHAINS_CONFIG.polygonTest.chainId]: config.network.mumbai.url,
    [CHAINS_CONFIG.yarTest.chainId]: config.network.yar.url,
    [CHAINS_CONFIG.chaosSkaleTest.chainId]: config.network.skale.url,
    [CHAINS_CONFIG.optimismTest.chainId]:config.network.optimism.url,
    [CHAINS_CONFIG.arbitrumTest.chainId]: config.network.arbitrum.url,
    [CHAINS_CONFIG.avaxTest.chainId]: config.network.avax.url,
    [CHAINS_CONFIG.baseTest.chainId]: config.network.base.url,
}

export const idToScanLink = {
    [CHAINS_CONFIG.binanceTest.chainId]: CHAINS_CONFIG.binanceTest.explorer + '/',
    [CHAINS_CONFIG.ethereumTest.chainId]: CHAINS_CONFIG.ethereumTest.explorer + '/',
    [CHAINS_CONFIG.polygonTest.chainId]:CHAINS_CONFIG.polygonTest.explorer + '/',
    [CHAINS_CONFIG.yarTest.chainId]: CHAINS_CONFIG.yarTest.explorer + '/',
    [CHAINS_CONFIG.chaosSkaleTest.chainId]: CHAINS_CONFIG.chaosSkaleTest.explorer + '/',
    [CHAINS_CONFIG.optimismTest.chainId]:CHAINS_CONFIG.optimismTest.explorer + '/',
    [CHAINS_CONFIG.arbitrumTest.chainId]: CHAINS_CONFIG.arbitrumTest.explorer + '/',
    [CHAINS_CONFIG.avaxTest.chainId]: CHAINS_CONFIG.avaxTest.explorer + '/',
    [CHAINS_CONFIG.baseTest.chainId]: CHAINS_CONFIG.baseTest.explorer + '/',
}

