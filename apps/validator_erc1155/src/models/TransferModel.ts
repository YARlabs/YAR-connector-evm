import { ethers } from 'ethers'

export interface ITransferModel {
  transferId: string
  nonce: number
  initialChain: string
  originalChain: string
  originalToken: string
  targetChain: string
  tokenId: number
  amount: string
  sender: string
  recipient: string
  tokenUri: string
}