import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";

const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'ETHEREUM',
    [Mumbai.chainId]: 'POLYGON',
    [38204]: 'YAR',
}

const idToScanLink = {
    [BSCTestnet.chainId]: 'https://testnet.bscscan.com/tx/',
    [Goerli.chainId]: 'https://goerli.etherscan.io/tx/',
    [Mumbai.chainId]: 'https://mumbai.polygonscan.com/tx/',
    [38204]: 'https://testnet.snowtrace.io/tx/',
}

export { idToChainName, idToScanLink };