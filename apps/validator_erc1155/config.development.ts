const CONFIG = {
  proxyBridge: 'YAR',
  bridges: [
    {
      name: 'YAR',
      // rpcUrl: 'http://host.docker.internal:8545/',
      rpcUrls: ['http://host.docker.internal:8545/'],
      address: '0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'POLYGON',
      // rpcUrl: 'http://host.docker.internal:8545/',
      rpcUrls: ['http://host.docker.internal:8545/'],
      address: '0x9e7F7d0E8b8F38e3CF2b3F7dd362ba2e9E82baa4',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'BINANCE',
      // rpcUrl: 'http://host.docker.internal:8545/',
      rpcUrls: ['http://host.docker.internal:8545/'],
      address: '0x5c932424AcBfab036969b3B9D94bA9eCbae7565D',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    {
      name: 'ETHEREUM',
      // rpcUrl: 'http://host.docker.internal:8545/',
      rpcUrls: ['http://host.docker.internal:8545/'],
      address: '0x3949c97925e5Aa13e34ddb18EAbf0B70ABB0C7d4',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
  ],
}
export default CONFIG
