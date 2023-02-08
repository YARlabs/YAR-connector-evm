import { Provider } from '@ethersproject/abstract-provider'

export class UniqueBlockListener {
  public static readonly listenNewBlocks = ({
    provider,
    listener,
  }: {
    provider: Provider
    listener: (blockNumber: number) => Promise<void>
  }) => {
    let lastBlockNumber = -1
    provider.on('block', async blockNumber => {
      // If use WebSocketProvider, provider.on('block') returns duplicate data
      // this conditional filtered it
      if (blockNumber <= lastBlockNumber) {
        return
      }
      lastBlockNumber = blockNumber
      await listener(blockNumber)
    })
  }
}
