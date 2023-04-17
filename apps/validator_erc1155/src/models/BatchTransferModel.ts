import { ethers } from 'ethers'

export interface IBatchTransferModel {
  transferId: string
  nonce: number
  initialChain: string
  originalChain: string
  originalToken: string
  targetChain: string
  tokenIds: number[]
  amounts: string[]
  sender: string
  recipient: string
  tokenUris: string[]
}