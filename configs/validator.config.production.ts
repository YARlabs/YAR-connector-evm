export default {
  proxyBridge: "YAR",
  bridges: [
    {
      name: "YAR",
      rpcUrl: "https://rpc1.testnet.yarchain.org",
      address: "0x5583B9dA5Dd838f604aD2A3e2979bD6D91482967",
      privateKey: process.env.YAR_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "POLYGON",
      rpcUrl: "https://rpc-mumbai.maticvigil.com",
      address: "0x3c755d71755a70499F38154c6c14E99C6D52D8b9",
      privateKey: process.env.POLYGON_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "BINANCE",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      address: "0x1782eC0562b79B94b52a13A24328a9981a04E635",
      privateKey: process.env.BINANCE_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "ETHEREUM",
      rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      address: "0x35DF543CCaCF7D728cD3dA60F8d37088D00640d5",
      privateKey: process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY,
    },
  ],
};
