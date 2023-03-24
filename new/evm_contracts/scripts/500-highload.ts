import { deployments, ethers, network } from 'hardhat'
import { BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'
import ERC20MinterV2 from '../test/utils/ERC20MinterV2'
import { USDT, WBTC, WETH } from '../constants/externalAddresses'
import { EthersUtils } from '../utils/EthersUtils'

async function main() {
//   await network.provider.send('evm_setAutomine', [false])
//   await network.provider.send('evm_setIntervalMining', [2000])
// return;
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

  const sender = user1
  const recipient = user2

  const allPromises: Array<Promise<any>> = []

  for(const tokenAddress of [WETH, USDT, WBTC]) {
    for(let i = 0; i < 1000; i++) {
      for(const initialBridge of [yarBridge, polygonBridge, binanceBridge, ethereumBridge]) {
        allPromises.push((async () => {
          const testToken = IERC20Metadata__factory.connect(tokenAddress, sender)
          await ERC20MinterV2.mint(testToken.address, sender.address, 10)
          const testTokenAmount = await testToken.balanceOf(sender.address)
          await testToken.approve(initialBridge.address, testTokenAmount)
          const targets = [yarBridge, polygonBridge, binanceBridge, ethereumBridge].filter(i => i != initialBridge)
          const targetBridge = targets[Math.floor(Math.random() * targets.length)]
          await initialBridge.connect(sender).tranferToOtherChain(
            testToken.address, // _transferedToken
            testTokenAmount, // _amount
            await targetBridge.currentChain(), // _targetChainName
            EthersUtils.addressToBytes(recipient.address), // _recipient
          )
        })())
       
      }
      
    }
  }

  await Promise.all(allPromises)
  console.log('ALL')
 
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
