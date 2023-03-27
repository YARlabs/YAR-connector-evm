import { AppState } from '../AppState'
import { EvmExecutor } from '../executors/EvmExecutor'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {    
  console.log('SPAWNNNER CREATE EXEC PROC')
console.log('PARSE START')
  const {
    name,
    processName,
    bridgeAddress,
    providerUrl,
    privateKey,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrl: string
    privateKey: string
  } = CliArgsParser.parse(process.argv)

  try {
    const evmExecutor = new EvmExecutor({
      name,
      processName,
      bridgeAddress,
      providerUrl,
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
