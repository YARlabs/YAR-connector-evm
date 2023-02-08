import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(1, 'YarBridge', 'YAR', true, ['POLYGON', 'BINANCE', 'ETHEREUM'])

deploy.tags = ['YarBridge', 'diamondTest']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
