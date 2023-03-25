import { deployments, ethers, network } from 'hardhat'
import { BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'
import { WETH } from '../constants/externalAddresses'
import { EthersUtils } from '../utils/EthersUtils'

async function main() {
  const accounts = await ethers.getSigners()
  const validator = accounts[1]
  const user1 = accounts[8]
  const user2 = accounts[9]

  const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
  const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC20')
  const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC20')
  const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC20')

  const yarBridge = BridgeERC20__factory.connect(YarBridgeDeployment.address, validator)
  const polygonBridge = BridgeERC20__factory.connect(PolygonBridgeDeployment.address, validator)
  const binanceBridge = BridgeERC20__factory.connect(BinanceBridgeDeployment.address, validator)
  const ethereumBridge = BridgeERC20__factory.connect(EthereumBridgeDeployment.address, validator)

  const originalBridge = polygonBridge
  const sender = user2
  const recipient = user1

  // Token
  const testToken = IERC20Metadata__factory.connect(WETH, user1)

  const issuedTokenAddress = await yarBridge.getIssuedTokenAddress(
    await originalBridge.currentChain(),
    EthersUtils.addressToBytes(testToken.address),
  )
  const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, user2)
  const issuedTokenBalance = await issuedToken.balanceOf(user2.address)
  
  await yarBridge.connect(sender).tranferToOtherChain(
    issuedToken.address, // _transferedToken
    issuedTokenBalance, // _amount
    await originalBridge.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
    // _recipient
  )
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
