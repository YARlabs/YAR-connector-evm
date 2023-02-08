import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(4,'EthereumBridge', 'ETHEREUM', false, ['YAR', 'POLYGON', 'BINANCE'])

deploy.tags = ['EthereumBridge', 'diamondTest']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
