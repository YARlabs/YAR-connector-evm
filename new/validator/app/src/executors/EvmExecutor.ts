import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import { Queue, Worker } from 'bullmq'

export class EvmExecutor {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _bridgeERC20: BridgeERC20
  private readonly _name: string
  private readonly _tasksQueue: Queue
  private readonly _tasksQueueName: string

  constructor({
    name,
    tasksQueueName,
    bridgeAddress,
    providerUrl,
  }: {
    name: string
    tasksQueueName: string
    bridgeAddress: string
    providerUrl: string
  }) {
    this._name = name
    this._provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._provider)
    this._tasksQueue = new Queue(tasksQueueName)
    this._tasksQueueName = tasksQueueName
  }

  public init() {
    const worker = new Worker(this._tasksQueueName, async job => {
      const transfer = job.data as ITransferModel
      await this._tarsferFromOtherChain(transfer)
      await job.remove()
    })
  }

  private async _tarsferFromOtherChain(transfer: ITransferModel) {
    const tx = await this._bridgeERC20.tranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenAmount,
      transfer.sender,
      transfer.recipient,
      transfer.tokenInfo,
    )
    await tx.wait()
  }
}
