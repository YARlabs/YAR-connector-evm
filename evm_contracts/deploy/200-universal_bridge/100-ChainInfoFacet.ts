import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments

  const signers = await ethers.getSigners()
  const deployer = signers[0]

  const deployment = await deploy('ChainInfoFacet', {
    contract: 'ChainInfoFacet',
    from: deployer.address,
  })
}

deploy.tags = ['ChainInfoFacet', 'universalBridge']
export default deploy
