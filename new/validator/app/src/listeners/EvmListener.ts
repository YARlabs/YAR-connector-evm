import { ethers } from 'ethers'
import { Queue } from 'bullmq'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import CONFIG from '../../config.json'
import { EthersUtils } from '../utils/EthersUtils'

export class EvmListener {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _bridgeERC20: BridgeERC20
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _previousBlock: number
  private readonly _tasksQueue: Queue
  private readonly _name: string
  private readonly _currentChain: string
  private readonly _limitOfBlocksForGetLogs = 1000
  private readonly _syncFrom?: number

  private readonly _proxyChain: string

  constructor({
    name,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom?: number
    proxyChain: string
  }) {
    console.log(syncFrom)
    console.log(typeof syncFrom)
    this._name = name
    this._currentChain = EthersUtils.keccak256(this._name)
    this._proxyChain = EthersUtils.keccak256(proxyChain)
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._tasksQueue = new Queue('redisQueue', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    })
    console.log(`PROVIDERURL ${providerUrl}`)
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
    } else {
      this._previousBlock = await this._provider.getBlockNumber()
    }

    setInterval(async () => {
      const startBlock = this._previousBlock + 1
      const currentBlock = await this._provider.getBlockNumber()
      let confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      if (confirmedBlock - startBlock > this._limitOfBlocksForGetLogs)
        confirmedBlock = startBlock + this._limitOfBlocksForGetLogs

        console.log(`startBlock ${startBlock}`)

      if (startBlock > confirmedBlock) return

      this._previousBlock = confirmedBlock

      const transfers = await this._getTransfers(startBlock, confirmedBlock)
      if(transfers.length) console.log(`Pooling ${transfers.length} events on blocks ${startBlock}-${confirmedBlock}`)
      for (const transfer of transfers) {
        this._addTask(transfer)
      }
    }, this._poolingInterval)

    console.log()
  }

  private _addTask(transfer: ITransferModel) {
    let taskName = transfer.targetChain
    if (this._currentChain != this._proxyChain && transfer.targetChain != this._proxyChain)
      taskName = this._proxyChain
    this._tasksQueue.add(taskName, transfer)
    console.log('_addTask')
  }

  private async _getTransfers(
    startBlock: number,
    endBlock: number,
  ): Promise<Array<ITransferModel>> {
    return (
      await this._bridgeERC20.queryFilter(
        this._bridgeERC20.filters.TransferToOtherChain(),
        startBlock,
        endBlock,
      )
    ).map(event => ({
      nonce: event.args.nonce,
      initialChain: event.args.initialChain,
      originalChain: event.args.originalChain,
      originalToken: event.args.originalTokenAddress,
      targetChain: event.args.targetChain,
      tokenAmount: event.args.tokenAmount,
      sender: event.args.sender,
      recipient: event.args.recipient,
      tokenInfo: {
        name: event.args.tokenName,
        symbol: event.args.tokenSymbol,
        decimals: event.args.tokenDecimals,
      },
    }))
  }
}
