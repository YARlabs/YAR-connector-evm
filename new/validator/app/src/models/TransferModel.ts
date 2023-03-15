import { ethers } from 'ethers'
import { ERC20DriverTransferToOtherChainEvent } from '../typechain-types/universal_bridge/IERC20Driver'

export class TransferModel {
  constructor(
    public readonly nonce: ethers.BigNumber,
    public readonly initialChainName: string,
    public readonly originalChainName: string,
    public readonly originalTokenAddress: string,
    public readonly targetChainName: string,
    public readonly tokenAmount: ethers.BigNumber,
    public readonly sender: string,
    public readonly recipient: string,
  ) {}

  static fromEvent(event: ERC20DriverTransferToOtherChainEvent) {
    return new this(
      event.args.nonce,
      event.args.initialChainName,
      event.args.originalChainName,
      event.args.originalTokenAddress,
      event.args.targetChainName,
      event.args.tokenAmount,
      event.args.sender,
      event.args.recipient,
    )
  }
}
