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
  const validator = accounts[0]
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
console.log('aw1')
  const allPromises: Array<Promise<any>> = []
  const allBrdiges = [yarBridge, polygonBridge, binanceBridge, ethereumBridge]
  for (const initialBridge of allBrdiges) {
    (initialBridge as any).chain111 = await initialBridge.currentChain()
  }console.log('aw12')
  const allBalances = {}
  for (const tokenAddress of [WETH, USDT, WBTC]) {
    console.log('aw121')
    const testToken = IERC20Metadata__factory.connect(tokenAddress, sender)
    await ERC20MinterV2.mint(testToken.address, sender.address, 10)
    console.log('aw122')
    allBalances[tokenAddress] = await testToken.balanceOf(sender.address)
    console.log('aw123 ' + allBalances[tokenAddress])
    for (const initialBridge of allBrdiges) {
      await testToken.approve(initialBridge.address, allBalances[tokenAddress])
      console.log('aw124')
    }
  }
  console.log('aw13')
  const iterations = 10
  const allIterations = iterations * allBrdiges.length
  for (const tokenAddress of [WETH, USDT, WBTC]) {
    const testToken = IERC20Metadata__factory.connect(tokenAddress, sender)
    for (let i = 0; i < iterations; i++) {
      for (const initialBridge of allBrdiges) {
        console.log(i)
        allPromises.push(
          (async () => {
            const testTokenAmount = allBalances[tokenAddress].div(allIterations)
            console.log(testTokenAmount)
            const targets = [yarBridge, polygonBridge, binanceBridge, ethereumBridge].filter(
              i => i != initialBridge,
            )
            const targetBridge = targets[Math.floor(Math.random() * targets.length)]
            await initialBridge.connect(sender).tranferToOtherChain(
              testToken.address, // _transferedToken
              testTokenAmount, // _amount
              (initialBridge as any).chain111, // _targetChainName
              EthersUtils.addressToBytes(recipient.address), // _recipient
            )
          })(),
        )
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
