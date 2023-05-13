import { ethers } from 'ethers'
import { BridgeERC1155, BridgeERC1155__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { DataBase } from '../../DataBase'
import { SafetyProviderManager } from '../../utils/SafetyProviderManager'
import { ITransferModelERC1155 } from '../../models/erc1155/TransferModelERC1155'
import { IBatchTransferModelERC1155 } from '../../models/erc1155/BatchTransferModelERC1155'

export class EvmExecutorERC1155 {
  private _provider?: ethers.providers.JsonRpcProvider
  private _wallet?: ethers.Wallet
  private _bridgeERC1155?: BridgeERC1155
  private readonly _name: string
  private readonly _currentChain: string
  private readonly _singleQueueName: string
  private readonly _batchQueueName: string
  private readonly _privateKey: string
  private readonly _providerUrls: string[]
  private readonly _bridgeAddress: string
  private readonly _db: DataBase
  private readonly _poolingInterval: number

  constructor({
    name,
    bridgeAddress,
    providerUrls,
    privateKey,
    poolingInterval,
    db,
  }: {
    name: string
    bridgeAddress: string
    providerUrls: string[]
    privateKey: string
    poolingInterval: number
    db: DataBase
  }) {
    this._name = name
    this._currentChain = EthersUtils.keccak256(this._name)
    this._singleQueueName = this._currentChain
    this._batchQueueName = `batch_${this._currentChain}`
    this._bridgeAddress = bridgeAddress
    this._providerUrls = providerUrls
    this._privateKey = privateKey
    this._db = db
    this._poolingInterval = poolingInterval
  }

  public async init() {
    const providerUrl = await SafetyProviderManager.getProvider(this._providerUrls)
    this._provider = new ethers.providers.JsonRpcProvider({ url: providerUrl, timeout: 30000 })
    this._wallet = new ethers.Wallet(this._privateKey, this._provider)
    this._bridgeERC1155 = BridgeERC1155__factory.connect(this._bridgeAddress, this._wallet)

    const savedTrasfers = await this._db.getAwaitingTrasfers(this._singleQueueName, false)
    const savedBatchTrasfers = await this._db.getAwaitingTrasfers(this._batchQueueName, false)
    await this._executeTrasfers(savedTrasfers)
    await this._executeBatchTrasfers(savedBatchTrasfers)
    setInterval(async () => {
      const transfers = await this._db.getAwaitingTrasfers(this._singleQueueName)
      const batchTransfers = await this._db.getAwaitingTrasfers(this._batchQueueName)
      await this._executeTrasfers(transfers)
      await this._executeBatchTrasfers(batchTransfers)
    }, this._poolingInterval)

    await this._db.setAppStatus('ready')
  }

  private async _executeTrasfers(trasfers: Array<ITransferModelERC1155>) {
    const errors: Array<Error> = []
    for (const trasfer of trasfers) {
      try {
        await this._tarsferFromOtherChain(trasfer)
        await this._db.completeAwaitingTrasfer(this._singleQueueName, trasfer)
      } catch (e) {
        errors.push(e)
      }
    }
    if (errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _executeBatchTrasfers(trasfers: Array<IBatchTransferModelERC1155>) {
    const errors: Array<Error> = []
    for (const trasfer of trasfers) {
      try {
        await this._batchTarsferFromOtherChain(trasfer)
        await this._db.completeAwaitingTrasfer(this._batchQueueName, trasfer)
      } catch (e) {
        errors.push(e)
      }
    }
    if (errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _tarsferFromOtherChain(transfer: ITransferModelERC1155) {
    const alreadyRegistered = await this._bridgeERC1155!.registeredNonces(
      transfer.initialChain,
      transfer.nonce,
    )
    if (alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC1155!.tranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenId,
      transfer.amount,
      transfer.sender,
      transfer.recipient,
      transfer.tokenUri,
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }

  private async _batchTarsferFromOtherChain(transfer: IBatchTransferModelERC1155) {
    const alreadyRegistered = await this._bridgeERC1155!.registeredNonces(
      transfer.initialChain,
      transfer.nonce,
    )
    if (alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC1155!.batchTranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenIds,
      transfer.amounts,
      transfer.sender,
      transfer.recipient,
      transfer.tokenUris,
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }
}
