import { AppState } from '../AppState'
import { EvmExecutor } from '../executors/EvmExecutor'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {    
  const {
    name,
    processName,
    bridgeAddress,
    providerUrls,
    privateKey,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrls: string[]
    privateKey: string
  } = CliArgsParser.parse(process.argv)

  try {
    const evmExecutor = new EvmExecutor({
      name,
      processName,
      bridgeAddress,
      providerUrls,
      privateKey,
    })
    await evmExecutor.init()
  } catch (e) {
    await AppState.incrementFails(processName)
    await AppState.addAppError(`${name} spawn`, `${e}`)
    throw e
  }
}

main()
