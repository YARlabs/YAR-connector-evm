import { NonceManager } from '@ethersproject/experimental'
import { Wallet, ethers } from 'ethers'
import {
  IChainInfo,
  IChainInfo__factory,
  IERC20Driver,
  IERC20Driver__factory,
  IValidatorController,
  IValidatorController__factory,
} from '../typechain-types'
import { IERC20Metadata__factory } from '../typechain-types'
import { Provider } from '@ethersproject/abstract-provider'
import { UniqueBlockListener } from '../utils/UniqueBlockListener'
import { BridgeDriver, ITokenCreateInfo, ITransferToOtherChainEvent } from './BridgeDriver'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

export class EvmBridgeDriver implements BridgeDriver {
  // @override
  public readonly chainName: string
  private readonly _address: string
  public readonly _validator: NonceManager
  public readonly _provider: Provider
  public readonly _blockConfirmationsCount: number
  public _startFromBlock: number | undefined

  public readonly _chainInfo: IChainInfo
  public readonly _erc20Driver: IERC20Driver
  public readonly _validatorController: IValidatorController

  private _cacheTokensCreateInfo: Record<string, ITokenCreateInfo> = {}

  private _isProxyChain: boolean | undefined

  // @override
  public readonly isProxyChain = async (): Promise<boolean> => {
    return (this._isProxyChain ??= await this._chainInfo.isProxyChain())
  }

  constructor({
    chainName,
    startFromBlock,
    blockConfirmationsCount,
    address,
    providerUrl,
    validatorPrivateKey,
  }: {
    chainName: string
    startFromBlock?: number
    blockConfirmationsCount: number
    address: string
    providerUrl: string
    validatorPrivateKey: string
  }) {
    console.log(`${chainName}: BridgeDriver init`)
    this._address = address
    this.chainName = chainName
    this._blockConfirmationsCount = blockConfirmationsCount
    this._startFromBlock = startFromBlock

    if (providerUrl.startsWith('ws')) {
      this._provider = new ethers.providers.WebSocketProvider(providerUrl)
    } else if (providerUrl.startsWith('http')) {
      this._provider = new ethers.providers.JsonRpcProvider({
        url: providerUrl,
        timeout: 240000,
        throttleSlotInterval: 5000,
        throttleLimit: 10,
      })
    } else {
      throw Error(`Failed parse provider url ${providerUrl}`)
    }

    this._validator = new NonceManager(new Wallet(validatorPrivateKey, this._provider))

    this._chainInfo = IChainInfo__factory.connect(address, this._validator)
    this._erc20Driver = IERC20Driver__factory.connect(address, this._validator)
    this._validatorController = IValidatorController__factory.connect(address, this._validator)

    console.log(`${chainName}: BridgeDriver created`)
  }

  // @override
  public readonly listenBatchTransafersERC20 = async (
    listener: (events: Array<ITransferToOtherChainEvent>) => Promise<void>,
  ) => {
    const firstBlock = (await this._erc20Driver.initialBlockNumberERC20()).add(1).toNumber()
    const lastBlock = await this._provider.getBlockNumber()
    const lastBlockToSync = lastBlock - this._blockConfirmationsCount

    const blocksCacheFile = 'blocks_cache.json'
    if (existsSync(blocksCacheFile)) {
      const blocksCache = JSON.parse(readFileSync(blocksCacheFile, 'utf-8'))
      this._startFromBlock = blocksCache[this.chainName]
    }

    // execute listener function
    const execute = async (key: string, blockNumber: number) => {
      const blocksCache = existsSync(blocksCacheFile)
        ? JSON.parse(readFileSync(blocksCacheFile, 'utf-8'))
        : {}
      blocksCache[this.chainName] = blockNumber
      writeFileSync(blocksCacheFile, JSON.stringify(blocksCache))

      const eventsData = await this.getEventsFromBlock(blockNumber)
      if (eventsData.length) {
        console.log(`${this.chainName}: ${key} ${blockNumber}, ${eventsData.length} events`)
        for (const event of eventsData) {
          console.log(
            `${this.chainName} event info: block - ${blockNumber}, nonce - ${event.nonce}, ${event.initialChainName} -> ${event.targetChainName}`,
          )
        }
        await listener(eventsData)
      }
    }

    let tmpSyncBlock
    // sync
    if (this._startFromBlock !== undefined) {
      const initialBlock = this._startFromBlock > firstBlock ? this._startFromBlock : firstBlock
      for (
        let syncBlockBumber = initialBlock;
        syncBlockBumber < lastBlockToSync;
        syncBlockBumber++
      ) {
        tmpSyncBlock = syncBlockBumber
        await execute('Sync block', syncBlockBumber)
      }
    }

    let singleFlag = false

    // listen
    UniqueBlockListener.listenNewBlocks({
      provider: this._provider,
      listener: async blockNumber => {
        if (!singleFlag) {
          singleFlag = true
          if (blockNumber != tmpSyncBlock + 1) {
            const errorFilePath = 'errors.json'
            const errorFile = existsSync(errorFilePath)
              ? JSON.parse(readFileSync(errorFilePath, 'utf-8'))
              : {}
            errorFile[this.chainName] ??= []
            errorFile[this.chainName].push(
              `blockNumber ${blockNumber}, tmpSyncBlock ${tmpSyncBlock}`,
            )
            writeFileSync(errorFilePath, JSON.stringify(errorFile, null, 4))
          }

          // Resync
          for (let block = tmpSyncBlock + 1; block < blockNumber; block++) {
            console.log(`${this.chainName}: Resync block ${block}`)
            await execute('ReSync block', block)
          }
        }

        if (this._startFromBlock !== undefined && this._startFromBlock > blockNumber) {
          return
        }
        const confirmedBlock = blockNumber - this._blockConfirmationsCount
        await execute('Listen block', confirmedBlock)
      },
    })
  }

  private readonly getEventsFromBlock = async (
    blockNumber: number,
  ): Promise<Array<ITransferToOtherChainEvent>> => {
    return (
      await this._erc20Driver.queryFilter(
        this._erc20Driver.filters.ERC20DriverTransferToOtherChain(),
        blockNumber,
        blockNumber,
      )
    ).map(({ args }) => ({
      nonce: args.nonce,
      initialChainName: args.initialChainName,
      originalChainName: args.originalChainName,
      originalTokenAddress: args.originalTokenAddress,
      targetChainName: args.targetChainName,
      tokenAmount: args.tokenAmount,
      sender: args.sender,
      recipient: args.recipient,
    }))
  }

  private readonly _fetchTokenCreateInfo = async (
    tokenAddress: string,
  ): Promise<ITokenCreateInfo> => {
    const token = IERC20Metadata__factory.connect(tokenAddress, this._provider)
    const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
    ])
    return {
      tokenName,
      tokenSymbol,
      tokenDecimals,
    }
  }

  // @override
  public readonly getTokenCreateInfo = async (tokenAddress: string): Promise<ITokenCreateInfo> => {
    if (this._cacheTokensCreateInfo[tokenAddress]) {
      return this._cacheTokensCreateInfo[tokenAddress]!
    }
    const isTokenPublished = await this._erc20Driver.isIssuedTokenCreatedERC20(
      this.chainName,
      tokenAddress,
    )
    if (!isTokenPublished) {
      return (this._cacheTokensCreateInfo[tokenAddress] = await this._fetchTokenCreateInfo(
        tokenAddress,
      ))
    } else {
      return {
        tokenName: '',
        tokenSymbol: '',
        tokenDecimals: 0,
      }
    }
  }

  // @override
  public readonly transferFromOtherChain = async (
    event: ITransferToOtherChainEvent,
    tokenCreateInfo: ITokenCreateInfo,
  ) => {
    const recipient = {
      evmAddress: event.recipient,
      noEvmAddress: '',
    }

    // Check nonce
    const isNonceAlreadyRegistered = await this._erc20Driver.isExternalNonceAlreadyRegisteredERC20(
      event.initialChainName,
      event.nonce,
    )
    if (isNonceAlreadyRegistered) {
      return
    }

    // Transfer
    const tx = await this._erc20Driver.tranferFromOtherChainERC20(
      event.nonce,
      event.originalChainName,
      event.originalTokenAddress,
      event.initialChainName,
      event.targetChainName,
      event.tokenAmount,
      event.sender,
      recipient,
      tokenCreateInfo,
    )
    await tx.wait()
    console.log(
      `${this.chainName}: Execute nonce ${event.nonce}, ${event.initialChainName} -> ${event.targetChainName}`,
    )
  }
}
