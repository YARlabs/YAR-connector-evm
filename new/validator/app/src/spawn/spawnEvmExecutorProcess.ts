import { EvmExecutor } from '../executors/EvmExecutor'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    name,
    tasksQueueName,
    bridgeAddress,
    providerUrl,
  }: {
    name: string
    tasksQueueName: string
    bridgeAddress: string
    providerUrl: string
  } = CliArgsParser.parse(process.argv)

  const evmExecutor = new EvmExecutor({
    name,
    tasksQueueName,
    bridgeAddress,
    providerUrl,
  })
  evmExecutor.init()
}

main()
