import { AppState } from './AppState'
import { RenewableProcess } from './utils/RenewableProcess'

async function main() {
  const CONFIG =
    process.env.MODE == 'development'
      ? (await import('../config.development')).default
      : (await import('../config.production')).default


      console.log(`process.env.MODE ${process.env.MODE}`)
      console.log(`process.env.MONGO_EXPRESS_USER ${process.env.MONGO_EXPRESS_USER}`)
      console.log(`process.env.MONGO_EXPRESS_AUTH ${process.env.MONGO_EXPRESS_AUTH}`)

  for (const bridgeConfig of CONFIG.bridges) {
    await AppState.resetFails(bridgeConfig.name + 'Listener')
    new RenewableProcess({
      name: `${bridgeConfig.name}Listener`,
      timeout: 5000,
      cmd: `npx ts-node ./src/spawn/spawnEvmListenerProcess.ts \
          name=${bridgeConfig.name} \
          processName=${bridgeConfig.name}Listener \
          bridgeAddress=${bridgeConfig.address} \
          providerUrl=${bridgeConfig.rpcUrl} \
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
          providerUrl=${bridgeConfig.rpcUrl} \
          privateKey=${bridgeConfig.privateKey} \
          `,
    })
  }
}

main()
