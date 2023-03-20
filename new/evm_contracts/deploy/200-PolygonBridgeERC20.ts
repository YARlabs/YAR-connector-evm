import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from '../utils/EthersUtils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const deployer = signers[0]
  const validator = signers[1]

  const currentChain = EthersUtils.keccak256('POLYGON')
  const isProxyChain = true
  const registeredChains = [
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('ETHEREUM'),
  ]
  const IssuedERC20Deployment = await get('IssuedERC20')

  const deployment = await deploy('PolygonBridgeERC20', {
    contract: 'BridgeERC20',
    from: deployer.address,
    args: [
      currentChain, // _currentChain,
      isProxyChain, // _isProxyChain,
      registeredChains, // _registeredChains,
      IssuedERC20Deployment.address, // _issuedTokenImplementation,
      validator.address, // _validator
    ],
  })
}

deploy.tags = ['PolygonBridgeERC20']
deploy.dependencies = ['IssuedERC20']
export default deploy
