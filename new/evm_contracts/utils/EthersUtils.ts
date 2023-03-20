import { ethers } from 'ethers'

export class EthersUtils {
  public static keccak256(data: string): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data))
  }

  public static addressToBytes(address: string): string {
    return ethers.utils.defaultAbiCoder.encode(['address'], [address])
  }
}
