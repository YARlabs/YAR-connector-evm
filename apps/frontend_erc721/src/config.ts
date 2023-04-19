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
    }
  },
};
