import { deployments, ethers, network } from 'hardhat'
import { BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'
import { WETH } from '../constants/externalAddresses'
import { EthersUtils } from '../utils/EthersUtils'
import ERC20MinterV2 from '../test/utils/ERC20MinterV2'

async function main() {
  const accounts = await ethers.getSigners()
  const validator = accounts[0]
  const user1 = accounts[8]
  const user2 = accounts[9]

  const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
  const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC20')
  const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC20')
  const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC20')

  const yarBridge = BridgeERC20__factory.connect(
    YarBridgeDeployment.address,
    validator,
  )
  const polygonBridge = BridgeERC20__factory.connect(
    PolygonBridgeDeployment.address,
    validator,
  )
  const binanceBridge = BridgeERC20__factory.connect(
    BinanceBridgeDeployment.address,
    validator,
  )
  const ethereumBridge = BridgeERC20__factory.connect(
    EthereumBridgeDeployment.address,
    validator,
  )

  const originalBridge = polygonBridge
  const secondaryBridge = binanceBridge
  const sender = user1
  const recipient = user2

  // Token
  const testToken = IERC20Metadata__factory.connect(WETH, user1)
  await ERC20MinterV2.mint(testToken.address, user1.address, 10000)
  const testTokenAmount = await testToken.balanceOf(user1.address)

  await testToken.approve(originalBridge.address, testTokenAmount)

  await originalBridge.connect(sender).tranferToOtherChain(
    testToken.address, // _transferedToken
    testTokenAmount, // _amount
    await secondaryBridge.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
