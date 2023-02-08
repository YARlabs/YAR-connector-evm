import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments

  const signers = await ethers.getSigners()
  const deployer = signers[0]

  const deployment = await deploy('DiamondInit', {
    contract: 'DiamondInit',
    from: deployer.address,
  })
}

deploy.tags = ['DiamondInit', 'diamondBase']
export default deploy
