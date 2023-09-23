import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from 'ethers_utils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('POLYGON')
  const isProxyChain = false
  const registeredChains = [
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('ETHEREUM'),
    EthersUtils.keccak256('SKALE'),
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('ARBITRUM'),
    EthersUtils.keccak256('AVAX'),
    EthersUtils.keccak256('BASE'),
  ]
  const IssuedERC721Deployment = await get('IssuedERC721')

  const deployment = await deploy('PolygonBridgeERC721', {
    contract: 'BridgeERC721',
    from: validator.address,
    args: [
      currentChain, // _currentChain,
      isProxyChain, // _isProxyChain,
      registeredChains, // _registeredChains,
      IssuedERC721Deployment.address, // _issuedTokenImplementation,
      validator.address, // _validator
    ],
  })
}

deploy.tags = ['PolygonBridge', 'PolygonBridgeERC721']
deploy.dependencies = ['IssuedERC721']
export default deploy
