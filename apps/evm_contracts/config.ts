import { CHAINS_CONFIG } from 'configs'
import { EXPLORERS_API_KEY, VALIDATOR_PRIVATE_KEYS } from 'configs_secret'

const chains = {
  'yarTest': true,
  'polygonTest': true,
  'binanceTest': true,
  'ethereumTest': true,
  'chaosSkaleTest': true,
  'optimismTest': true,
  'arbitrumTest': true,
  'avaxTest': true,
  'baseTest': true,
}

export const CONFIG: {
  chains: {
    [key in keyof typeof chains]: {
      validatorPrivateKey: string
      rpcUrl: string
      chainId: number
      etherscan: {
        url: string
        apiKey: string
      }
    }
  }
} = {
  chains: {} as any,
}

for (const chain of Object.keys(chains)) {
  if(chains[chain] == false) continue
  CONFIG.chains[chain] = {
    validatorPrivateKey: VALIDATOR_PRIVATE_KEYS[chain],
    rpcUrl: CHAINS_CONFIG[chain].rpc,
    chainId: CHAINS_CONFIG[chain].chainId,
    etherscan: {
      url: CHAINS_CONFIG[chain].explorer,
      apiKey: EXPLORERS_API_KEY[chain] ?? '',
    },
  }
}
