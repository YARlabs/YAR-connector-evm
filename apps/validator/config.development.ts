const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3',
        erc721: '0x696358bBb1a743052E0E87BeD78AAd9d18f0e1F4',
        erc1155: '0x89372b32b8AF3F1272e2efb3088616318D2834cA',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'POLYGON',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xF9c0bF1CFAAB883ADb95fed4cfD60133BffaB18a',
        erc721: '0x7036124464A2d2447516309169322c8498ac51e3',
        erc1155: '0xB1c05b498Cb58568B2470369FEB98B00702063dA',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'BINANCE',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0xb830887eE23d3f9Ed8c27dbF7DcFe63037765475',
        erc721: '0xeE1eb820BeeCED56657bA74fa8D70748D7A6756C',
        erc1155: '0x92A00fc48Ad3dD4A8b5266a8F467a52Ac784fC83',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'ETHEREUM',
      rpcUrls: ['http://host.docker.internal:8545/'],
      addresses: {
        erc20: '0x6f2E42BB4176e9A7352a8bF8886255Be9F3D2d13',
        erc721: '0x5c932424AcBfab036969b3B9D94bA9eCbae7565D',
        erc1155: '0x2f8D338360D095a72680A943A22fE6a0d398a0B4',
      },
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
  ],
}
export default CONFIG
