import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.secrets") });

export default {
  chains: {
    yarTest: {
      validatorPrivateKey: process.env.YAR_VALIDATOR_PRIVATE_KEY,
      rpcUrl: "https://rpc1.testnet.yarchain.org",
      chainId: 10226688,
      etherscan: {
        url: "https://goerli.etherscan.io/",
        apiKey: process.env.YAR_EXPLORER_API_KEY,
      },
    },

    polygonTest: {
      validatorPrivateKey: process.env.POLYGON_VALIDATOR_PRIVATE_KEY,
      rpcUrl: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      etherscan: {
        url: "https://mumbai.polygonscan.com/",
        apiKey: process.env.POLYGON_EXPLORER_API_KEY,
      },
    },

    binanceTest: {
      validatorPrivateKey: process.env.BINANCE_VALIDATOR_PRIVATE_KEY,
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      etherscan: {
        url: "https://testnet.bscscan.com/",
        apiKey: process.env.BINANCE_EXPLORER_API_KEY,
      },
    },

    ethereumTest: {
      validatorPrivateKey: process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY,
      rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      etherscan: {
        url: "https://goerli.etherscan.io/",
        apiKey: process.env.ETHEREUM_EXPLORER_API_KEY,
      },
    },

    chaosSkaleTest: {
      validatorPrivateKey: process.env.SKALE_VALIDATOR_PRIVATE_KEY,
      rpcUrl: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
      chainId: 1351057110,
      etherscan: {
        url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com",
        apiKey: process.env.SKALE_EXPLORER_API_KEY,
      },
    },
  },
};
