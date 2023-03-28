export default {
  proxyBridge: "YAR",
  bridges: [
    {
      name: "YAR",
      rpcUrl: "https://rpc1.testnet.yarchain.org",
      address: "0x97b718d479D984a232305f0C62ED52832049149e",
      privateKey: process.env.YAR_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "POLYGON",
      rpcUrl: "https://rpc-mumbai.maticvigil.com",
      address: "0x523B846c60F44DDD184C0842f29869F526f1fb3D",
      privateKey: process.env.POLYGON_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "BINANCE",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      address: "0x6107ca560bbaf6cbF406Ebd87B52D0CfF7509c4e",
      privateKey: process.env.BINANCE_VALIDATOR_PRIVATE_KEY,
    },
    {
      name: "ETHEREUM",
      rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      address: "0x25d7D86C405f63427C9FF24c3de7aa64F5d246Da",
      privateKey: process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY,
    },
  ],
};
