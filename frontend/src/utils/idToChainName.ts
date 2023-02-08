import { BSCTestnet, Goerli, Mumbai, AvalancheTestnet } from "@usedapp/core";

const idToChainName = {
    [BSCTestnet.chainId]: 'BINANCE',
    [Goerli.chainId]: 'YAR',
    [Mumbai.chainId]: 'POLYGON',
    [AvalancheTestnet.chainId]: 'ETHEREUM',
}

const idToScanLink = {
    [BSCTestnet.chainId]: 'https://testnet.bscscan.com/tx/',
    [Goerli.chainId]: 'https://goerli.etherscan.io/tx/',
    [Mumbai.chainId]: 'https://mumbai.polygonscan.com/tx/',
    [AvalancheTestnet.chainId]: 'https://testnet.snowtrace.io/tx/',
}

export { idToChainName, idToScanLink };