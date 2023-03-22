import { EvmExecutor } from '../executors/EvmExecutor'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    name,
    bridgeAddress,
    providerUrl,
    privateKey,
  }: {
    name: string
    bridgeAddress: string
    providerUrl: string
    privateKey: string
  } = CliArgsParser.parse(process.argv)

  const evmExecutor = new EvmExecutor({
    name,
    bridgeAddress,
    providerUrl,
    privateKey,
  })
  evmExecutor.init()
}

main()
