import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from 'ethers_utils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('YAR')
  const isProxyChain = true
  const registeredChains = [
    EthersUtils.keccak256('POLYGON'),
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('ETHEREUM'),
    EthersUtils.keccak256('SKALE'),
  ]
  const IssuedERC721Deployment = await get('IssuedERC721')

  const deployment = await deploy('YarBridgeERC721', {
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

deploy.tags = ['YarBridge', 'YarBridgeERC721']
deploy.dependencies = ['IssuedERC721']
export default deploy
