const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xA3f7BF5b0fa93176c260BBa57ceE85525De2BaF4',
        erc721: '0x696358bBb1a743052E0E87BeD78AAd9d18f0e1F4',
        erc1155: '0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'POLYGON',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xb830887eE23d3f9Ed8c27dbF7DcFe63037765475',
        erc721: '0x22b1c5C2C9251622f7eFb76E356104E5aF0e996A',
        erc1155: '0x9e7F7d0E8b8F38e3CF2b3F7dd362ba2e9E82baa4',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'BINANCE',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3',
        erc721: '0xD855cE0C298537ad5b5b96060Cf90e663696bbf6',
        erc1155: '0x5c932424AcBfab036969b3B9D94bA9eCbae7565D',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'ETHEREUM',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xF9c0bF1CFAAB883ADb95fed4cfD60133BffaB18a',
        erc721: '0xF45B1CdbA9AACE2e9bbE80bf376CE816bb7E73FB',
        erc1155: '0x3949c97925e5Aa13e34ddb18EAbf0B70ABB0C7d4',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
  ],
}
export default CONFIG
