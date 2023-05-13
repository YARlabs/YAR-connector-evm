import { ethers } from 'ethers'
import { BridgeERC721, BridgeERC721__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { DataBase } from '../../DataBase'
import { SafetyProviderManager } from '../../utils/SafetyProviderManager'
import { ITransferModelERC721 } from '../../models/erc721/TransferModelERC721'

export class EvmExecutorERC721 {
  private _provider?: ethers.providers.JsonRpcProvider
  private _wallet?: ethers.Wallet
  private _bridgeERC721?: BridgeERC721
  private readonly _name: string
  private readonly _currentChain: string
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
    this._bridgeERC721 = BridgeERC721__factory.connect(this._bridgeAddress, this._wallet)
    const savedTrasfers = await this._db.getAwaitingTrasfers(this._currentChain, false)
    await this._executeTrasfers(savedTrasfers)
    setInterval(async () => {
      const transfers = await this._db.getAwaitingTrasfers(this._currentChain)
      await this._executeTrasfers(transfers)
    }, this._poolingInterval)

    await this._db.setAppStatus('ready')
  }

  private async _executeTrasfers(trasfers: Array<ITransferModelERC721>) {
    const errors: Array<Error> = []
    for(const trasfer of trasfers) {
      try {
        await this._tarsferFromOtherChain(trasfer)
        await this._db.completeAwaitingTrasfer(this._currentChain, trasfer)
      } catch(e) {
        errors.push(e)
      }
    }
    if(errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _tarsferFromOtherChain(transfer: ITransferModelERC721) {
    const alreadyRegistered = await this._bridgeERC721!.registeredNonces(transfer.initialChain, transfer.nonce)
    if(alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC721!.tranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenId,
      transfer.sender,
      transfer.recipient,
      {
        name: transfer.tokenName,
        symbol: transfer.tokenSymbol,
        tokenUri: transfer.tokenUri
      },
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }
}
