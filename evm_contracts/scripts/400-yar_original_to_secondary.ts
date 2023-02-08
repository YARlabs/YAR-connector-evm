import { deployments, ethers, network } from 'hardhat'
import { IERC20Metadata__factory } from '../typechain-types'
import ERC20MinterV2 from '../test/utils/ERC20MinterV2'
import { WETH } from '../constants/externalAddresses'
import { UniversalBridgeContracts } from '../utils/UniversalBridgeContracts'


async function main() {
    const accounts = await ethers.getSigners()
    const yarValidator = accounts[1]
    const polygonValidator = accounts[2]
    const binanceValidator = accounts[3]
    const ethereumValidator = accounts[4]
    const user1 = accounts[8]
    const user2 = accounts[9]
  
    const YarBridgeDeployment = await deployments.get('YarBridge')
    const PolygonBridgeDeployment = await deployments.get('PolygonBridge')
    const BinanceBridgeDeployment = await deployments.get('BinanceBridge')
    const EthereumBridgeDeployment = await deployments.get('EthereumBridge')
  
    const yarBridge = await UniversalBridgeContracts.factory(YarBridgeDeployment.address, yarValidator)
    const polygonBridge = await UniversalBridgeContracts.factory(PolygonBridgeDeployment.address, polygonValidator)
    const binanceBridge = await UniversalBridgeContracts.factory(BinanceBridgeDeployment.address, binanceValidator)
    const ethereumBridge = await UniversalBridgeContracts.factory(EthereumBridgeDeployment.address, ethereumValidator)

  const originalBridge = yarBridge
  const secondaryBridge = polygonBridge
  const sender = user1
  const recipient = user2

  // Token
  const testToken = IERC20Metadata__factory.connect(WETH, user1)
  await ERC20MinterV2.mint(testToken.address, user1.address, 10000)
  const testTokenAmount = await testToken.balanceOf(user1.address)

  await testToken.approve(yarBridge.address, testTokenAmount)

  await yarBridge.erc20Driver.connect(sender).tranferToOtherChainERC20(
    testToken.address, // _transferedToken
    testTokenAmount, // _amount
    secondaryBridge.chainName, // _targetChainName
    {
      evmAddress: recipient.address,
      noEvmAddress: '',
    }, // _recipient
  )
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
