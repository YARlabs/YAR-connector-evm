import { CHAINS_CONFIG } from "configs";

export const config = {
  network: {
    goerli: {
      url: CHAINS_CONFIG.ethereumTest.rpc,
    },
    mumbai: {
      url: CHAINS_CONFIG.polygonTest.rpc,
    },
    bsctestnet: {
      url: CHAINS_CONFIG.binanceTest.rpc,
    },
    yar: {
      url: CHAINS_CONFIG.yarTest.rpc,
    },
    skale: {
      url: CHAINS_CONFIG.chaosSkaleTest.rpc
    },
    optimism: {
      url: CHAINS_CONFIG.optimismTest.rpc
    },
    arbitrum: {
      url: CHAINS_CONFIG.arbitrumTest.rpc
    },
    avax: {
      url: CHAINS_CONFIG.arbitrumTest.rpc
    },
    base: {
      url: CHAINS_CONFIG.baseTest.rpc
    },
  },
};
