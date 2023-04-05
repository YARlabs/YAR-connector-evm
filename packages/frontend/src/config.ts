export const config = {
  network: {
    goerli: {
      url: "https://goerli.infura.io/v3/9502027cfe6040b3a3a388b07fcf2638",
      accounts: [process.env.GOERLI_PRIV_KEY],
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/EUUYrmuHGhuCzkc4ZAbEeNN9XsEj5s6Z",
      accounts: [process.env.MUMBAI_PRIV_KEY],
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    },
    yar: {
      url: "https://rpc1.testnet.yarchain.org",
    },
    skale: {
      url: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"
    }
  },
};
