import { ethers } from 'ethers'

export interface ITransferModel {
  transferId: string
  nonce: number
  initialChain: string
  originalChain: string
  originalToken: string
  targetChain: string
  tokenId: number
  sender: string
  recipient: string
  tokenName: string
  tokenSymbol: string
}