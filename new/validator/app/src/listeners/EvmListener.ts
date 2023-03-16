import { ethers } from 'ethers'
import { Queue } from 'bullmq'
import { TransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'

export class EvmListener {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _bridgeERC20: BridgeERC20
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _previousBlock: number = -1
  private readonly _jobQueue: Queue
  private readonly _name: string

  private readonly _limitOfBlocksForGetLogs = 1000

  private readonly _syncForm?: number

  constructor({
    name,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom?: number
  }) {
    this._name = name
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._jobQueue = new Queue(this._name)
    this._provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._provider)
    this._syncForm = syncFrom
  }

  public async init() {
    if(this._syncForm !== undefined) {
      await this._syncExecutedBlocks()
    }
    this._listen()
  }

  private async _syncExecutedBlocks() {
    const { blocks, hasMore } = { blocks: [] as number[], hasMore: true }

    const endBlock = blocks[blocks.length - 1]! - this._numberOfBlocksToConfirm

    for (const block of blocks) {
      if (block > endBlock) break
      if (block < this._previousBlock) continue

      const start = block
      let end = endBlock
      if (end - start > this._limitOfBlocksForGetLogs) {
        end = start + this._limitOfBlocksForGetLogs
      }

      await this._parseBlocks(start, end)

      this._previousBlock = end
    }

    if (hasMore) {
      await this._syncExecutedBlocks()
    }
  }

  private _listen() {
    setInterval(async () => {
      const currentBlock = await this._provider.getBlockNumber()
      const startBlock = this._previousBlock + 1

      let confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      if (confirmedBlock - startBlock > this._limitOfBlocksForGetLogs)
        confirmedBlock = startBlock + this._limitOfBlocksForGetLogs

      if (startBlock < confirmedBlock) return

      this._previousBlock = confirmedBlock

      await this._parseBlocks(startBlock, confirmedBlock)
    }, this._poolingInterval)
  }

  private async _parseBlocks(startBlock: number, endBlock: number) {
    const events = await this._getTransfers(startBlock, endBlock)
    for (const event of events) {
      this._jobQueue.add(event.originalChainName, event)
    }
  }

  private async _getTransfers(startBlock: number, endBlock: number): Promise<Array<TransferModel>> {
    return (
      await this._bridgeERC20.queryFilter(
        this._bridgeERC20.filters.TransferToOtherChain(),
        startBlock,
        endBlock,
      )
    ).map(event => TransferModel.fromEvent(event))
  }
}