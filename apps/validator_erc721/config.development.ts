const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0x696358bBb1a743052E0E87BeD78AAd9d18f0e1F4',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'POLYGON',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0x22b1c5C2C9251622f7eFb76E356104E5aF0e996A',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'BINANCE',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xD855cE0C298537ad5b5b96060Cf90e663696bbf6',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'ETHEREUM',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xF45B1CdbA9AACE2e9bbE80bf376CE816bb7E73FB',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
  ],
}
export default CONFIG
