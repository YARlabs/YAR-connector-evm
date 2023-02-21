import { BridgeDriver } from './drivers/BridgeDriver'
import { EvmBridgeDriver } from './drivers/EvmBridgeDriver'

interface ICONFIG {
  bridges: Array<{
    chainName: string
    startFromBlock: number | undefined
    driver: string
    blockConfirmationsCount: number
    address: string
    providerUrl: string
    validatorPrivateKey: string
  }>
}

async function main() {
  const configPath = process.argv[2]
  const CONFIG: ICONFIG = (await import(`../${configPath}`)).default

  const bridges: Record<string, BridgeDriver> = {}

  let proxyBridgesCount = 0
  let proxyBridge: BridgeDriver

  for (const bridgeConfig of CONFIG.bridges) {
    const driverName = bridgeConfig.driver

    if (driverName == 'EvmBridgeDriver') {
      bridges[bridgeConfig.chainName] = new EvmBridgeDriver({
        chainName: bridgeConfig.chainName,
        startFromBlock: bridgeConfig.startFromBlock,
        blockConfirmationsCount: bridgeConfig.blockConfirmationsCount,
        address: bridgeConfig.address,
        providerUrl: bridgeConfig.providerUrl,
        validatorPrivateKey: bridgeConfig.validatorPrivateKey,
      })
    } else {
      throw Error(`Config: unknown bridge driver ${driverName}`)
    }

    const bridge = bridges[bridgeConfig.chainName]!
    if (await bridge.isProxyChain()) {
      console.log(`Config: ${bridge.chainName} is PROXY`)
      proxyBridge = bridge
      proxyBridgesCount++
    }
  }

  if (proxyBridgesCount != 1) {
    throw Error(`Config error: proxy bridges count != 1, ${proxyBridgesCount} != 1`)
  }

  for (const bridge of Object.values(bridges)) {
    console.log(`${bridge.chainName}: listener enabled`)
    bridge.listenBatchTransafersERC20(async events => {
      for (const event of events) {
        // Bridges
        const originalBridge = bridges[event.originalChainName]!
        const targetBridge = bridges[event.targetChainName]!

        // Bridge to call transferFromOtherChain
        let executedBridge = targetBridge

        if (!(await bridge.isProxyChain()) && !(await targetBridge.isProxyChain())) {
          // Need transfer to proxy chain
          executedBridge = proxyBridge
        }

        // transfer
        const tokenCreateInfo = await originalBridge.getTokenCreateInfo(event.originalTokenAddress)
        await executedBridge.transferFromOtherChain(event, tokenCreateInfo)
      }
    })
  }
  console.log('Validator: Ready!')
}

main()
process.on('uncaughtException', function (error) {
  console.log('FAIL')
  main()
})
