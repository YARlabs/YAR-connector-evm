import { RenewableProcess } from './utils/RenewableProcess'
import CONFIG from '../config.json'
import { EthersUtils } from './utils/EthersUtils'

async function main() {
  new RenewableProcess({
    name: `QueueRouter`,
    cmd: `npx ts-node ./src/spawn/spawnQueueRouterProcess.ts \
    chains=[${CONFIG.bridges.map(bridge => EthersUtils.keccak256(bridge.name)).join(',')}]
    `,
  })
  
  for (const bridgeConfig of CONFIG.bridges) {
    new RenewableProcess({
      name: `${bridgeConfig.name} EvmListener`,
      cmd: `npx ts-node ./src/spawn/spawnEvmListenerProcess.ts \
      name=${bridgeConfig.name} \
      bridgeAddress=${bridgeConfig.address} \
      providerUrl=${bridgeConfig.rpcUrl} \
      numberOfBlocksToConfirm=${1} \
      poolingInterval=${10000} \
      syncFrom=${0} \
      proxyChain=${CONFIG.proxyBridge} \
      `,
    })

    new RenewableProcess({
      name: `${bridgeConfig.name} EvmExecutor`,
      cmd: `npx ts-node ./src/spawn/spawnEvmExecutorProcess.ts \
      name=${bridgeConfig.name} \
      bridgeAddress=${bridgeConfig.address} \
      providerUrl=${bridgeConfig.rpcUrl} \
      privateKey=${bridgeConfig.privateKey} \
      `,
    })
  }
}

main()
