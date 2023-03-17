import { ethers } from 'ethers'

export interface ITransferModel {
  nonce: ethers.BigNumber
  initialChain: string
  originalChain: string
  originalToken: string
  targetChain: string
  tokenAmount: ethers.BigNumber
  sender: string
  recipient: string
  tokenInfo: {
    name: string
    symbol: string
    decimals: number
  }
}