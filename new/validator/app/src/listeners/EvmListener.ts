import { ethers } from 'ethers'
import { IERC20Driver, IERC20Driver__factory } from '../typechain-types'
import { Queue } from 'bullmq'
import { TransferModel } from '../models/TransferModel'

export class EvmListener {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _erc20Driver: IERC20Driver
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _lastBlock: number = 0
  private readonly _jobQueue: Queue

  constructor({
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
  }: {
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
  }) {
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._jobQueue = new Queue('EvmListener')
    this._provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this._erc20Driver = IERC20Driver__factory.connect(bridgeAddress, this._provider)
  }

  public init() {
    this._listen()
  }

  private async _getTransfers(startBlock: number, endBlock: number): Promise<Array<TransferModel>> {
    return (
      await this._erc20Driver.queryFilter(
        this._erc20Driver.filters.ERC20DriverTransferToOtherChain(),
        startBlock,
        endBlock,
      )
    ).map(event => TransferModel.fromEvent(event))
  }

  private _listen() {
    setInterval(async () => {
      const currentBlock = await this._provider.getBlockNumber()
      const startBlock = this._lastBlock + 1
      const confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      this._lastBlock = confirmedBlock

      if (startBlock < confirmedBlock) return

      const events = await this._getTransfers(startBlock, confirmedBlock)
      for (const event of events) {
        this._jobQueue.add(event.originalChainName, event)
      }
    }, this._poolingInterval)
  }
}
