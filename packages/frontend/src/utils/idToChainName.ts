import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { config } from "../config";
import { customIds } from "./customIds";

const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'ETHEREUM',
    [Mumbai.chainId]: 'POLYGON',
    [customIds.yar]: 'YAR',
    [customIds.skale]: 'SKALE'
}

const idToRpcUrl = {
    [BSCTestnet.chainId]: config.network.bsctestnet.url,
    [Goerli.chainId]: config.network.goerli.url,
    [Mumbai.chainId]: config.network.mumbai.url,
    [customIds.yar]: config.network.yar.url,
    [customIds.skale]: config.network.skale.url
}

const idToScanLink = {
    [BSCTestnet.chainId]: 'https://testnet.bscscan.com/',
    [Goerli.chainId]: 'https://goerli.etherscan.io/',
    [Mumbai.chainId]: 'https://mumbai.polygonscan.com/',
    [customIds.yar]: 'https://explorer.testnet.yarchain.org/',
    [customIds.skale]: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com/'
}

export { idToChainName, idToScanLink, idToRpcUrl };