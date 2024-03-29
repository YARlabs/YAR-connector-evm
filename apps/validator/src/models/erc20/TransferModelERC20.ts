export interface ITransferModelERC20 {
  transferId: string
  nonce: number
  initialChain: string
  originalChain: string
  originalToken: string
  targetChain: string
  tokenAmount: string
  sender: string
  recipient: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
}