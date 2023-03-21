import { EvmExecutor } from '../executors/EvmExecutor'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    name,
    bridgeAddress,
    providerUrl,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
  } = CliArgsParser.parse(process.argv)

  const evmExecutor = new EvmExecutor({
    name,
    bridgeAddress,
    providerUrl,
  })
  evmExecutor.init()
}

main()
