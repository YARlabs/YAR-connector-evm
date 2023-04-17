import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from 'ethers_utils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('BINANCE')
  const isProxyChain = false
  const registeredChains = [
    EthersUtils.keccak256('POLYGON'),
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('ETHEREUM'),
    EthersUtils.keccak256('SKALE'),
  ]
  const IssuedERC1155Deployment = await get('IssuedERC1155')

  const deployment = await deploy('BinanceBridgeERC1155', {
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

deploy.tags = ['BinanceBridge', 'BinanceBridgeERC1155']
deploy.dependencies = ['IssuedERC1155']
export default deploy
