import { BigNumber } from 'ethers'

export type ITransferToOtherChainEvent = {
  nonce: BigNumber
  initialChainName: string
  originalChainName: string
  originalTokenAddress: string
  targetChainName: string
  tokenAmount: BigNumber
  sender: string
  recipient: string
}

export type ITokenCreateInfo = {
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
}

export abstract class BridgeDriver {
  public abstract readonly chainName: string

  public abstract readonly isProxyChain: () => Promise<boolean>

  public abstract readonly listenBatchTransafersERC20: (listener: (events: Array<ITransferToOtherChainEvent>) => Promise<void>) => void

  public abstract readonly getTokenCreateInfo: (tokenAddress: string) => Promise<ITokenCreateInfo>;

  public abstract readonly transferFromOtherChain: (
    event: ITransferToOtherChainEvent,
    tokenCreateInfo: ITokenCreateInfo,
  ) => Promise<void>
}
