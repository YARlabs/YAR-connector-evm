import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { AppState } from '../AppState'




export class EvmListener {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _bridgeERC20: BridgeERC20
  private readonly _numberOfBlocksToConfirm: number
  private readonly _poolingInterval: number
  private _previousBlock: number
  private readonly _name: string  
  private readonly _processName: string
  private readonly _currentChain: string
  private readonly _limitOfBlocksForGetLogs = 1000
  private _syncFrom?: number

  private readonly _proxyChain: string

  constructor({
    name,
    processName,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom?: number
    proxyChain: string
  }) {
    console.log(`${name} cretae`)
    this._name = name
    this._processName = processName
    this._currentChain = EthersUtils.keccak256(this._name)
    this._proxyChain = EthersUtils.keccak256(proxyChain)
    this._numberOfBlocksToConfirm = numberOfBlocksToConfirm
    this._poolingInterval = poolingInterval
    this._provider = new ethers.providers.JsonRpcProvider({url: providerUrl, timeout: 30000})
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._provider)
    this._syncFrom = syncFrom
    this._previousBlock = -1
  }

  public async init() {
    const previousBlockFromDb = await AppState.getPreviousBlock(this._processName)
    if(previousBlockFromDb !== undefined) {
      this._syncFrom = previousBlockFromDb
    }

    if (this._syncFrom !== undefined) {
      this._previousBlock = this._syncFrom!
      const initBlock = (await this._bridgeERC20.initBlock()).toNumber()
      if (initBlock > this._previousBlock) this._previousBlock = initBlock
    } else {
      this._previousBlock = await this._provider.getBlockNumber()
    }

    await AppState.setPreviousBlock(this._processName, this._previousBlock)

    setInterval(async () => {
      const startBlock = (await AppState.getPreviousBlock(this._processName))! + 1
      const currentBlock = await this._provider.getBlockNumber()
      let confirmedBlock = currentBlock - this._numberOfBlocksToConfirm
      if (confirmedBlock - startBlock > this._limitOfBlocksForGetLogs)
        confirmedBlock = startBlock + this._limitOfBlocksForGetLogs

      if (startBlock > confirmedBlock) return

      console.log(`${this._name} ${confirmedBlock}`)
      this._previousBlock = confirmedBlock

      const transfers = await this._getTransfers(startBlock, confirmedBlock)
      if(transfers.length) console.log(`Pooling ${transfers.length} events on blocks ${startBlock}-${confirmedBlock}`)
      for (const transfer of transfers) {
        this._addTask(transfer)
      }
      
      await AppState.setPreviousBlock(this._processName, confirmedBlock)
    }, this._poolingInterval)

    await AppState.setAppStatus(this._processName, 'ready')
  }

  private async _addTask(transfer: ITransferModel) {
    let queueName = transfer.targetChain
    if (this._currentChain != this._proxyChain && transfer.targetChain != this._proxyChain)
    queueName = this._proxyChain
    await AppState.addAwatingTrasfer(queueName, transfer)
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
      transferId: event.args.transferId,
      nonce: event.args.nonce.toNumber(),
      initialChain: event.args.initialChain,
      originalChain: event.args.originalChain,
      originalToken: event.args.originalTokenAddress,
      targetChain: event.args.targetChain,
      tokenAmount: event.args.tokenAmount.toString(),
      sender: event.args.sender,
      recipient: event.args.recipient,
      tokenName: event.args.tokenName,
      tokenSymbol: event.args.tokenSymbol,
      tokenDecimals: event.args.tokenDecimals,
    }))
  }
}
