import { RenewableProcess } from './utils/RenewableProcess'
import CONFIG from '../config.json'

async function main() {
  for (const bridgeConfig of CONFIG.bridges) {
    new RenewableProcess({
      name: `${bridgeConfig.name} EvmListener`,
      cmd: `npx ts-node ./src/spawn/spawnEvmListenerProcess.ts 
      name=${bridgeConfig.name}
      tasksQueueName=${CONFIG.tasksQueueName}
      bridgeAddress=${bridgeConfig.address}
      providerUrl=${bridgeConfig.rpcUrl}
      numberOfBlocksToConfirm=${1}
      poolingInterval=${5000}
      syncFrom=${undefined}
      proxyChain=${CONFIG.proxyBridge}
      `,
    })

    new RenewableProcess({
      name: `${bridgeConfig.name} EvmExecutor`,
      cmd: `npx ts-node ./src/spawn/spawnEvmExecutorProcess.ts 
      name=${bridgeConfig.name}
      tasksQueueName=${CONFIG.tasksQueueName}
      bridgeAddress=${bridgeConfig.address}
      providerUrl=${bridgeConfig.rpcUrl}
      `,
    })
  }
}

main()
