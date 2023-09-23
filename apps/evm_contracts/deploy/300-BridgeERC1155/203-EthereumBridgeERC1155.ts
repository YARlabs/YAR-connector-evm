import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from 'ethers_utils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('ETHEREUM')
  const isProxyChain = false
  const registeredChains = [
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('POLYGON'),
    EthersUtils.keccak256('SKALE'),
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('ARBITRUM'),
    EthersUtils.keccak256('AVAX'),
    EthersUtils.keccak256('BASE'),
  ]
  const IssuedERC1155Deployment = await get('IssuedERC1155')

  const deployment = await deploy('EthereumBridgeERC1155', {
    contract: 'BridgeERC1155',
    from: validator.address,
    args: [
      currentChain, // _currentChain,
      isProxyChain, // _isProxyChain,
      registeredChains, // _registeredChains,
      IssuedERC1155Deployment.address, // _issuedTokenImplementation,
      validator.address, // _validator
    ],
  })
}

deploy.tags = ['EthereumBridge', 'EthereumBridgeERC1155']
deploy.dependencies = ['IssuedERC1155']
export default deploy
