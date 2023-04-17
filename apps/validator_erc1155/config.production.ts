import { BRIDGES_ADDRESSES, CHAINS_CONFIG, VALIDATOR_PRIVATE_KEYS } from "configs"

const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrl: CHAINS_CONFIG.yarTest.rpc,
      address: BRIDGES_ADDRESSES.erc721.yarTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.yarTest,
    },
    {
      name: 'POLYGON',
      rpcUrl: CHAINS_CONFIG.polygonTest.rpc,
      address: BRIDGES_ADDRESSES.erc721.polygonTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.polygonTest,
    },
    {
      name: 'BINANCE',
      rpcUrl: CHAINS_CONFIG.binanceTest.rpc,
      address: BRIDGES_ADDRESSES.erc721.binanceTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.binanceTest,
    },
    {
      name: 'ETHEREUM',
      rpcUrl: CHAINS_CONFIG.ethereumTest.rpc,
      address: BRIDGES_ADDRESSES.erc721.ethereumTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.ethereumTest,
    },
    {
      name: 'SKALE',
      rpcUrl: CHAINS_CONFIG.chaosSkaleTest.rpc,
      address: BRIDGES_ADDRESSES.erc721.chaosSkaleTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.chaosSkaleTest,
    },
  ],
}
export default CONFIG
