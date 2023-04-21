import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs"
import { VALIDATOR_PRIVATE_KEYS } from "configs_secret"
import CHAINS_RPS from '../../chains_rps.json'

const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      // rpcUrl: CHAINS_CONFIG.yarTest.rpc,
      rpcUrls: CHAINS_RPS.yarTest,
      address: BRIDGES_ADDRESSES.erc721.yarTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.yarTest,
    },
    {
      name: 'POLYGON',
      // rpcUrl: CHAINS_CONFIG.polygonTest.rpc,
      rpcUrls: CHAINS_RPS.polygonTest,
      address: BRIDGES_ADDRESSES.erc721.polygonTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.polygonTest,
    },
    {
      name: 'BINANCE',
      // rpcUrl: CHAINS_CONFIG.binanceTest.rpc,
      rpcUrls: CHAINS_RPS.binanceTest,
      address: BRIDGES_ADDRESSES.erc721.binanceTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.binanceTest,
    },
    {
      name: 'ETHEREUM',
      // rpcUrl: CHAINS_CONFIG.ethereumTest.rpc,
      rpcUrls: CHAINS_RPS.ethereumTest,
      address: BRIDGES_ADDRESSES.erc721.ethereumTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.ethereumTest,
    },
    {
      name: 'SKALE',
      // rpcUrl: CHAINS_CONFIG.chaosSkaleTest.rpc,
      rpcUrls: CHAINS_RPS.chaosSkaleTest,
      address: BRIDGES_ADDRESSES.erc721.chaosSkaleTest,
      privateKey: VALIDATOR_PRIVATE_KEYS.chaosSkaleTest,
    },
  ],
}
export default CONFIG
