import {
  IChainInfo,
  IChainInfo__factory,
  IERC20Driver,
  IERC20Driver__factory,
  IValidatorController,
  IValidatorController__factory,
} from '../typechain-types'
import { DiamondBaseContracts } from './DiamondBaseContracts'
import { BigNumber, Signer } from 'ethers'

export class UniversalBridgeContracts extends DiamondBaseContracts {
  public readonly chainInfo: IChainInfo
  public readonly erc20Driver: IERC20Driver
  public readonly validatorController: IValidatorController

  private _chainName: string
  private _isProxyChain: boolean
  private _nonce: BigNumber

  public get chainName() {
    return this._chainName
  }

  public get isProxyChain() {
    return this._isProxyChain
  }

  public get nonce() {
    return this._nonce
  }

  private constructor(diamondAddress: string, signer: Signer) {
    super(diamondAddress, signer)

    this.chainInfo = IChainInfo__factory.connect(diamondAddress, signer)
    this.erc20Driver = IERC20Driver__factory.connect(diamondAddress, signer)
    this.validatorController = IValidatorController__factory.connect(diamondAddress, signer)
  }

  public static readonly factory = async (
    diamondAddress: string,
    signer: Signer,
  ): Promise<UniversalBridgeContracts> => {
    const universalBridgeContracts = new UniversalBridgeContracts(diamondAddress, signer)
    universalBridgeContracts._chainName = await universalBridgeContracts.chainInfo.chainName()
    universalBridgeContracts._isProxyChain = await universalBridgeContracts.chainInfo.isProxyChain()
    universalBridgeContracts._nonce = await universalBridgeContracts.erc20Driver.nonceERC20()
    return universalBridgeContracts
  }
}
