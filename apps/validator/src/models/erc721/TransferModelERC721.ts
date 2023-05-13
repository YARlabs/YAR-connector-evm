export interface ITransferModelERC721 {
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
  tokenUri: string
}