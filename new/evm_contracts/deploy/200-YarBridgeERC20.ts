import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const deployer = signers[0]
  const validator = signers[1]

  const currentChain = ethers.utils.keccak256('YAR')
  const isProxyChain = true
  const registeredChains = [
    ethers.utils.keccak256('POLYGON'),
    ethers.utils.keccak256('BINANCE'),
    ethers.utils.keccak256('ETHEREUM'),
  ]
  const IssuedERC20Deployment = await get('IssuedERC20')

  const deployment = await deploy('YarBridgeERC20', {
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

deploy.tags = ['YarBridgeERC20']
export default deploy
