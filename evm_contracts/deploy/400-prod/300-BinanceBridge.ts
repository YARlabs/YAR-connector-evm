import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(0, 'BinanceBridgeProd', 'BINANCE', false, ['YAR', 'POLYGON', 'ETHEREUM'])

deploy.tags = ['BinanceBridgeProd']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
