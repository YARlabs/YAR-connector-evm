export interface ITransferModelERC1155 {
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