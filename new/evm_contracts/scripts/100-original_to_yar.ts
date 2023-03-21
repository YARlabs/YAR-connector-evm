import { deployments, ethers, network } from 'hardhat'
import { BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'
import ERC20MinterV2 from '../test/utils/ERC20MinterV2'
import { WETH } from '../constants/externalAddresses'
import { EthersUtils } from '../utils/EthersUtils'

async function main() {
//   await network.provider.send('evm_setAutomine', [false])
//   await network.provider.send('evm_setIntervalMining', [2000])
// return;
  const accounts = await ethers.getSigners()
  const yarValidator = accounts[1]
  const polygonValidator = accounts[2]
  const binanceValidator = accounts[3]
  const ethereumValidator = accounts[4]
  const user1 = accounts[8]
  const user2 = accounts[9]

  const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
  const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC20')
  const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC20')
  const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC20')

  const yarBridge = BridgeERC20__factory.connect(YarBridgeDeployment.address, yarValidator)
  const polygonBridge = BridgeERC20__factory.connect(PolygonBridgeDeployment.address, polygonValidator)
  const binanceBridge = BridgeERC20__factory.connect(BinanceBridgeDeployment.address, binanceValidator)
  const ethereumBridge = BridgeERC20__factory.connect(EthereumBridgeDeployment.address, ethereumValidator)

  const originalBridge = polygonBridge
  const sender = user1
  const recipient = user2

  // Token
  const testToken = IERC20Metadata__factory.connect(WETH, sender)
  await ERC20MinterV2.mint(testToken.address, sender.address, 10000)
  const testTokenAmount = await testToken.balanceOf(sender.address)
  console.log('TEST token amount', testTokenAmount)

  await testToken.approve(originalBridge.address, testTokenAmount)

  await originalBridge.connect(sender).tranferToOtherChain(
    testToken.address, // _transferedToken
    testTokenAmount, // _amount
    await yarBridge.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
