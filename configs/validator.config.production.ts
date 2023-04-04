export default {
  proxyBridge: "YAR",
  bridges: [
    {
      name: "YAR",
      rpcUrl: "https://rpc1.testnet.yarchain.org",
      address: "0x77d2aB62BF4B733726C0b757D53449770FE42e82",
      privateKey: process.env.YAR_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "POLYGON",
      rpcUrl: "https://rpc-mumbai.maticvigil.com",
      address: "0x4fc4d6C93641aF34d4158fAcd1fe51A526d5Bf93",
      privateKey: process.env.POLYGON_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "BINANCE",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      address: "0x8d77CCe6F321F36E1a7179636b40E100A6202C69",
      privateKey: process.env.BINANCE_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "ETHEREUM",
      rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      address: "0xe944eDe345139EC64d27059A9A5006A2ce367326",
      privateKey: process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "SKALE",
      rpcUrl: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
      address: "0xA4a52100c26308f8Df26873635Bd5600Be56938B",
      privateKey: process.env.SKALE_VALIDATOR_PRIVATE_KEY,
    },
  ],
};
