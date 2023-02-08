export const config = {
  network: {
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/",
      accounts: [process.env.GOERLI_PRIV_KEY],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [process.env.MUMBAI_PRIV_KEY],
    },
  },
};
