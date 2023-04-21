import { AppState } from './AppState'
import { RenewableProcess } from './utils/RenewableProcess'

async function main() {
  const CONFIG =
    process.env.MODE == 'development'
      ? (await import('../config.development')).default
      : (await import('../config.production')).default

  // Always in developmnet run clear db
  if (process.env.MODE == 'development') {
    await AppState.clearDB()
  }

  for (const bridgeConfig of CONFIG.bridges) {
    console.log(bridgeConfig)
    await AppState.resetFails(bridgeConfig.name + 'Listener')
    new RenewableProcess({
      name: `${bridgeConfig.name}Listener`,
      timeout: 5000,
      cmd: `npx ts-node ./src/spawn/spawnEvmListenerProcess.ts \
          name=${bridgeConfig.name} \
          processName=${bridgeConfig.name}Listener \
          bridgeAddress=${bridgeConfig.address} \
          providerUrls=[${bridgeConfig.rpcUrls.join(',')}] \
          numberOfBlocksToConfirm=${1} \
          poolingInterval=${5000} \
          syncFrom=${0} \
          proxyChain=${CONFIG.proxyBridge} \
          `,
    })

    await AppState.resetFails(bridgeConfig.name + 'Executor')
    new RenewableProcess({
      name: `${bridgeConfig.name}Executor`,
      timeout: 5000,
      cmd: `npx ts-node ./src/spawn/spawnEvmExecutorProcess.ts \
          name=${bridgeConfig.name} \
          processName=${bridgeConfig.name}Executor \
          bridgeAddress=${bridgeConfig.address} \
          providerUrls=[${bridgeConfig.rpcUrls.join(',')}] \
          privateKey=${bridgeConfig.privateKey} \
          `,
    })
  }
}

main()
