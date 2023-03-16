import { ethers } from 'ethers'
import { Queue } from 'bullmq'
import { TransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import CONFIG from '../../config.json'

export class EvmListener {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _bridgeERC20: BridgeERC20
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _previousBlock: number
  private readonly _jobQueue: Queue
  private readonly _name: string
  private readonly _currentChain: string
  private readonly _limitOfBlocksForGetLogs = 1000
  private readonly _syncFrom?: number

  constructor({
    name,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom?: number
  }) {
    this._name = name
    this._currentChain = ethers.utils.keccak256(this._name)
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._jobQueue = new Queue(this._name)
    this._provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._provider)
    this._syncFrom = syncFrom
    this._previousBlock = -1
  }

  public async init() {
    if (this._syncFrom !== undefined) {
      this._previousBlock = this._syncFrom!
      const initBlock = (await this._bridgeERC20.initBlock()).toNumber()
      if (initBlock > this._previousBlock) this._previousBlock = initBlock
    }

    setInterval(async () => {
      const startBlock = this._previousBlock + 1
      const currentBlock = await this._provider.getBlockNumber()
      let confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      if (confirmedBlock - startBlock > this._limitOfBlocksForGetLogs)
        confirmedBlock = startBlock + this._limitOfBlocksForGetLogs

      if (startBlock < confirmedBlock) return

      this._previousBlock = confirmedBlock

      const transfers = await this._getTransfers(startBlock, confirmedBlock)
      for (const transfer of transfers) {
        this._addTask(transfer)
      }
    }, this._poolingInterval)
  }

  private _addTask(transfer: TransferModel) {
    let taskName = transfer.targetChain
    if( this._name != CONFIG.proxyBridge && this._currentChain != transfer.targetChain ) {
      taskName = ethers.utils.keccak256(CONFIG.proxyBridge)
    }
    this._jobQueue.add(taskName, transfer)
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
