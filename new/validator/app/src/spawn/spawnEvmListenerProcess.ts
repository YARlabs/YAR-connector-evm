import { EvmListener } from '../listeners/EvmListener'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    name,
    tasksQueueName,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
  }: {
    name: string
    tasksQueueName: string
    bridgeAddress: string
    providerUrl: string
    numberOfBlocksToConfirm: number
    poolingInterval: number
    syncFrom: number
    proxyChain: string
  } = CliArgsParser.parse(process.argv)

  const evmListener = new EvmListener({
    name,
    tasksQueueName,
    bridgeAddress,
    providerUrl,
    numberOfBlocksToConfirm,
    poolingInterval,
    syncFrom,
    proxyChain,
  })
  await evmListener.init()
}

main()
