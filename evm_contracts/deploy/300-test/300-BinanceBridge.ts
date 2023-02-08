import { DeployFunction } from 'hardhat-deploy/types'
import { DimaondDeployUtils } from '../../utils/DiamondDeployUtils'

const deploy: DeployFunction = DimaondDeployUtils.createDeployFunction(3, 'BinanceBridge', 'BINANCE', false, ['YAR', 'POLYGON', 'ETHEREUM'])

deploy.tags = ['BinanceBridge', 'diamondTest']
deploy.dependencies = [...DimaondDeployUtils.universalBridgeDependencies()]
export default deploy
