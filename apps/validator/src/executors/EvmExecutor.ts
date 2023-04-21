import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { AppState } from '../AppState'
import { SafetyProviderManager } from '../utils/SafetyProviderManager'

export class EvmExecutor {
  private _provider?: ethers.providers.JsonRpcProvider
  private _wallet?: ethers.Wallet
  private _bridgeERC20?: BridgeERC20
  private readonly _name: string
  private readonly _processName: string
  private readonly _currentChain: string
  private readonly _privateKey: string
  private readonly _providerUrls: string[]
  private readonly _bridgeAddress: string

  constructor({
    name,
    processName,
    bridgeAddress,
    providerUrls,
    privateKey,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrls: string[]
    privateKey: string
  }) {
    this._name = name
    this._processName = processName
    this._currentChain = EthersUtils.keccak256(this._name)
    this._bridgeAddress = bridgeAddress
    this._providerUrls = providerUrls
    this._privateKey = privateKey
  }


  public async init() {
    const providerUrl = await SafetyProviderManager.getProvider(this._providerUrls)
    this._provider = new ethers.providers.JsonRpcProvider({ url: providerUrl, timeout: 30000 })
    this._wallet = new ethers.Wallet(this._privateKey, this._provider)
    this._bridgeERC20 = BridgeERC20__factory.connect(this._bridgeAddress, this._wallet)

    const savedTrasfers = await AppState.getAwaitingTrasfers(this._currentChain, false)
    await this._executeTrasfers(savedTrasfers)
    setInterval(async () => {
      const transfers = await AppState.getAwaitingTrasfers(this._currentChain)
      await this._executeTrasfers(transfers)
    }, 5000)

    await AppState.setAppStatus(this._processName, 'ready')
  }

  private async _executeTrasfers(trasfers: Array<ITransferModel>) {
    const errors: Array<Error> = []
    for(const trasfer of trasfers) {
      try {
        await this._tarsferFromOtherChain(trasfer)
        await AppState.completeAwaitingTrasfer(this._currentChain, trasfer)
      } catch(e) {
        errors.push(e)
      }
    }
    if(errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _tarsferFromOtherChain(transfer: ITransferModel) {
    const alreadyRegistered = await this._bridgeERC20!.registeredNonces(transfer.initialChain, transfer.nonce)
    if(alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC20!.tranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenAmount,
      transfer.sender,
      transfer.recipient,
      {
        name: transfer.tokenName,
        symbol: transfer.tokenSymbol,
        decimals: transfer.tokenDecimals,
      },
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }
}
