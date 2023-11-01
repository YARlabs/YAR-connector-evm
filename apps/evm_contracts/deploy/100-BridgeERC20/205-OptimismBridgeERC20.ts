import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from 'ethers_utils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('OPTIMISM')
  const isProxyChain = true
  const registeredChains = [
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('ETHEREUM'),
    EthersUtils.keccak256('POLYGON'),
    EthersUtils.keccak256('SKALE'),
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('ARBITRUM'),
    EthersUtils.keccak256('AVAX'),
    EthersUtils.keccak256('BASE'),
  ]
  const nativeName = 'Optimism Token'
  const nativeSymbol = 'OP'
  const nativeDecimals = 18
  const nativeTransferGasLimit = 35000
  const IssuedERC20Deployment = await get('IssuedERC20')

  const deployment = await deploy('OptimismBridgeERC20', {
    contract: 'BridgeERC20',
    from: validator.address,
    args: [
      currentChain, // _currentChain,
      isProxyChain, // _isProxyChain,
      registeredChains, // _registeredChains,
      IssuedERC20Deployment.address, // _issuedTokenImplementation,
      validator.address, // _validator
      nativeName, // _nativeName
      nativeSymbol, // _nativeSymbol
      nativeDecimals, // _nativeDecimals
      nativeTransferGasLimit, // _nativeTransferGasLimit
    ],
  })
}

deploy.tags = ['OptimismBridge', 'OptimismBridgeERC20']
deploy.dependencies = ['IssuedERC20']
export default deploy
