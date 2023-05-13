import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs"
import { VALIDATOR_PRIVATE_KEYS } from "configs_secret"
import CHAINS_RPS from '../../chains_rps.json'

const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrls: CHAINS_RPS.yarTest,
      addresses: {
        erc20: BRIDGES_ADDRESSES.erc20.yarTest,
        erc721: BRIDGES_ADDRESSES.erc721.yarTest,
        erc1155: BRIDGES_ADDRESSES.erc1155.yarTest,
      },
      privateKey: VALIDATOR_PRIVATE_KEYS.yarTest,
    },
    {
      name: 'POLYGON',
      rpcUrls: CHAINS_RPS.polygonTest,
      address: BRIDGES_ADDRESSES.erc20.polygonTest,
      addresses: {
        erc20: BRIDGES_ADDRESSES.erc20.polygonTest,
        erc721: BRIDGES_ADDRESSES.erc721.polygonTest,
        erc1155: BRIDGES_ADDRESSES.erc1155.polygonTest,
      },
      privateKey: VALIDATOR_PRIVATE_KEYS.polygonTest,
    },
    {
      name: 'BINANCE',
      rpcUrls: CHAINS_RPS.binanceTest,
      addresses: {
        erc20: BRIDGES_ADDRESSES.erc20.binanceTest,
        erc721: BRIDGES_ADDRESSES.erc721.binanceTest,
        erc1155: BRIDGES_ADDRESSES.erc1155.binanceTest,
      },
      privateKey: VALIDATOR_PRIVATE_KEYS.binanceTest,
    },
    {
      name: 'ETHEREUM',
      rpcUrls: CHAINS_RPS.ethereumTest,
      addresses: {
        erc20: BRIDGES_ADDRESSES.erc20.ethereumTest,
        erc721: BRIDGES_ADDRESSES.erc721.ethereumTest,
        erc1155: BRIDGES_ADDRESSES.erc1155.ethereumTest,
      },
      privateKey: VALIDATOR_PRIVATE_KEYS.ethereumTest,
    },
    {
      name: 'SKALE',
      rpcUrls: CHAINS_RPS.chaosSkaleTest,
      addresses: {
        erc20: BRIDGES_ADDRESSES.erc20.chaosSkaleTest,
        erc721: BRIDGES_ADDRESSES.erc721.chaosSkaleTest,
        erc1155: BRIDGES_ADDRESSES.erc1155.chaosSkaleTest,
      },
      privateKey: VALIDATOR_PRIVATE_KEYS.chaosSkaleTest,
    },
  ],
}
export default CONFIG
