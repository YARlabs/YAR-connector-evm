import { DataBase } from '../../DataBase'
import { EvmListenerERC20 } from './EvmListenerERC20'

async function main() {
  // env
  const {
    CHAIN_NAME,
    BRIDGE_ADDRESS,
    PROVIDER_URLS,
    NUMBER_OF_BLOCKS_TO_CONFIRM,
    POOLING_INTERVAL,
    SYNC_FROM,
    PROXY_CHAIN,
  } = process.env

  // init db
  const db = new DataBase({ dbName: 'ERC20', processName: `${CHAIN_NAME} EvmListener` })

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

    // numberOfBlocksToConfirm
    if (!NUMBER_OF_BLOCKS_TO_CONFIRM) throw 'NUMBER_OF_BLOCKS_TO_CONFIRM null'
    if (!Number.isInteger(Number(NUMBER_OF_BLOCKS_TO_CONFIRM))) throw 'NUMBER_OF_BLOCKS_TO_CONFIRM not int'
    const numberOfBlocksToConfirm: number = Number(NUMBER_OF_BLOCKS_TO_CONFIRM)

    // poolingInterval
    if (!POOLING_INTERVAL) throw 'POOLING_INTERVAL null'
    if (!Number.isInteger(Number(POOLING_INTERVAL))) throw 'POOLING_INTERVAL not int'
    const poolingInterval = Number(POOLING_INTERVAL)

    // syncFrom
    if (SYNC_FROM !== undefined && !Number.isInteger(Number(SYNC_FROM))) throw 'SYNC_FROM not int'
    const syncFrom: number | undefined = SYNC_FROM === undefined ? undefined : Number(SYNC_FROM)

    // proxyChain
    if (!PROXY_CHAIN) throw 'PROXY_CHAIN null'
    const proxyChain: string = PROXY_CHAIN

    // Init listener
    const listener = new EvmListenerERC20({
      name,
      bridgeAddress,
      numberOfBlocksToConfirm,
      providerUrls,
      poolingInterval,
      syncFrom,
      proxyChain,
      db,
    })
    await listener.init()
  } catch (e) {
    // Catch global errors
    console.log(e)
    await db.incrementFails()
    await db.addAppError(`${e}`)
    throw e
  }
}
main()
