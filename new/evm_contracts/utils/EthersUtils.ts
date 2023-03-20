import { ethers } from 'ethers'

export class EthersUtils {
  public static keccak256(data: string): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data))
  }
}
