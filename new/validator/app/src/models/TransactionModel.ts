import { ethers } from 'ethers'

type IUniversalAddress =
  | { evmAddress: string; noEvmAddress: '' }
  | { evmAddress: ''; noEvmAddress: string }

type ITokenCreateInfo = {
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
}

export class TransactionModel {
  constructor(
    public readonly nonce: ethers.BigNumber,
    public readonly initialChainName: string,
    public readonly originalChainName: string,
    public readonly originalTokenAddress: string,
    public readonly targetChainName: string,
    public readonly tokenAmount: ethers.BigNumber,
    public readonly sender: string,
    public readonly recipient: IUniversalAddress,
    public readonly tokenCreateInfo: ITokenCreateInfo,
  ) {}
}
