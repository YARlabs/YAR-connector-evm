import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(0,'EthereumBridgeProd', 'ETHEREUM', false, ['YAR', 'POLYGON', 'BINANCE'])

deploy.tags = ['EthereumBridgeProd']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
