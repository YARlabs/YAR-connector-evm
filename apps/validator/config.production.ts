import { BRIDGES_ADDRESSES } from 'configs'
import { VALIDATOR_PRIVATE_KEYS } from 'configs_secret'
import CHAINS_RPC from '../../chains_rpc.json'

const chains = [
  {
    name: 'YAR',
    tag: 'yarTest',
  },
  {
    name: 'POLYGON',
    tag: 'polygonTest',
  },
  {
    name: 'BINANCE',
    tag: 'binanceTest',
  },
  {
    name: 'ETHEREUM',
    tag: 'ethereumTest',
  },
  {
    name: 'SKALE',
    tag: 'chaosSkaleTest',
  },
  {
    name: 'OPTIMISM',
    tag: 'optimismTest',
  },
  {
    name: 'ARBITRUM',
    tag: 'arbitrumTest',
  },
  {
    name: 'AVAX',
    tag: 'avaxTest',
  },
  {
    name: 'BASE',
    tag: 'baseTest',
  },
]
const CONFIG: {
  proxyBridge: string
  bridges: Array<{
    name: string,
    rpcUrls: string[]
    addresses: {
      erc20: string
      erc721: string
      erc1155: string
    }
    privateKey: string
  }>
} = {
  proxyBridge: 'YAR',
  bridges: [],
}

for (const { name, tag } of chains) {
  CONFIG.bridges.push({
    name,
    rpcUrls: CHAINS_RPC[tag],
    addresses: {
      erc20: BRIDGES_ADDRESSES.erc20[tag],
      erc721: BRIDGES_ADDRESSES.erc721[tag],
      erc1155: BRIDGES_ADDRESSES.erc1155[tag],
    },
    privateKey: VALIDATOR_PRIVATE_KEYS[tag],
  })
}

export default CONFIG
