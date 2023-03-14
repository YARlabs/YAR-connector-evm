import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { config } from "../config";

const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'ETHEREUM',
    [Mumbai.chainId]: 'POLYGON',
    [10226688]: 'YAR',
}

const idToRpcUrl = {
    [BSCTestnet.chainId]: config.network.bsctestnet.url,
    [Goerli.chainId]: config.network.goerli.url,
    [Mumbai.chainId]: config.network.mumbai.url,
    [10226688]: config.network.yar.url,
}

const idToScanLink = {
    [BSCTestnet.chainId]: 'https://testnet.bscscan.com/',
    [Goerli.chainId]: 'https://goerli.etherscan.io/',
    [Mumbai.chainId]: 'https://mumbai.polygonscan.com/',
    [10226688]: 'https://explorer.testnet.yarchain.org/',
}

export { idToChainName, idToScanLink, idToRpcUrl };