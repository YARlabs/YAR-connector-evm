import { ethers } from 'ethers'

export class TransactionModel {
  constructor(
    public readonly nonce: ethers.BigNumber,
    public readonly initialChainName: string,
    public readonly originalChainName: string,
    public readonly originalTokenAddress: string,
    public readonly targetChainName: string,
    public readonly tokenAmount: ethers.BigNumber,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly tokenCreateInfo: {
      tokenName: string
      tokenSymbol: string
      tokenDecimals: number
    },
  ) {}
}
