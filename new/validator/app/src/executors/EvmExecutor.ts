import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import { Queue, Worker } from 'bullmq'
import { EthersUtils } from '../utils/EthersUtils'

export class EvmExecutor {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _wallet: ethers.Wallet
  private readonly _bridgeERC20: BridgeERC20
  private readonly _name: string
  private readonly _currentChain: string

  constructor({
    name,
    bridgeAddress,
    providerUrl,
    privateKey,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    privateKey: string
  }) {
    this._name = name
    this._currentChain = EthersUtils.keccak256(this._name)
    console.log(`PROVIDERURL ${providerUrl}`)
    this._provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this._wallet = new ethers.Wallet(privateKey, this._provider)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._wallet)
  }

  public init() {
    const worker = new Worker(
      this._currentChain,
      async job => {
        console.log(`NEW JOB ${job.data}`)
        const transfer = job.data as ITransferModel
        await this._tarsferFromOtherChain(transfer)
        await job.remove()
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
    )
  }

  private async _tarsferFromOtherChain(transfer: ITransferModel) {
    console.log('SEND TX')

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
    console.log('TX SENEDED')

    await tx.wait()
    console.log(`Execute transfer ${transfer}`)
  }
}
