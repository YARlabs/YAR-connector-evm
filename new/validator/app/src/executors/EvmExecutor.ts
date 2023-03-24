import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC20, BridgeERC20__factory } from '../typechain-types'
import { Worker } from 'bullmq'
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
    this._provider = new ethers.providers.JsonRpcProvider({url: providerUrl, timeout: 30000})
    this._wallet = new ethers.Wallet(privateKey, this._provider)
    this._bridgeERC20 = BridgeERC20__factory.connect(bridgeAddress, this._wallet)
  }

  public init() {
    const worker = new Worker(
      this._currentChain,
      async job => {
        try {
          console.log(`NEW JOB ${job.data}`)
          const transfer = job.data as ITransferModel
          await this._tarsferFromOtherChain(transfer)
          // setTimeout(async () => await job.remove())
        } catch (e) {
          // Cant throw error from bullmq worker
          console.log(`$error ${e}`)
          process.exit()
        }
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
    )
    worker.on('failed', (job, error) => {
      // Do something with the return value.
      console.log(`worker.on('failed' ${error}`);
    });
    worker.on('error', err => {
      // log the error
      console.log(`worker.on('error' ${err}`);
    });

    console.log('Ready')
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
