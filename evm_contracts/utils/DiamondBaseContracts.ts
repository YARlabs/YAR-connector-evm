import {
  IDiamondCut,
  IDiamondCut__factory,
  IDiamondLoupe,
  IDiamondLoupe__factory,
  IDiamondOwnership,
  IDiamondOwnership__factory,
} from '../typechain-types'
import { Signer } from 'ethers'

export class DiamondBaseContracts {
  public readonly address: string
  public readonly dimondCut: IDiamondCut
  public readonly dimondLoupe: IDiamondLoupe
  public readonly dimondOwnership: IDiamondOwnership

  constructor(diamondAddress: string, signer: Signer) {
    this.address = diamondAddress
    this.dimondCut = IDiamondCut__factory.connect(diamondAddress, signer)
    this.dimondLoupe = IDiamondLoupe__factory.connect(diamondAddress, signer)
    this.dimondOwnership = IDiamondOwnership__factory.connect(diamondAddress, signer)
  }
}
