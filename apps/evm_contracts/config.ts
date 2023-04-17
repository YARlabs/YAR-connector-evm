import { CHAINS_CONFIG } from 'configs'
import { EXPLORERS_API_KEY, VALIDATOR_PRIVATE_KEYS } from 'configs_secret'

export const CONFIG = {
  chains: {
    yarTest: {
      validatorPrivateKey: VALIDATOR_PRIVATE_KEYS.yarTest,
      rpcUrl: CHAINS_CONFIG.yarTest.rpc,
      chainId: CHAINS_CONFIG.yarTest.chainId,
      etherscan: {
        url: CHAINS_CONFIG.yarTest.explorer,
        apiKey: EXPLORERS_API_KEY.yarTest,
      },
    },

    polygonTest: {
      validatorPrivateKey: VALIDATOR_PRIVATE_KEYS.polygonTest,
      rpcUrl: CHAINS_CONFIG.polygonTest.rpc,
      chainId: CHAINS_CONFIG.polygonTest.chainId,
      etherscan: {
        url: CHAINS_CONFIG.polygonTest.explorer,
        apiKey: EXPLORERS_API_KEY.polygonTest,
      },
    },

    binanceTest: {
      validatorPrivateKey: VALIDATOR_PRIVATE_KEYS.binanceTest,
      rpcUrl: CHAINS_CONFIG.binanceTest.rpc,
      chainId: CHAINS_CONFIG.binanceTest.chainId,
      etherscan: {
        url: CHAINS_CONFIG.binanceTest.explorer,
        apiKey: EXPLORERS_API_KEY.binanceTest,
      },
    },

    ethereumTest: {
      validatorPrivateKey: VALIDATOR_PRIVATE_KEYS.ethereumTest,
      rpcUrl: CHAINS_CONFIG.ethereumTest.rpc,
      chainId: CHAINS_CONFIG.ethereumTest.chainId,
      etherscan: {
        url: CHAINS_CONFIG.ethereumTest.explorer,
        apiKey: EXPLORERS_API_KEY.ethereumTest,
      },
    },

    chaosSkaleTest: {
      validatorPrivateKey: VALIDATOR_PRIVATE_KEYS.chaosSkaleTest,
      rpcUrl: CHAINS_CONFIG.chaosSkaleTest.rpc,
      chainId: CHAINS_CONFIG.chaosSkaleTest.chainId,
      etherscan: {
        url: CHAINS_CONFIG.chaosSkaleTest.explorer,
        apiKey: EXPLORERS_API_KEY.chaosSkaleTest,
      },
    },
  },
}
