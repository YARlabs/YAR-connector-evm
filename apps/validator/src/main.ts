import { DataBase } from './DataBase'
import { RenewableProcess } from './utils/RenewableProcess'

async function main() {
  const CONFIG =
    process.env.MODE == 'development'
      ? (await import('../config.development')).default
      : (await import('../config.production')).default

  const poolingInterval = 5000

  for (const key of ['erc20', 'erc721', 'erc1155']) {
    // Always in developmnet run clear db
    if (process.env.MODE == 'development') {
      await new DataBase({ dbName: key.toUpperCase(), processName: '' }).clearDB()
    }

    for (const bridgeConfig of CONFIG.bridges) {
      new RenewableProcess({
        name: `${bridgeConfig.name}Listener ${key}`,
        timeout: 5000,
        db: new DataBase({
          dbName: key.toUpperCase(),
          processName: `${bridgeConfig.name} EvmListener`,
        }),
        cmd: `CHAIN_NAME=${bridgeConfig.name} \
  BRIDGE_ADDRESS=${bridgeConfig.addresses[key]} \
  PROVIDER_URLS='${JSON.stringify(bridgeConfig.rpcUrls)}' \
  NUMBER_OF_BLOCKS_TO_CONFIRM=${1} \
  POOLING_INTERVAL=${poolingInterval} \
  SYNC_FROM=${0} \
  PROXY_CHAIN=${bridgeConfig.name} \
  npx ts-node ./src/listeners/${key}/entry_point.ts`,
      })

      new RenewableProcess({
        name: `${bridgeConfig.name}Executor ${key}`,
        timeout: 5000,
        db: new DataBase({
          dbName: key.toUpperCase(),
          processName: `${bridgeConfig.name} EvmExecutor`,
        }),
        cmd: `CHAIN_NAME=${bridgeConfig.name} \
  BRIDGE_ADDRESS=${bridgeConfig.addresses[key]} \
  PROVIDER_URLS='${JSON.stringify(bridgeConfig.rpcUrls)}' \
  PRIVATE_KEY=${bridgeConfig.privateKey} \
  POOLING_INTERVAL=${poolingInterval} \
  npx ts-node ./src/executors/${key}/entry_point.ts`,
      })
    }
  }
}

main()
