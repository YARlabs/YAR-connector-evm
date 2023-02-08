import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(0, 'PolygonBridgeProd', 'POLYGON', false, ['YAR', 'BINANCE', 'ETHEREUM'])

deploy.tags = ['PolygonBridgeProd']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
