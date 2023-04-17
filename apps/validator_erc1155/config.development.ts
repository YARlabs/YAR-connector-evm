const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xA3f7BF5b0fa93176c260BBa57ceE85525De2BaF4',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'POLYGON',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xb830887eE23d3f9Ed8c27dbF7DcFe63037765475',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'BINANCE',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'ETHEREUM',
      rpcUrl: 'http://host.docker.internal:8545/',
      address: '0xF9c0bF1CFAAB883ADb95fed4cfD60133BffaB18a',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
  ],
}
export default CONFIG
