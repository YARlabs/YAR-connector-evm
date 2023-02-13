export const config = {
  network: {
    goerli: {
      url: "https://endpoints.omniatech.io/v1/eth/goerli/public",
      accounts: [process.env.GOERLI_PRIV_KEY],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [process.env.MUMBAI_PRIV_KEY],
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545",
    },
    yar: {
      url: "http://95.217.57.15:18545/",
    },
  },
};
