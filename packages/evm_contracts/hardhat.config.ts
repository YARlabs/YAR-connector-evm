import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'hardhat-tracer'
import 'hardhat-abi-exporter'
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-contract-sizer'

import CONFIG from './config'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: 'https://mainnet.infura.io/v3/32c869b2294046f4931f3d8b93b2dae0',
        blockNumber: 16884580,
      },
      mining: {
        auto: false,
        interval: 5000,
      },
      blockGasLimit: 30000000,
      accounts: {
        count: 10,
        accountsBalance: '1000000000000000000000000000',
      },
      loggingEnabled: true,
    },
    yarTest: {
      url: CONFIG.chains.yarTest.rpcUrl,
      accounts: [CONFIG.chains.yarTest.validatorPrivateKey],
    },
    polygonTest: {
      url: CONFIG.chains.polygonTest.rpcUrl,
      accounts: [CONFIG.chains.polygonTest.validatorPrivateKey],
    },
    binanceTest: {
      url: CONFIG.chains.binanceTest.rpcUrl,
      accounts: [CONFIG.chains.binanceTest.validatorPrivateKey],
    },
    ethereumTest: {
      url: CONFIG.chains.ethereumTest.rpcUrl,
      accounts: [CONFIG.chains.ethereumTest.validatorPrivateKey],
    },
    chaosSkaleTest: {
      url: CONFIG.chains.chaosSkaleTest.rpcUrl,
      accounts: [CONFIG.chains.chaosSkaleTest.validatorPrivateKey],
    },
  },
  
  etherscan: {
    apiKey: {
      yarTest: CONFIG.chains.yarTest.etherscan.apiKey,
      polygonTest: CONFIG.chains.polygonTest.etherscan.apiKey,
      binanceTest: CONFIG.chains.binanceTest.etherscan.apiKey,
      ethereumTest: CONFIG.chains.ethereumTest.etherscan.apiKey,
      chaosSkaleTest: CONFIG.chains.chaosSkaleTest.etherscan.apiKey,
    },
    customChains: [
      {
        network: 'yarTest',
        chainId: CONFIG.chains.yarTest.chainId,
        urls: {
          apiURL: CONFIG.chains.yarTest.rpcUrl,
          browserURL: CONFIG.chains.yarTest.etherscan.url,
        },
      },
      {
        network: 'polygonTest',
        chainId: CONFIG.chains.polygonTest.chainId,
        urls: {
          apiURL: CONFIG.chains.polygonTest.rpcUrl,
          browserURL: CONFIG.chains.polygonTest.etherscan.url,
        },
      },
      {
        network: 'binanceTest',
        chainId: CONFIG.chains.binanceTest.chainId,
        urls: {
          apiURL: CONFIG.chains.binanceTest.rpcUrl,
          browserURL: CONFIG.chains.binanceTest.etherscan.url,
        },
      },
      {
        network: 'chaosSkaleTest',
        chainId: CONFIG.chains.chaosSkaleTest.chainId,
        urls: {
          apiURL: CONFIG.chains.chaosSkaleTest.rpcUrl,
          browserURL: CONFIG.chains.chaosSkaleTest.etherscan.url,
        },
      },
      {
        network: 'ethereumTest',
        chainId: CONFIG.chains.ethereumTest.chainId,
        urls: {
          apiURL: CONFIG.chains.ethereumTest.rpcUrl,
          browserURL: CONFIG.chains.ethereumTest.etherscan.url,
        },
      },
    ],
  },
  abiExporter: {
    path: './abi',
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 30,
  },
  mocha: {
    timeout: 100000000,
  },
  tracer: {
    tasks: ['node', 'deploy'],
  },
}

export default config
