import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(0, 'YarBridgeProd', 'YAR', true, ['POLYGON', 'BINANCE', 'ETHEREUM'])

deploy.tags = ['YarBridgeProd']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
