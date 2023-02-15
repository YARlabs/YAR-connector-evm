import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";

const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'ETHEREUM',
    [Mumbai.chainId]: 'POLYGON',
    [38204]: 'YAR',
}

const idToScanLink = {
    [BSCTestnet.chainId]: 'https://testnet.bscscan.com/',
    [Goerli.chainId]: 'https://goerli.etherscan.io/',
    [Mumbai.chainId]: 'https://mumbai.polygonscan.com/',
    [38204]: 'https://explorer.testnet.yarchain.org/',
}

export { idToChainName, idToScanLink };