import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import { EthersUtils } from '../utils/EthersUtils'
import { AppState } from '../AppState'

export class EvmExecutor {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _wallet: ethers.Wallet
  private readonly _bridgeERC20: BridgeERC20
  private readonly _name: string
  private readonly _processName: string
  private readonly _currentChain: string

  constructor({
    name,
    processName,
    bridgeAddress,
    providerUrl,
    privateKey,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrl: string
    privateKey: string
  }) {
    this._name = name
    this._processName = processName
    this._currentChain = EthersUtils.keccak256(this._name)
    this._provider = new ethers.providers.JsonRpcProvider({ url: providerUrl, timeout: 30000 })
    this._wallet = new ethers.Wallet(privateKey, this._provider)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._wallet)
  }


  public async init() {
    const savedTrasfers = await AppState.getAwaitingTrasfers(this._currentChain, false)
    await this._executeTrasfers(savedTrasfers)
    setInterval(async () => {
      const transfers = await AppState.getAwaitingTrasfers(this._currentChain)
      await this._executeTrasfers(transfers)
    }, 5000)

    await AppState.setAppStatus(this._processName, 'ready')
  }

  private async _executeTrasfers(trasfers: Array<ITransferModel>) {
    for(const trasfer of trasfers) {
      await this._tarsferFromOtherChain(trasfer)
      await AppState.completeAwaitingTrasfer(this._currentChain, trasfer)
    }
  }

  private async _tarsferFromOtherChain(transfer: ITransferModel) {
    const alreadyRegistered = await this._bridgeERC20.registeredNonces(transfer.initialChain, transfer.nonce)
    if(alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC20.tranferFromOtherChain(
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
