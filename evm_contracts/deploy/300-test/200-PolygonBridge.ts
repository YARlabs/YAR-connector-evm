import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(2, 'PolygonBridge', 'POLYGON', false, ['YAR', 'BINANCE', 'ETHEREUM'])

deploy.tags = ['PolygonBridge', 'diamondTest']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
