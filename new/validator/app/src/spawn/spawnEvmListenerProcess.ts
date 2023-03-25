import { AppState } from '../AppState'
import { EvmListener } from '../listeners/EvmListener'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    name,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom: number
    proxyChain: string
  } = CliArgsParser.parse(process.argv)

  try {
    const evmListener = new EvmListener({
      name,
      bridgeAddress,
      providerUrl,
      numberOfBlocksToConfirm,
      poolingInterval,
      syncFrom,
      proxyChain,
    })
    await evmListener.init()
  } catch (e) {
    AppState.addAppError(`${name} spawn`, `${e}`)
    throw e
  }
}

main()
