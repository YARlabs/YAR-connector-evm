import { ethers } from 'ethers'
import { BridgeERC721, BridgeERC721__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { SafetyProviderManager } from '../../utils/SafetyProviderManager'
import { DataBase } from '../../DataBase'
import { ITransferModelERC721 } from '../../models/erc721/TransferModelERC721'

export class EvmListenerERC721 {
  private _provider?: ethers.providers.JsonRpcProvider
  private _bridgeERC721?: BridgeERC721
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _previousBlock: number
  private readonly _name: string
  private readonly _currentChain: string
  private readonly _limitOfBlocksForGetLogs = 1000
  private _syncFrom?: number

  private readonly _proxyChain: string
  private readonly _providerUrls: string[]
  private readonly _bridgeAddress: string

  private readonly _db: DataBase

  constructor({
    name,
    bridgeAddress,
    providerUrls,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
    db,
  }: {
    name: string
    bridgeAddress: string
    providerUrls: string[]
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom?: number
    proxyChain: string
    db: DataBase
  }) {
    console.log(`${name} cretae`)
    this._name = name
    this._currentChain = EthersUtils.keccak256(this._name)
    this._proxyChain = EthersUtils.keccak256(proxyChain)
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._syncFrom = syncFrom
    this._previousBlock = -1
    this._bridgeAddress = bridgeAddress
    this._providerUrls = providerUrls
    this._db = db
  }

  public async init() {
    const providerUrl = await SafetyProviderManager.getProvider(this._providerUrls)
    this._provider = new ethers.providers.JsonRpcProvider({ url: providerUrl, timeout: 30000 })
    this._bridgeERC721 = BridgeERC721__factory.connect(this._bridgeAddress, this._provider)

    const previousBlockFromDb = await this._db.getPreviousBlock()
    if (previousBlockFromDb !== undefined) {
      this._syncFrom = previousBlockFromDb
    }

    if (this._syncFrom !== undefined) {
      this._previousBlock = this._syncFrom!
      const initBlock = (await this._bridgeERC721.initBlock()).toNumber()
      if (initBlock > this._previousBlock) this._previousBlock = initBlock
    } else {
      this._previousBlock = await this._provider.getBlockNumber()
    }

    await this._db.setPreviousBlock(this._previousBlock)

    setInterval(async () => {
      const startBlock = (await this._db.getPreviousBlock())! + 1
      const currentBlock = await this._provider!.getBlockNumber()
      let confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      if (confirmedBlock - startBlock > this._limitOfBlocksForGetLogs)
        confirmedBlock = startBlock + this._limitOfBlocksForGetLogs

      if (startBlock > confirmedBlock) return

      console.log(`${this._name} ${confirmedBlock}`)
      this._previousBlock = confirmedBlock

      const transfers = await this._getTransfers(startBlock, confirmedBlock)
      if (transfers.length)
        console.log(`Pooling ${transfers.length} events on blocks ${startBlock}-${confirmedBlock}`)
      const awatingPromises: Promise<void>[] = []
      for (const transfer of transfers) {
        awatingPromises.push(this._addTask(transfer))
      }
      await Promise.all(awatingPromises)

      await this._db.setPreviousBlock(confirmedBlock)
    }, this._poolingInterval)

    await this._db.setAppStatus('ready')
  }

  private async _addTask(transfer: ITransferModelERC721) {
    let queueName = transfer.targetChain
    if (this._currentChain != this._proxyChain && transfer.targetChain != this._proxyChain)
      queueName = this._proxyChain
    await this._db.addAwatingTrasfer(queueName, transfer)
  }

  private async _getTransfers(
    startBlock: number,
    endBlock: number,
  ): Promise<Array<ITransferModelERC721>> {
    return (
      await this._bridgeERC721!.queryFilter(
        this._bridgeERC721!.filters.TransferToOtherChain(),
        startBlock,
        endBlock,
      )
    ).map(event => ({
      transferId: event.args.transferId,
      nonce: event.args.nonce.toNumber(),
      initialChain: event.args.initialChain,
      originalChain: event.args.originalChain,
      originalToken: event.args.originalTokenAddress,
      targetChain: event.args.targetChain,
      tokenId: event.args.tokenId.toNumber(),
      sender: event.args.sender,
      recipient: event.args.recipient,
      tokenName: event.args.tokenName,
      tokenSymbol: event.args.tokenSymbol,
      tokenUri: event.args.tokenUri,
    }))
  }
}
