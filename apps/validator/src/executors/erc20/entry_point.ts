import { DataBase } from '../../DataBase'
import { EvmExecutorERC20 } from './EvmExecutorERC20'

async function main() {
  // env
  const { CHAIN_NAME, BRIDGE_ADDRESS, PROVIDER_URLS, PRIVATE_KEY, POOLING_INTERVAL } = process.env
  // init db
  const db = new DataBase({ dbName: 'ERC20', processName: `${CHAIN_NAME} EvmExecutor` })

  try {
    // name
    if (!CHAIN_NAME) throw 'CHAIN_NAME null'
    const name: string = CHAIN_NAME

    // bridgeAddress
    if (!BRIDGE_ADDRESS) throw 'BRIDGE_ADDRESS null'
    const bridgeAddress: string = BRIDGE_ADDRESS

    // providerUrls
    if (!PROVIDER_URLS) throw 'PROVIDER_URLS null'
    if (PROVIDER_URLS[0] != '[' && PROVIDER_URLS[PROVIDER_URLS.length - 1] != ']')
      throw 'PROVIDER_URLS not array'
    const providerUrls: Array<string> = JSON.parse(PROVIDER_URLS)

    // privateKey
    if (!PRIVATE_KEY) throw 'PRIVATE_KEY null'
    const privateKey: string = PRIVATE_KEY

    // poolingInterval
    if (!POOLING_INTERVAL) throw 'POOLING_INTERVAL null'
    if (!Number.isInteger(Number(POOLING_INTERVAL))) throw 'POOLING_INTERVAL not int'
    const poolingInterval = Number(POOLING_INTERVAL)

    // Init executor
    const executor = new EvmExecutorERC20({
      name,
      bridgeAddress,
      providerUrls,
      privateKey,
      poolingInterval,
      db,
    })
    await executor.init()
  } catch (e) {
    // Catch global errors
    console.log(e)
    await db.incrementFails()
    await db.addAppError(`${e}`)
    throw e
  }
}
main()
