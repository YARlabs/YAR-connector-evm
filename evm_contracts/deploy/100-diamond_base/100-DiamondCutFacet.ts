import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments

  const signers = await ethers.getSigners()
  const deployer = signers[0]

  const deployment = await deploy('DiamondCutFacet', {
    contract: 'DiamondCutFacet',
    from: deployer.address,
  })
}

deploy.tags = ['DiamondCutFacet', 'diamondBase']
export default deploy
